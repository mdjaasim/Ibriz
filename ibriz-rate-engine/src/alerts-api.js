// Alert endpoints and the per-cycle check. Anonymous: an alert id is a random capability, there are no logins.
import { validateAlertInput, isTriggered, buildPayload, inQuietHours, staysActiveAfterFiring } from './alerts.js';
import { sendPush } from './push.js';

const num = (v, d) => (v === undefined || v === '' || Number.isNaN(Number(v)) ? d : Number(v));

function pushReady(env) {
  return Boolean(env.VAPID_PUBLIC && env.VAPID_PRIVATE && env.VAPID_SUBJECT);
}

export async function createAlert(env, body, json) {
  if (!pushReady(env)) return json({ error: 'push is not set up' }, 503);
  const v = validateAlertInput(body);
  if (!v.ok) return json({ error: v.error }, 400);
  const a = v.value;
  const max = num(env.MAX_ALERTS_PER_DEVICE, 10);
  const count = await env.DB.prepare('SELECT COUNT(*) AS n FROM alerts WHERE endpoint = ?').bind(a.endpoint).first();
  if ((count?.n ?? 0) >= max) return json({ error: `at most ${max} alerts per device` }, 429);
  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO alerts (id, endpoint, p256dh, auth, kind, karat, direction, target, quiet, city_adjust, city, active, created)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`
  )
    .bind(id, a.endpoint, a.p256dh, a.auth, a.kind, a.karat, a.direction, a.target, a.quiet, a.cityAdjust, a.city, Date.now())
    .run();
  return json({ id }, 201);
}

/** Status of alerts the app already knows the ids of (an id is the only proof of ownership). */
export async function listAlerts(env, body, json) {
  const ids = Array.isArray(body?.ids) ? body.ids.filter((x) => typeof x === 'string').slice(0, 20) : [];
  if (!ids.length) return json({ alerts: [] });
  const marks = ids.map(() => '?').join(',');
  const { results } = await env.DB.prepare(
    `SELECT id, kind, karat, direction, target, quiet, active, last_fired FROM alerts WHERE id IN (${marks})`
  )
    .bind(...ids)
    .all();
  return json({ alerts: results });
}

export async function updateAlert(env, body, json) {
  const id = typeof body?.id === 'string' ? body.id : '';
  if (!id) return json({ error: 'id required' }, 400);
  const sets = [];
  const vals = [];
  if (typeof body.active === 'boolean') { sets.push('active = ?'); vals.push(body.active ? 1 : 0); }
  if (typeof body.quiet === 'boolean') { sets.push('quiet = ?'); vals.push(body.quiet ? 1 : 0); }
  if (!sets.length) return json({ error: 'nothing to update' }, 400);
  if (body.active === true) { sets.push('last_fired = NULL'); }
  const res = await env.DB.prepare(`UPDATE alerts SET ${sets.join(', ')} WHERE id = ?`).bind(...vals, id).run();
  return json({ ok: (res.meta?.changes ?? 0) > 0 });
}

export async function deleteAlert(env, id, json) {
  await env.DB.prepare('DELETE FROM alerts WHERE id = ?').bind(id).run();
  return json({ ok: true });
}

/**
 * Called after each accepted update. Sends at most MAX_PUSH_PER_CYCLE pushes (free-plan CPU is 10 ms);
 * anything left over fires on the next 5-minute cycle because it stays active.
 */
export async function checkAlerts(env, latest, now = Date.now(), options = {}) {
  if (!pushReady(env)) return { sent: 0 };
  const cap = num(env.MAX_PUSH_PER_CYCLE, 3);
  const qStart = num(env.QUIET_START_HOUR, 22);
  const qEnd = num(env.QUIET_END_HOUR, 7);
  const { results } = await env.DB.prepare('SELECT * FROM alerts WHERE active = 1 ORDER BY created ASC LIMIT 500').all();
  const ctx = {};
  let sent = 0;
  for (const a of results) {
    if (sent >= cap) break;
    if (!isTriggered(a, latest, now)) continue;
    if (a.quiet && inQuietHours(now, qStart, qEnd)) continue;
    try {
      const res = await sendPush(a, buildPayload(a, latest), env, ctx, options);
      sent++;
      if (res.gone) {
        await env.DB.prepare('DELETE FROM alerts WHERE endpoint = ?').bind(a.endpoint).run();
      } else if (res.status >= 200 && res.status < 300) {
        await env.DB.prepare('UPDATE alerts SET last_fired = ?, active = ? WHERE id = ?')
          .bind(now, staysActiveAfterFiring(a) ? 1 : 0, a.id)
          .run();
      }
    } catch (err) {
      console.error('push failed:', String(err));
    }
  }
  return { sent };
}
