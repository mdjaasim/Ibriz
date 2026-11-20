// One-off: fills the `daily` chart table with the last 30 days so charts are not empty on day one.
// Gold: goldprice.dev daily bars (free, keyless, 30 days; attribution link required in the app).
// USD/INR: Frankfurter daily reference rates. Duty and premium come from wrangler.toml, never typed here.
// Rows are marked n = 0 (no live readings behind them). Usage: node scripts/backfill.mjs > backfill.sql
//   then: npx wrangler d1 execute ibriz --remote --file=backfill.sql
import { readFileSync } from 'node:fs';
import { spotInrPerGram, retail24PerGram } from '../src/rate.js';

const toml = readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8');
const v = (k) => Number(new RegExp(`^${k}\\s*=\\s*"([^"]+)"`, 'm').exec(toml)?.[1]);
const duty = v('DUTY'), premium = v('PREMIUM');
if (!Number.isFinite(duty) || !Number.isFinite(premium)) throw new Error('DUTY/PREMIUM not found in wrangler.toml');

const day = (d) => d.toISOString().slice(0, 10);
const to = new Date(), from = new Date(Date.now() - 29 * 864e5);

const bars = await (await fetch(`https://api.goldprice.dev/v1/bars?symbol=XAU-USD-SPOT&interval=1d&from=${day(from)}&to=${day(to)}&limit=100`)).json();
if (!bars.bars) throw new Error('gold history failed: ' + JSON.stringify(bars));
const fx = (await (await fetch(`https://api.frankfurter.dev/v1/${day(from)}..${day(to)}?base=USD&symbols=INR`)).json()).rates;
const fxDates = Object.keys(fx).sort();
const fxFor = (d) => { const hit = fxDates.filter((x) => x <= d).pop() ?? fxDates[0]; return fx[hit].INR; };

const today = day(to);
const rows = bars.bars
  .filter((b) => b.is_closed && day(new Date(b.bar_start)) < today && b.close)
  .map((b) => {
    const d = day(new Date(b.bar_start)), rate = fxFor(d);
    const r = (usd) => retail24PerGram(spotInrPerGram(Number(usd), rate), duty, premium);
    return { bucket: Date.parse(d + 'T00:00:00Z'), open: r(b.open), high: r(b.high), low: r(b.low), close: r(b.close) };
  })
  .sort((a, b) => a.bucket - b.bucket);

console.log('-- backfill: ' + rows.length + ' daily rows, duty ' + duty + ', premium ' + premium);
for (const r of rows) {
  console.log(`INSERT OR IGNORE INTO daily (bucket, open, high, low, close, n) VALUES (${r.bucket}, ${r.open.toFixed(2)}, ${r.high.toFixed(2)}, ${r.low.toFixed(2)}, ${r.close.toFixed(2)}, 0);`);
}
