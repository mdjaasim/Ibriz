// Fetchers for the outside world. Each returns plain numbers or throws a clear Error.

import { isUsablePrice } from './rate.js';

const GOLD_URL = 'https://api.gold-api.com/price/XAU';

// USD -> INR providers, tried in order. Frankfurter serves official reference
// rates, normally updated once per working day, so INR moves in daily steps.
const FX_URLS = [
  'https://api.frankfurter.dev/v2/rates?base=USD&quotes=INR',
  'https://api.frankfurter.dev/v1/latest?base=USD&symbols=INR',
];

const FX_CACHE_KEY = 'fx';
const FX_CACHE_SECONDS = 3600; // ask the FX source at most about once an hour

async function getJson(url, timeoutMs = 8000) {
  const res = await fetch(url, {
    headers: { accept: 'application/json', 'user-agent': 'ibriz-rate-engine/0.1' },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.json();
}

/** Spot gold in USD per troy ounce. Response shape seen on 20 Nov 2026: {price, updatedAt, ...}. */
export async function fetchGoldUsd() {
  const data = await getJson(GOLD_URL);
  const price = Number(data.price);
  if (!isUsablePrice(price)) throw new Error('gold-api.com returned no usable price');
  return { xauUsd: price, updatedAt: data.updatedAt ?? null };
}

/** Pull the INR rate out of either known response shape. Returns a number or null. */
export function parseFxResponse(json) {
  if (!json || typeof json !== 'object') return null;
  // v1 shape: { base, date, rates: { INR: 83.1 } }
  if (json.rates && typeof json.rates === 'object' && !Array.isArray(json.rates)) {
    const v = Number(json.rates.INR);
    if (isUsablePrice(v)) return { rate: v, date: json.date ?? null };
  }
  // v2 shapes: array of { quote: 'INR', rate: 83.1, date } or { rates: [ ... ] }
  const list = Array.isArray(json) ? json : Array.isArray(json.rates) ? json.rates : null;
  if (list) {
    const item = list.find((r) => (r.quote ?? r.currency ?? r.to) === 'INR');
    const v = Number(item?.rate);
    if (isUsablePrice(v)) return { rate: v, date: item.date ?? json.date ?? null };
  }
  return null;
}

/** USD/INR, cached in KV. Falls back to the last cached value, then to env.FX_FALLBACK. */
export async function getUsdInr(env) {
  const cached = await env.RATES.get(FX_CACHE_KEY, 'json');
  const fresh = cached && Date.now() - cached.fetchedAt < FX_CACHE_SECONDS * 1000;
  if (fresh) return { ...cached, stale: false };

  for (const url of FX_URLS) {
    try {
      const parsed = parseFxResponse(await getJson(url));
      if (parsed) {
        const value = { rate: parsed.rate, date: parsed.date, fetchedAt: Date.now(), source: url };
        await env.RATES.put(FX_CACHE_KEY, JSON.stringify(value));
        return { ...value, stale: false };
      }
    } catch (err) {
      console.warn('FX provider failed:', String(err));
    }
  }
  if (cached) return { ...cached, stale: true };
  const fallback = Number(env.FX_FALLBACK);
  if (isUsablePrice(fallback)) {
    return { rate: fallback, date: null, fetchedAt: 0, source: 'FX_FALLBACK setting', stale: true };
  }
  throw new Error('No USD/INR rate available: providers failed and no cache or FX_FALLBACK set');
}
