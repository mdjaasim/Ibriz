// Ibriz rate engine. Runs on Cloudflare Workers (free plan).
//   cron   -> fetch price every 5 minutes, log it, publish the latest rate
//   /api/rate     latest indicative rate (what the app will read)
//   /api/health   is the engine alive, how old is the last reading
//   /api/log.csv  the reading log, for the one-week validation (needs LOG_TOKEN if set)
//   /api/run      force one update now (needs LOG_TOKEN to be set and passed)

import { runUpdate } from './update.js';
import { PURITY } from './rate.js';

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
};

const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...CORS, ...extra },
  });

function tokenOk(env, url) {
  if (!env.LOG_TOKEN) return true; // no token configured: open (fine for prices only)
  return url.searchParams.get('token') === env.LOG_TOKEN;
}

async function handleLog(env, url) {
  if (!tokenOk(env, url)) return json({ error: 'token required' }, 401);
  const days = Math.min(Math.max(Number(url.searchParams.get('days') ?? 7), 1), 60);
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  const { results } = await env.DB.prepare(
    'SELECT ts, xau_usd, usd_inr, spot_inr_g, rate24, duty, premium, fx_stale, ok FROM readings WHERE ts >= ? ORDER BY ts ASC LIMIT 20000'
  )
    .bind(since)
    .all();
  const head = 'time_utc,xau_usd,usd_inr,spot_inr_per_g,rate24_per_g,rate22_per_g,rate18_per_g,duty,premium,fx_stale,accepted';
  const lines = results.map((r) =>
    [
      new Date(r.ts).toISOString(),
      r.xau_usd,
      r.usd_inr,
      r.spot_inr_g.toFixed(2),
      r.rate24.toFixed(2),
      (r.rate24 * PURITY[22]).toFixed(2),
      (r.rate24 * PURITY[18]).toFixed(2),
      r.duty,
      r.premium,
      r.fx_stale,
      r.ok,
    ].join(',')
  );
  return new Response([head, ...lines].join('\n') + '\n', {
    headers: { 'content-type': 'text/csv; charset=utf-8', ...CORS },
  });
}

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(
      runUpdate(env).catch((err) => console.error('update failed:', String(err)))
    );
  },

  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const url = new URL(request.url);

    if (url.pathname === '/api/rate') {
      const latest = await env.RATES.get('latest', 'json');
      if (!latest) return json({ error: 'No rate yet. The first update runs within 5 minutes of deploy.' }, 503);
      const ageSeconds = Math.round((Date.now() - Date.parse(latest.updatedAt)) / 1000);
      return json({ ...latest, ageSeconds }, 200, { 'cache-control': 'public, max-age=30' });
    }

    if (url.pathname === '/api/health') {
      const latest = await env.RATES.get('latest', 'json');
      const count = await env.DB.prepare('SELECT COUNT(*) AS n FROM readings').first();
      const ageSeconds = latest ? Math.round((Date.now() - Date.parse(latest.updatedAt)) / 1000) : null;
      return json({ ok: latest !== null && ageSeconds < 900, ageSeconds, readings: count?.n ?? 0 });
    }

    if (url.pathname === '/api/log.csv') return handleLog(env, url);

    if (url.pathname === '/api/run') {
      if (!env.LOG_TOKEN || !tokenOk(env, url)) return json({ error: 'not allowed' }, 401);
      try {
        return json(await runUpdate(env));
      } catch (err) {
        return json({ error: String(err) }, 500);
      }
    }

    return new Response('Ibriz rate engine. Try /api/rate or /api/health\n', {
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  },
};
