import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  spotInrPerGram,
  retail24PerGram,
  ratesByKarat,
  isSaneJump,
  changeAgainst,
  impliedPremium,
} from '../src/rate.js';
import { parseFxResponse } from '../src/sources.js';

const near = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} not within ${tol} of ${b}`);

test('spot conversion: $3,569.62/oz at 92.2 INR per USD is about 10,582 rupees per gram', () => {
  near(spotInrPerGram(3569.62, 92.2), 10581.9, 1);
});

test('retail 24K applies duty then premium', () => {
  near(retail24PerGram(10000, 0.15, 0.03), 11845, 0.001);
  near(retail24PerGram(10000, 0.15, 0), 11500, 0.001);
});

test('karat rates: 22K is 91.6% of 24K, a sovereign is 8 grams, 10 g is 10 grams', () => {
  const r = ratesByKarat(13000);
  assert.equal(r[24].perGram, 13000);
  near(r[22].perGram, 11908, 0.01);
  near(r[22].perSovereign, 11908 * 8, 0.05);
  near(r[18].per10g, 97500, 0.01);
  near(r[14].perGram, 7605, 0.01);
});

test('sanity check rejects bad numbers and big jumps, accepts normal moves', () => {
  assert.equal(isSaneJump(13100, 13000, 0.05), true);
  assert.equal(isSaneJump(14000, 13000, 0.05), false);
  assert.equal(isSaneJump(NaN, 13000, 0.05), false);
  assert.equal(isSaneJump(-5, 13000, 0.05), false);
  assert.equal(isSaneJump(13000, null, 0.05), true);
});

test('change against a reference', () => {
  assert.deepEqual(changeAgainst(13130, 13000), { abs: 130, pct: 1 });
  assert.deepEqual(changeAgainst(12870, 13000), { abs: -130, pct: -1 });
  assert.equal(changeAgainst(13000, null), null);
});

test('implied premium reproduces the 19 Nov 2026 check from the plan (about 2.9%)', () => {
  // spot Rs 10,979.87/g, duty 15%, IBJA 999 rate Rs 12,998.5/g
  near(impliedPremium(12998.5, 10979.87, 0.15), 0.0294, 0.0005);
});

test('FX parsing accepts the v1 shape and plausible v2 shapes, rejects junk', () => {
  assert.deepEqual(parseFxResponse({ base: 'USD', date: '2026-11-20', rates: { INR: 92.2 } }), {
    rate: 92.2,
    date: '2026-11-20',
  });
  assert.equal(parseFxResponse([{ base: 'USD', quote: 'INR', rate: 92.2, date: '2026-11-20' }]).rate, 92.2);
  assert.equal(parseFxResponse({ rates: [{ quote: 'INR', rate: 92.2 }] }).rate, 92.2);
  assert.equal(parseFxResponse({ rates: { EUR: 0.9 } }), null);
  assert.equal(parseFxResponse(null), null);
  assert.equal(parseFxResponse({ rates: { INR: 0 } }), null);
});
