import { test } from 'node:test';
import assert from 'node:assert/strict';
import { b64urlEncode, b64urlDecode } from '../src/b64.js';
import {
  isAllowedEndpoint, validateAlertInput, isTriggered, buildPayload, inQuietHours, inr, perGramFor, staysActiveAfterFiring,
} from '../src/alerts.js';
import { encryptPayload, importVapid, vapidJwt } from '../src/push.js';
import { checkAlerts } from '../src/alerts-api.js';

const latest = { rate24: 12000, change24h: { abs: -200, pct: -1.6 } };
const base = { active: 1, city_adjust: 0 };
const IST = (y, m, d, h) => Date.UTC(y, m, d, h) - 5.5 * 3600e3; // build a UTC ms from IST wall clock

test('base64url round trip, no padding', () => {
  const bytes = new Uint8Array([251, 255, 254, 0, 1, 2, 3]);
  const text = b64urlEncode(bytes);
  assert.ok(!/[+/=]/.test(text));
  assert.deepEqual(b64urlDecode(text), bytes);
});

test('only known push hosts are allowed', () => {
  assert.ok(isAllowedEndpoint('https://fcm.googleapis.com/fcm/send/abc'));
  assert.ok(isAllowedEndpoint('https://web.push.apple.com/xyz'));
  assert.ok(isAllowedEndpoint('https://updates.push.services.mozilla.com/wpush/v2/x'));
  assert.ok(!isAllowedEndpoint('http://fcm.googleapis.com/x'));
  assert.ok(!isAllowedEndpoint('https://evil.example.com/x'));
  assert.ok(!isAllowedEndpoint('https://fcm.googleapis.com.evil.com/x'));
  assert.ok(!isAllowedEndpoint('not a url'));
});

const sub = { endpoint: 'https://fcm.googleapis.com/fcm/send/abc', keys: { p256dh: 'B'.repeat(87), auth: 'a'.repeat(22) } };

test('validation accepts a good price alert and rejects bad input', () => {
  const ok = validateAlertInput({ subscription: sub, kind: 'price', karat: 22, direction: 'below', target: 11200, cityAdjust: 1 });
  assert.equal(ok.ok, true);
  assert.equal(ok.value.quiet, 1);
  assert.equal(validateAlertInput({ subscription: sub, kind: 'price', karat: 22, direction: 'sideways', target: 1 }).ok, false);
  assert.equal(validateAlertInput({ subscription: sub, kind: 'price', karat: 21, direction: 'below', target: 1 }).ok, false);
  assert.equal(validateAlertInput({ subscription: sub, kind: 'price', karat: 22, direction: 'below', target: -5 }).ok, false);
  assert.equal(validateAlertInput({ subscription: { ...sub, endpoint: 'https://evil.com/x' }, kind: 'monthly' }).ok, false);
  assert.equal(validateAlertInput({ subscription: sub, kind: 'monthly' }).ok, true);
});

test('price alert conditions use the rate the person sees', () => {
  const below = { ...base, kind: 'price', karat: 22, direction: 'below', target: 11000 }; // 22K = 10,992
  assert.equal(isTriggered(below, latest, Date.now()), true);
  assert.equal(isTriggered({ ...below, target: 10900 }, latest, Date.now()), false);
  const above = { ...base, kind: 'price', karat: 24, direction: 'above', target: 12000 };
  assert.equal(isTriggered(above, latest, Date.now()), true);
  assert.equal(isTriggered({ ...above, city_adjust: -1 }, latest, Date.now()), false); // 11,880 with the city adjustment
  assert.equal(isTriggered({ ...above, active: 0 }, latest, Date.now()), false);
  assert.equal(perGramFor(latest, 22), 12000 * 0.916);
});

test('daily move fires once per IST day', () => {
  const move = { ...base, kind: 'move', karat: 22, target: 1.5 };
  const t = IST(2026, 10, 20, 11);
  assert.equal(isTriggered(move, latest, t), true);
  assert.equal(isTriggered({ ...move, target: 2 }, latest, t), false);
  assert.equal(isTriggered({ ...move, last_fired: IST(2026, 10, 20, 9) }, latest, t), false);
  assert.equal(isTriggered({ ...move, last_fired: IST(2026, 10, 19, 9) }, latest, t), true);
  assert.equal(isTriggered(move, { rate24: 1, change24h: null }, t), false);
});

