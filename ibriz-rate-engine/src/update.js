// One update cycle: fetch gold and USD/INR, compute the Indian rate, log it, publish it.

import { fetchGoldUsd, getUsdInr } from './sources.js';
import {
  spotInrPerGram,
  retail24PerGram,
  ratesByKarat,
  isSaneJump,
  changeAgainst,
} from './rate.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_REJECTS_IN_A_ROW = 3; // after this many, accept the new level: the market really moved

export async function runUpdate(env, now = Date.now()) {
  const duty = Number(env.DUTY ?? 0.15);
  const premium = Number(env.PREMIUM ?? 0.03);
  const maxJump = Number(env.MAX_JUMP ?? 0.05);

  const gold = await fetchGoldUsd();
  const fx = await getUsdInr(env);

  const spot = spotInrPerGram(gold.xauUsd, fx.rate);
  const rate24 = retail24PerGram(spot, duty, premium);

  const previous = await env.RATES.get('latest', 'json');
  const rejects = Number((await env.RATES.get('rejects')) ?? 0);
  let ok = isSaneJump(rate24, previous?.rate24, maxJump);
  if (!ok && rejects >= MAX_REJECTS_IN_A_ROW) ok = true;

  // Every reading is logged, good or rejected, so we can audit later.
  await env.DB.prepare(
    'INSERT INTO readings (ts, xau_usd, usd_inr, spot_inr_g, rate24, duty, premium, fx_stale, ok) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  )
    .bind(now, gold.xauUsd, fx.rate, spot, rate24, duty, premium, fx.stale ? 1 : 0, ok ? 1 : 0)
    .run();

  if (!ok) {
    await env.RATES.put('rejects', String(rejects + 1));
    return { ok: false, reason: 'jump too large', rate24 };
  }
  await env.RATES.put('rejects', '0');

  const reference = await env.DB.prepare(
    'SELECT rate24 FROM readings WHERE ok = 1 AND ts <= ? ORDER BY ts DESC LIMIT 1'
  )
    .bind(now - DAY_MS)
    .first();

  const latest = {
    updatedAt: new Date(now).toISOString(),
    goldPriceTime: gold.updatedAt,
    label: 'Indicative rate, not a shop quote',
    source: 'gold-api.com spot + USD/INR',
    xauUsd: gold.xauUsd,
    usdInr: fx.rate,
    fxDate: fx.date,
    fxStale: fx.stale,
    spotInrPerGram: Math.round(spot * 100) / 100,
    duty,
    premium,
    rate24: Math.round(rate24 * 100) / 100,
    rates: ratesByKarat(rate24),
    change24h: changeAgainst(rate24, reference?.rate24),
  };
  await env.RATES.put('latest', JSON.stringify(latest));
  return { ok: true, latest };
}
