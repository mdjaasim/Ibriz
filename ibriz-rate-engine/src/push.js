// Web Push for Workers, with WebCrypto only (no npm packages).
//   RFC 8291  message encryption (aes128gcm)
//   RFC 8188  content-coding
//   RFC 8292  VAPID (ES256 JWT)
//   RFC 8030  delivery (POST with TTL)
import { b64urlDecode, b64urlEncode } from './b64.js';

const enc = new TextEncoder();
const concat = (...parts) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
};

async function hkdf(ikm, salt, info, bytes) {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, key, bytes * 8));
}

/**
 * Encrypts `payload` (string or bytes) for a push subscription.
 * p256dh / auth are the base64url values from PushSubscription.toJSON().keys.
 * `testing` lets a test fix the ephemeral key and salt; real sends never pass it.
 */
export async function encryptPayload(payload, p256dh, auth, testing = {}) {
  const uaPublic = b64urlDecode(p256dh); // 65 bytes
  const authSecret = b64urlDecode(auth); // 16 bytes
  const plaintext = typeof payload === 'string' ? enc.encode(payload) : payload;

  const eph = testing.ephemeral ?? (await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']));
  const asPublic = new Uint8Array(await crypto.subtle.exportKey('raw', eph.publicKey)); // 65 bytes
  const uaKey = await crypto.subtle.importKey('raw', uaPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const ecdh = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, eph.privateKey, 256));

  const keyInfo = concat(enc.encode('WebPush: info\0'), uaPublic, asPublic);
  const ikm = await hkdf(ecdh, authSecret, keyInfo, 32);

  const salt = testing.salt ?? crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(ikm, salt, enc.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(ikm, salt, enc.encode('Content-Encoding: nonce\0'), 12);

  // one record: data + 0x02 delimiter (last record), no extra padding
  const record = concat(plaintext, new Uint8Array([2]));
  const aes = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aes, record));

  const rs = new Uint8Array([0, 0, 0x10, 0]); // record size 4096, big endian
  return concat(salt, rs, new Uint8Array([asPublic.length]), asPublic, cipher);
}

/** Imports the VAPID key pair: public = base64url 65-byte point, private = base64url 32-byte scalar. */
export async function importVapid(publicKey, privateKey) {
  const pub = b64urlDecode(publicKey);
  const jwk = { kty: 'EC', crv: 'P-256', x: b64urlEncode(pub.slice(1, 33)), y: b64urlEncode(pub.slice(33, 65)), d: privateKey, ext: true };
  return crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
}

/** Signed VAPID JWT for one push service origin. Valid up to 12 hours; reuse it per origin within a cycle. */
export async function vapidJwt(audience, subject, signKey, nowSeconds = Math.floor(Date.now() / 1000)) {
  const header = b64urlEncode(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const claims = b64urlEncode(enc.encode(JSON.stringify({ aud: audience, exp: nowSeconds + 12 * 3600, sub: subject })));
  const data = enc.encode(`${header}.${claims}`);
  const sig = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, signKey, data)); // raw r||s = JOSE format
  return `${header}.${claims}.${b64urlEncode(sig)}`;
}

/**
 * Sends one notification. Returns { status, gone } where gone = the subscription no longer exists (404/410).
 * `ctx` caches the imported key and per-origin JWTs for a whole update cycle.
 */
export async function sendPush(sub, payloadObject, env, ctx = {}, options = {}) {
  const url = new URL(sub.endpoint);
  ctx.signKey ??= await importVapid(env.VAPID_PUBLIC, env.VAPID_PRIVATE);
  ctx.jwts ??= {};
  ctx.jwts[url.origin] ??= await vapidJwt(url.origin, env.VAPID_SUBJECT, ctx.signKey);

  const body = await encryptPayload(JSON.stringify(payloadObject), sub.p256dh, sub.auth);
  const res = await (options.fetch ?? fetch)(sub.endpoint, {
    method: 'POST',
    headers: {
      authorization: `vapid t=${ctx.jwts[url.origin]}, k=${env.VAPID_PUBLIC}`,
      'content-encoding': 'aes128gcm',
      'content-type': 'application/octet-stream',
      ttl: String(options.ttl ?? 6 * 3600),
      urgency: 'normal',
    },
    body,
  });
  return { status: res.status, gone: res.status === 404 || res.status === 410 };
}