test('monthly check: the 1st, from 9 am IST, once a month', () => {
  const m = { ...base, kind: 'monthly' };
  assert.equal(isTriggered(m, latest, IST(2026, 11, 1, 10)), true);
  assert.equal(isTriggered(m, latest, IST(2026, 11, 1, 8)), false);
  assert.equal(isTriggered(m, latest, IST(2026, 11, 2, 10)), false);
  assert.equal(isTriggered({ ...m, last_fired: IST(2026, 11, 1, 9) }, latest, IST(2026, 11, 1, 15)), false);
  assert.equal(isTriggered({ ...m, last_fired: IST(2026, 10, 1, 9) }, latest, IST(2026, 11, 1, 15)), true);
});

test('quiet hours span midnight in IST', () => {
  assert.equal(inQuietHours(IST(2026, 10, 20, 23), 22, 7), true);
  assert.equal(inQuietHours(IST(2026, 10, 20, 3), 22, 7), true);
  assert.equal(inQuietHours(IST(2026, 10, 20, 7), 22, 7), false);
  assert.equal(inQuietHours(IST(2026, 10, 20, 12), 22, 7), false);
  assert.equal(inQuietHours(IST(2026, 10, 20, 12), 9, 17), true);
});

test('price alerts switch off after firing, the others stay armed', () => {
  assert.equal(staysActiveAfterFiring({ kind: 'price' }), false);
  assert.equal(staysActiveAfterFiring({ kind: 'move' }), true);
  assert.equal(staysActiveAfterFiring({ kind: 'monthly' }), true);
});

test('notification text is short, specific and never says buy or sell or names holdings', () => {
  assert.equal(inr(551081), '5,51,081');
  assert.equal(inr(11200), '11,200');
  const p = buildPayload({ id: 'x', kind: 'price', karat: 22, direction: 'below', target: 11200, city: 'Trichy', city_adjust: 0 }, { rate24: 12205 });
  assert.equal(p.title, '22K is below ₹11,200');
  assert.match(p.body, /^Now ₹11,180 a gram in Trichy\./);
  const m = buildPayload({ id: 'y', kind: 'move', karat: 22, city: '', city_adjust: 0 }, latest);
  assert.equal(m.title, 'Gold moved 1.6% today');
  assert.equal(m.body, '22K is down ₹183 since yesterday.');
  const mo = buildPayload({ id: 'z', kind: 'monthly' }, latest);
  assert.equal(mo.title, 'Your monthly gold check');
  for (const x of [p, m, mo]) assert.doesNotMatch(JSON.stringify(x), /\b(buy|sell)\b/i);
});

// --- Web Push encryption: encrypt, then decrypt the way a browser would (RFC 8291 section 3.4) ---
async function decryptLikeBrowser(body, uaPrivate, uaPublicRaw, authSecret) {
  const salt = body.slice(0, 16);
  const idlen = body[20];
  const asPublic = body.slice(21, 21 + idlen);
  const cipher = body.slice(21 + idlen);
  const enc = new TextEncoder();
  const asKey = await crypto.subtle.importKey('raw', asPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const ecdh = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: asKey }, uaPrivate, 256));
  const hk = async (ikm, s, info, n) =>
    new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt: s, info }, await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']), n * 8));
  const keyInfo = new Uint8Array([...enc.encode('WebPush: info\0'), ...uaPublicRaw, ...asPublic]);
  const ikm = await hk(ecdh, authSecret, keyInfo, 32);
  const cek = await hk(ikm, salt, enc.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hk(ikm, salt, enc.encode('Content-Encoding: nonce\0'), 12);
  const plain = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce }, await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['decrypt']), cipher));
  assert.equal(plain[plain.length - 1], 2); // padding delimiter of the last record
  return new TextDecoder().decode(plain.slice(0, -1));
}

