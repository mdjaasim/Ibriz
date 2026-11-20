// Pure functions: no network, no storage. Easy to test and to reuse in the app later.

export const GRAMS_PER_TROY_OUNCE = 31.1035;
export const GRAMS_PER_SOVEREIGN = 8; // the unit Tamil Nadu shops quote

// Share of pure gold in each karat (24K treated as pure, as shop rates are quoted).
export const PURITY = { 24: 1, 22: 0.916, 18: 0.75, 14: 0.585 };

/** Global spot gold (USD per troy ounce) -> rupees per gram of pure gold. */
export function spotInrPerGram(xauUsdPerOunce, usdInr) {
  return (xauUsdPerOunce * usdInr) / GRAMS_PER_TROY_OUNCE;
}

/**
 * Indicative Indian 24K rate per gram, before GST and making charges.
 * duty = import duty as a fraction (0.15 = 15%), premium = shop/dealer premium as a fraction.
 */
export function retail24PerGram(spotInrPerG, duty, premium) {
  return spotInrPerG * (1 + duty) * (1 + premium);
}

const round2 = (n) => Math.round(n * 100) / 100;

/** Rates for every karat, in per gram, per sovereign (8 g) and per 10 g. */
export function ratesByKarat(rate24PerG) {
  const out = {};
  for (const [karat, purity] of Object.entries(PURITY)) {
    const g = rate24PerG * purity;
    out[karat] = {
      perGram: round2(g),
      perSovereign: round2(g * GRAMS_PER_SOVEREIGN),
      per10g: round2(g * 10),
    };
  }
  return out;
}

/** True if a number is a usable, positive, finite price. */
export function isUsablePrice(n) {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

/**
 * Reject a reading that jumps too far from the last good one (one bad API reply
 * must never reach users or trigger alerts). maxJump = 0.05 means 5%.
 */
export function isSaneJump(newValue, previousValue, maxJump) {
  if (!isUsablePrice(newValue)) return false;
  if (!isUsablePrice(previousValue)) return true; // nothing to compare against
  return Math.abs(newValue - previousValue) / previousValue <= maxJump;
}

/** Change of `current` against `reference`, in rupees and percent. Null if no reference. */
export function changeAgainst(current, reference) {
  if (!isUsablePrice(current) || !isUsablePrice(reference)) return null;
  const abs = current - reference;
  return { abs: round2(abs), pct: round2((abs / reference) * 100) };
}

/** Premium implied by an observed price: how much higher it is than spot + duty. */
export function impliedPremium(observed24PerG, spotInrPerG, duty) {
  return observed24PerG / (spotInrPerG * (1 + duty)) - 1;
}
