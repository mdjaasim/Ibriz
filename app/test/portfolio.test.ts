import { test } from 'node:test'
import assert from 'node:assert/strict'
import { pieceStats, portfolioStats, whatIfValue, netWeight } from '../src/lib/portfolio.ts'

const purity = (k: number) => ({ 24: 1, 22: 0.916, 18: 0.75 } as Record<number, number>)[k] ?? 0

test('pieceStats: gain, break-even and sale estimate', () => {
  const s = pieceStats({ netG: 10, karat: 22, form: 'coin', totalPaid: 100000 }, 11000, 5)
  assert.equal(s.melt, 110000)
  assert.equal(s.gain, 10000)
  assert.equal(s.breakEvenRate, 10000)
  assert.equal(Math.round(s.saleEstimate), 104500)
})

test('pieceStats: no price paid means no gain', () => {
  const s = pieceStats({ netG: 10, karat: 22, form: 'coin' }, 11000, 5)
  assert.equal(s.gain, null)
  assert.equal(s.breakEvenRate, null)
})

test('portfolioStats totals and 24K equivalent', () => {
  const r = portfolioStats(
    [{ netG: 10, karat: 22, form: 'jewellery', totalPaid: 90000 }, { netG: 5, karat: 24, form: 'bar', totalPaid: 70000 }],
    (k) => 1000 * purity(k), purity)
  assert.equal(r.grams, 15)
  assert.equal(r.paid, 160000)
  assert.ok(Math.abs(r.gramsPure24 - 14.16) < 1e-9)
  assert.equal(r.avgCostPerGram, 160000 / 15)
})

test('portfolioStats: paid is null if any piece has no price', () => {
  const r = portfolioStats([{ netG: 1, karat: 24, form: 'bar' }], () => 1, purity)
  assert.equal(r.paid, null)
})

test('whatIfValue scales by purity', () => {
  assert.equal(Math.round(whatIfValue(10, 22, 10000, 22, purity)), 100000)
  assert.equal(Math.round(whatIfValue(10, 18, 10000, 22, purity)), Math.round(10 * 10000 * 0.75 / 0.916))
})

test('netWeight never negative', () => {
  assert.equal(netWeight(5, 6), 0)
  assert.equal(netWeight(10, 1.5), 8.5)
})