test('Web Push payload encrypts and a receiver can read it', async () => {
  const ua = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const uaPub = new Uint8Array(await crypto.subtle.exportKey('raw', ua.publicKey));
  const auth = crypto.getRandomValues(new Uint8Array(16));
  const message = JSON.stringify({ title: '22K is below ₹11,200', body: 'Now ₹11,180 a gram.' });
  const body = await encryptPayload(message, b64urlEncode(uaPub), b64urlEncode(auth));
  assert.deepEqual([...body.slice(16, 20)], [0, 0, 16, 0]); // record size 4096
  assert.equal(body[20], 65);
  assert.equal(await decryptLikeBrowser(body, ua.privateKey, uaPub, auth), message);
});

test('VAPID JWT is ES256 and verifies with the public key', async () => {
  const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const pub = new Uint8Array(await crypto.subtle.exportKey('raw', pair.publicKey));
  const d = (await crypto.subtle.exportKey('jwk', pair.privateKey)).d;
  const signKey = await importVapid(b64urlEncode(pub), d);
  const jwt = await vapidJwt('https://fcm.googleapis.com', 'mailto:a@example.com', signKey, 1_000_000);
  const [h, c, s] = jwt.split('.');
  assert.deepEqual(JSON.parse(new TextDecoder().decode(b64urlDecode(h))), { typ: 'JWT', alg: 'ES256' });
  const claims = JSON.parse(new TextDecoder().decode(b64urlDecode(c)));
  assert.equal(claims.aud, 'https://fcm.googleapis.com');
  assert.equal(claims.exp, 1_000_000 + 43200);
  const ok = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, pair.publicKey, b64urlDecode(s), new TextEncoder().encode(`${h}.${c}`));
  assert.equal(ok, true);
});

// --- checkAlerts with a fake D1 and fake push service ---
test('checkAlerts sends at most the cap, drops gone subscriptions, switches price alerts off', async () => {
  const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign']);
  const pub = b64urlEncode(new Uint8Array(await crypto.subtle.exportKey('raw', pair.publicKey)));
  const d = (await crypto.subtle.exportKey('jwk', pair.privateKey)).d;
  const ua = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const p256dh = b64urlEncode(new Uint8Array(await crypto.subtle.exportKey('raw', ua.publicKey)));
  const auth = b64urlEncode(crypto.getRandomValues(new Uint8Array(16)));
  const mk = (id, endpoint) => ({ id, endpoint, p256dh, auth, kind: 'price', karat: 24, direction: 'above', target: 1, quiet: 0, city_adjust: 0, city: '', active: 1, created: 1 });
  const rows = [mk('a', 'https://fcm.googleapis.com/1'), mk('b', 'https://fcm.googleapis.com/2'), mk('c', 'https://fcm.googleapis.com/3'), mk('d', 'https://fcm.googleapis.com/4')];
  const log = [];
  const env = {
    VAPID_PUBLIC: pub, VAPID_PRIVATE: d, VAPID_SUBJECT: 'mailto:a@example.com', MAX_PUSH_PER_CYCLE: '2',
    DB: {
      prepare(sql) {
        return {
          all: async () => ({ results: rows.filter((r) => r.active) }),
          bind: (...args) => ({ run: async () => { log.push([sql.split(' ').slice(0, 2).join(' '), ...args]); if (sql.startsWith('UPDATE')) { const r = rows.find((x) => x.id === args[2]); r.active = args[1]; r.last_fired = args[0]; } return {}; } }),
        };
      },
    },
  };
  const responses = [201, 410];
  const calls = [];
  const fakeFetch = async (url, init) => { calls.push({ url, headers: init.headers }); return { status: responses.shift() }; };
  const res = await checkAlerts(env, { rate24: 12000, change24h: null }, Date.now(), { fetch: fakeFetch });
  assert.equal(res.sent, 2); // capped at 2 of the 4 due
  assert.equal(calls.length, 2);
  assert.match(calls[0].headers.authorization, /^vapid t=[\w-]+\.[\w-]+\.[\w-]+, k=/);
  assert.equal(calls[0].headers['content-encoding'], 'aes128gcm');
  assert.equal(rows[0].active, 0); // fired once, now off
  assert.ok(log.some((l) => l[0] === 'DELETE FROM' && l[1] === 'https://fcm.googleapis.com/2')); // 410: subscription removed
  assert.equal(rows[2].active, 1); // not reached this cycle, stays armed
});

test('checkAlerts does nothing when push is not set up', async () => {
  assert.deepEqual(await checkAlerts({ DB: null }, { rate24: 1 }), { sent: 0 });
});
