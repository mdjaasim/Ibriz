import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buy, sell, parseNumber, fineness } from '../src/lib/calc.ts'

test('buy: matches the design example (12 g, 22K at 11481, 12% making)', () => {
  const r = buy({ weightG: 12, ratePerG: 11481, makingPct: 12, gstGoldPct: 3, gstMakingPct: 5 })
  assert.equal(Math.round(r.gold), 137772)
  assert.equal(Math.round(r.making), 16533)
  assert.equal(Math.round(r.gstGold), 4133)
  assert.equal(Math.round(r.gstMaking), 827)
  assert.equal(Math.round(r.total), 159264)
})
test('buy: zero weight does not divide by zero', () => {
  assert.equal(buy({ weightG: 0, ratePerG: 1, makingPct: 1, gstGoldPct: 3, gstMakingPct: 5 }).allInPerG, 0)
})
test('sell: deduction comes off the gold value', () => {
  const r = sell({ weightG: 24, ratePerG: 11481, deductionPct: 3 })
  assert.equal(Math.round(r.gold), 275544)
  assert.equal(Math.round(r.net), 267278)
})
test('parseNumber', () => {
  assert.equal(parseNumber('1,200.5'), 1200.5)
  assert.equal(parseNumber('abc'), 0)
  assert.equal(parseNumber('-3'), 0)
})
test('fineness', () => {
  assert.equal(fineness(0.916, 999), 916)
  assert.equal(fineness(1, 999), 999)
})
