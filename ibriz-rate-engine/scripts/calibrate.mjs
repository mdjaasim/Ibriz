// Compare our spot-based rate with real quotes you noted down, and print the
// shop premium each quote implies.
//
// Usage:
//   node scripts/calibrate.mjs log.csv calibration/quotes.csv
//
// log.csv     = download from https://YOUR-WORKER/api/log.csv?days=14 (add &token=... if you set one)
// quotes.csv  = your notes, one line each: date_time_ist,karat,price_per_gram,source
//               e.g.  2026-11-23 11:30,22,12470,Chennai jeweller
// Write the price BEFORE GST and making charges, per gram.

import { readFileSync } from 'node:fs';

const [logPath, quotesPath] = process.argv.slice(2);
if (!logPath || !quotesPath) {
  console.error('Usage: node scripts/calibrate.mjs log.csv calibration/quotes.csv');
  process.exit(1);
}

const PURITY = { 24: 1, 22: 0.916, 18: 0.75, 14: 0.585 };
const MAX_GAP_MS = 30 * 60 * 1000; // a quote must be within 30 minutes of a logged reading

const rows = (path) =>
  readFileSync(path, 'utf8').trim().split(/\r?\n/).slice(1).filter(Boolean).map((l) => l.split(','));

// Log columns: time_utc,xau_usd,usd_inr,spot_inr_per_g,rate24_per_g,rate22,rate18,duty,premium,fx_stale,accepted
const log = rows(logPath)
  .map((c) => ({ ts: Date.parse(c[0]), spot: Number(c[3]), duty: Number(c[7]), ok: c[10] === '1' }))
  .filter((r) => r.ok && Number.isFinite(r.ts))
  .sort((a, b) => a.ts - b.ts);

if (log.length === 0) {
  console.error('No accepted readings in the log yet.');
  process.exit(1);
}

function nearest(ts) {
  let best = null;
  for (const r of log) if (best === null || Math.abs(r.ts - ts) < Math.abs(best.ts - ts)) best = r;
  return best;
}

const bySource = new Map();
console.log('quote time (IST)   karat  quote/g   spot/g   implied premium  source');
for (const [when, karat, price, ...rest] of rows(quotesPath)) {
  const source = rest.join(',').trim() || 'unknown';
  const ts = Date.parse(when.trim().replace(' ', 'T') + ':00+05:30');
  const purity = PURITY[Number(karat)];
  const q = Number(price);
  if (!Number.isFinite(ts) || !purity || !Number.isFinite(q)) {
    console.log(`skipped (cannot read): ${when},${karat},${price}`);
    continue;
  }
  const r = nearest(ts);
  if (Math.abs(r.ts - ts) > MAX_GAP_MS) {
    console.log(`skipped (no log reading within 30 minutes): ${when}`);
    continue;
  }
  const pure24 = q / purity;
  const premium = pure24 / (r.spot * (1 + r.duty)) - 1;
  if (!bySource.has(source)) bySource.set(source, []);
  bySource.get(source).push(premium);
  console.log(
    `${when.padEnd(18)} ${String(karat).padEnd(5)}  ${q.toFixed(0).padStart(7)}  ${r.spot.toFixed(0).padStart(7)}   ${(premium * 100).toFixed(2).padStart(8)}%        ${source}`
  );
}

const median = (a) => {
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
console.log('\nMedian implied premium by source:');
for (const [source, list] of bySource) {
  console.log(`  ${source.padEnd(24)} ${(median(list) * 100).toFixed(2)}%  (${list.length} quotes, range ${(Math.min(...list) * 100).toFixed(2)}% to ${(Math.max(...list) * 100).toFixed(2)}%)`);
}
console.log('\nPut your chosen value into PREMIUM in wrangler.toml as a fraction, e.g. 0.03 for 3%.');
