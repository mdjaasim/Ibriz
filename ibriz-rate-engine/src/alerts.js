// Pure alert logic: validation, conditions, quiet hours and notification copy.
// No network, no storage. An alert holds only a price rule, never what the owner has.

import { PURITY } from './rate.js';

export const KINDS = ['price', 'move', 'monthly'];
export const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Hosts push services use. We only ever send to these (stops the Worker posting to arbitrary URLs). */
export const PUSH_HOST_SUFFIXES = [
  'fcm.googleapis.com',
  'push.services.mozilla.com',
  'push.apple.com',
  'notify.windows.com',
];

export function isAllowedEndpoint(endpoint) {
  let url;
  try {
    url = new URL(endpoint);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:' || endpoint.length > 600) return false;
  return PUSH_HOST_SUFFIXES.some((s) => url.hostname === s || url.hostname.endsWith('.' + s));
}

/** Checks the body of "create alert". Returns { ok, value } or { ok: false, error }. */
export function validateAlertInput(input, limits = {}) {
  const maxTarget = limits.maxTarget ?? 10_000_000;
  const err = (error) => ({ ok: false, error });
  if (!input || typeof input !== 'object') return err('body required');
  const sub = input.subscription;
  const endpoint = sub?.endpoint;
  const p256dh = sub?.keys?.p256dh;
  const auth = sub?.keys?.auth;
  if (typeof endpoint !== 'string' || !isAllowedEndpoint(endpoint)) return err('unsupported push endpoint');
  if (typeof p256dh !== 'string' || p256dh.length < 80 || p256dh.length > 100) return err('bad p256dh');
  if (typeof auth !== 'string' || auth.length < 20 || auth.length > 30) return err('bad auth');
  if (!KINDS.includes(input.kind)) return err('kind must be one of ' + KINDS.join(', '));

  const value = {
    endpoint, p256dh, auth, kind: input.kind,
    karat: null, direction: null, target: null,
    quiet: input.quiet === false ? 0 : 1,
    cityAdjust: 0,
    city: typeof input.city === 'string' ? input.city.replace(/[^\p{L} .'-]/gu, '').slice(0, 20) : '',
  };
  const adj = Number(input.cityAdjust ?? 0);
  if (!Number.isFinite(adj) || Math.abs(adj) > 20) return err('cityAdjust out of range');
  value.cityAdjust = adj;

  if (input.kind !== 'monthly') {
    const karat = Number(input.karat);
    if (!Object.hasOwn(PURITY, karat)) return err('karat must be one of ' + Object.keys(PURITY).join(', '));
    value.karat = karat;
    const target = Number(input.target);
    if (!Number.isFinite(target) || target <= 0 || target > maxTarget) return err('target out of range');
    value.target = target;
  }
  if (input.kind === 'price') {
    if (input.direction !== 'above' && input.direction !== 'below') return err('direction must be above or below');
    value.direction = input.direction;
  }
  return { ok: true, value };
}

/** Rate per gram for a karat as the person sees it (their city's adjustment included). */
export function perGramFor(latest, karat, cityAdjust = 0) {
  return latest.rate24 * PURITY[karat] * (1 + cityAdjust / 100);
}

/** Indian digit grouping, e.g. 551081 -> "5,51,081". */
export function inr(n) {
  const s = String(Math.round(Math.abs(n)));
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  return (rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' : '') + last3;
}

/** IST wall-clock parts for a UTC timestamp. */
export function istParts(ms) {
  const d = new Date(ms + IST_OFFSET_MS);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth(), day: d.getUTCDate(), hour: d.getUTCHours() };
}

/** True inside quiet hours (start hour inclusive, end hour exclusive), IST. Handles overnight spans. */
export function inQuietHours(ms, startHour, endHour) {
  const { hour } = istParts(ms);
  return startHour <= endHour ? hour >= startHour && hour < endHour : hour >= startHour || hour < endHour;
}

const sameIstDay = (a, b) => {
  const x = istParts(a), y = istParts(b);
  return x.year === y.year && x.month === y.month && x.day === y.day;
};
const sameIstMonth = (a, b) => {
  const x = istParts(a), y = istParts(b);
  return x.year === y.year && x.month === y.month;
};

/**
 * Should this alert fire now? `latest` is the published rate object (rate24, change24h).
 * price: fires once, then the alert switches itself off (re-arm in the app).
 * move: fires when the day's move reaches the target percent, at most once per IST day.
 * monthly: fires on the 1st (IST, from 9 am), once a month.
 */
export function isTriggered(alert, latest, now) {
  if (!alert.active) return false;
  if (alert.kind === 'price') {
    const v = perGramFor(latest, alert.karat, alert.city_adjust ?? alert.cityAdjust ?? 0);
    return alert.direction === 'above' ? v >= alert.target : v <= alert.target;
  }
  if (alert.kind === 'move') {
    const pct = latest.change24h?.pct;
    if (typeof pct !== 'number') return false;
    if (alert.last_fired && sameIstDay(alert.last_fired, now)) return false;
    return Math.abs(pct) >= alert.target;
  }
  if (alert.kind === 'monthly') {
    const p = istParts(now);
    if (p.day !== 1 || p.hour < 9) return false;
    return !(alert.last_fired && sameIstMonth(alert.last_fired, now));
  }
  return false;
}

/** After firing: price alerts go inactive; move and monthly stay armed. */
export const staysActiveAfterFiring = (alert) => alert.kind !== 'price';

/** Notification text. Short, specific, never about holdings, never says buy or sell. */
export function buildPayload(alert, latest, appUrl = '/#/main') {
  const city = alert.city ? ` in ${alert.city}` : '';
  if (alert.kind === 'price') {
    const now = perGramFor(latest, alert.karat, alert.city_adjust ?? 0);
    return {
      title: `${alert.karat}K is ${alert.direction} ₹${inr(alert.target)}`,
      body: `Now ₹${inr(now)} a gram${city}. Tap for today's rate.`,
      url: appUrl,
      tag: `ibriz-price-${alert.id}`,
    };
  }
  if (alert.kind === 'move') {
    const c = latest.change24h;
    const dir = c.abs < 0 ? 'down' : 'up';
    const k = alert.karat;
    const perGram = Math.abs(c.abs) * PURITY[k] * (1 + (alert.city_adjust ?? 0) / 100);
    return {
      title: `Gold moved ${Math.abs(c.pct).toFixed(1)}% today`,
      body: `${k}K is ${dir} ₹${inr(perGram)} since yesterday.`,
      url: appUrl,
      tag: `ibriz-move-${alert.id}`,
    };
  }
  return {
    title: 'Your monthly gold check',
    body: 'Open Ibriz to see what your gold is worth.',
    url: '/#/mygold',
    tag: `ibriz-monthly-${alert.id}`,
  };
}
