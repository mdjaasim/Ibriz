import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { runUpdate } from '../src/update.js';

// --- tiny in-memory stand-ins for Cloudflare KV and D1 ---
function makeEnv(extra = {}) {
  const kv = new Map();
  const rows = [];
  const db = {
    prepare(sql) {
      return {
        bind(...args) {
          return {
            async run() {
              if (sql.startsWith('INSERT INTO readings')) {
                const [ts, xau_usd, usd_inr, spot_inr_g, rate24, duty, premium, fx_stale, ok] = args;
                rows.push({ ts, xau_usd, usd_inr, spot_inr_g, rate24, duty, premium, fx_stale, ok });
              }
              return {};
            },
            async first() {
              const [maxTs] = args;
              const hit = rows.filter((r) => r.ok === 1 && r.ts <= maxTs).sort((a, b) => b.ts - a.ts)[0];
              return hit ? { rate24: hit.rate24 } : null;
            },
          };
        },
      };
    },
  };
  const RATES = {
    async get(key, type) {
      const v = kv.get(key);
      if (v === undefined) return null;
      return type === 'json' ? JSON.parse(v) : v;
    },
    async put(key, value) {
      kv.set(key, value);
    },
  };
  return { env: { RATES, DB: db, DUTY: '0.15', PREMIUM: '0.03', MAX_JUMP: '0.05', ...extra }, rows, kv };
}

let goldPrice;
let fxCalls;
const realFetch = globalThis.fetch;

beforeEach(() => {
  goldPrice = 3569.62;
  fxCalls = 0;
  globalThis.fetch = async (url) => {
    const u = String(url);
    if (u.includes('gold-api.com')) {
      return new Response(JSON.stringify({ price: goldPrice, updatedAt: '2026-11-20T12:59:05Z', symbol: 'XAU' }));
    }
    if (u.includes('frankfurter')) {
      fxCalls++;
      return new Response(JSON.stringify({ base: 'USD', date: '2026-11-20', rates: { INR: 92.2 } }));
    }
    throw new Error('unexpected fetch ' + u);
  };
});
afterEach(() => {
  globalThis.fetch = realFetch;
});

const MIN = 60 * 1000;
const DAY = 24 * 60 * MIN;
const T0 = Date.parse('2026-11-20T00:00:00Z');

test('first update publishes a latest rate with all karats and no 24h change yet', async () => {
  const { env, rows, kv } = makeEnv();
  const res = await runUpdate(env, T0);
  assert.equal(res.ok, true);
  const latest = JSON.parse(kv.get('latest'));
  // 10,581.9 * 1.15 * 1.03 = about 12,534.7
  assert.ok(Math.abs(latest.rate24 - 12534.7) < 2, `rate24 was ${latest.rate24}`);
  assert.ok(latest.rates[22].perSovereign > 0);
  assert.equal(latest.change24h, null);
  assert.equal(latest.fxStale, false);
  assert.equal(rows.length, 1);
});

test('FX is cached: two updates in a row call the FX source once', async () => {
  const { env } = makeEnv();
  await runUpdate(env, T0);
  await runUpdate(env, T0 + 5 * MIN);
  assert.equal(fxCalls, 1);
});

test('a 10% jump is rejected and logged, then accepted after 3 rejects in a row', async () => {
  const { env, rows, kv } = makeEnv();
  await runUpdate(env, T0);
  const before = JSON.parse(kv.get('latest')).rate24;

  goldPrice = 3569.62 * 1.1;
  for (let i = 1; i <= 3; i++) {
    const r = await runUpdate(env, T0 + i * 5 * MIN);
    assert.equal(r.ok, false);
  }
  assert.equal(JSON.parse(kv.get('latest')).rate24, before, 'users still see the last good rate');

  const fourth = await runUpdate(env, T0 + 20 * MIN);
  assert.equal(fourth.ok, true, 'market really moved, so the new level is accepted');
  assert.ok(JSON.parse(kv.get('latest')).rate24 > before * 1.09);
  assert.equal(rows.length, 5, 'every reading is logged');
  assert.equal(rows.filter((r) => r.ok === 0).length, 3);
});

test('24h change is measured against the last good reading from a day ago', async () => {
  const { env, kv } = makeEnv();
  await runUpdate(env, T0);
  goldPrice = 3569.62 * 1.02;
  await runUpdate(env, T0 + DAY + MIN);
  const latest = JSON.parse(kv.get('latest'));
  assert.ok(latest.change24h, 'change is present');
  assert.ok(Math.abs(latest.change24h.pct - 2) < 0.05, `pct was ${latest.change24h.pct}`);
  assert.ok(latest.change24h.abs > 0);
});

test('with no FX source and no cache, update fails loudly instead of publishing a wrong rate', async () => {
  const { env } = makeEnv();
  globalThis.fetch = async (url) => {
    if (String(url).includes('gold-api.com')) return new Response(JSON.stringify({ price: 3569.62 }));
    return new Response('nope', { status: 500 });
  };
  await assert.rejects(() => runUpdate(env, T0), /No USD\/INR rate/);
});

test('FX_FALLBACK setting is used only when everything else fails, and flagged stale', async () => {
  const { env, kv } = makeEnv({ FX_FALLBACK: '90' });
  globalThis.fetch = async (url) => {
    if (String(url).includes('gold-api.com')) return new Response(JSON.stringify({ price: 3569.62 }));
    return new Response('nope', { status: 500 });
  };
  await runUpdate(env, T0);
  const latest = JSON.parse(kv.get('latest'));
  assert.equal(latest.fxStale, true);
  assert.equal(latest.usdInr, 90);
});
