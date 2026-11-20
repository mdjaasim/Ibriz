import { test } from 'node:test'
import assert from 'node:assert/strict'
import { stagedPlan, stagedAtFactor, breakEven, goalPlan, daysUntil, monthsUntil, biggestMoves } from '../src/lib/planner.ts'

test('stagedPlan: splits the budget and converts to grams', () => {
  const r = stagedPlan({ budget: 60000, periods: 6, allInPerG: 10000 })
  assert.equal(r.perPeriod, 10000)
  assert.equal(r.gramsPerPeriod, 1)
  assert.equal(r.totalGrams, 6)
})
test('stagedPlan: zero price gives zero grams, never infinity', () => {
  assert.equal(stagedPlan({ budget: 1000, periods: 2, allInPerG: 0 }).totalGrams, 0)
})
test('stagedAtFactor: a 10% dearer price buys fewer grams', () => {
  const i = { budget: 11000, periods: 1, allInPerG: 1000 }
  assert.equal(Math.round(stagedAtFactor(i, 1.1) * 100) / 100, 10)
})

test('breakEven: no deduction means the paid rate; a deduction raises it', () => {
  const r = breakEven({ paid: 159264, netG: 12, deductionPct: 0, ratePerG: 11481 })!
  assert.equal(Math.round(r.meltRate), 13272)
  assert.equal(Math.round(r.saleRate), 13272)
  const d = breakEven({ paid: 159264, netG: 12, deductionPct: 5, ratePerG: 11481 })!
  assert.equal(Math.round(d.saleRate), 13971)
  assert.ok(d.salePct > 20 && d.salePct < 22)
})
test('breakEven: nonsense inputs give null', () => {
  assert.equal(breakEven({ paid: 0, netG: 5, deductionPct: 5, ratePerG: 1 }), null)
  assert.equal(breakEven({ paid: 10, netG: 5, deductionPct: 100, ratePerG: 1 }), null)
})

test('goalPlan: grams goal, monthly amount from what is still needed', () => {
  const r = goalPlan({ mode: 'grams', target: 40, haveGrams: 20, allInPerG: 12000, ratePerG: 11000, months: 10 })
  assert.equal(r.needGrams, 20)
  assert.equal(r.needRupees, 240000)
  assert.equal(r.monthly, 24000)
  assert.equal(r.progressPct, 50)
  assert.equal(r.done, false)
})
test('goalPlan: rupee goal is turned into grams at today\'s rate; done when already held', () => {
  const r = goalPlan({ mode: 'rupees', target: 220000, haveGrams: 25, allInPerG: 12000, ratePerG: 11000, months: 5 })
  assert.equal(r.targetGrams, 20)
  assert.equal(r.done, true)
  assert.equal(r.monthly, 0)
})

test('daysUntil / monthsUntil count in Indian dates', () => {
  const now = Date.parse('2026-11-21T10:00:00+05:30')
  assert.equal(daysUntil('2026-11-21', now), 0)
  assert.equal(daysUntil('2026-11-24', now), 3)
  assert.equal(daysUntil('2026-11-20', now), -1)
  assert.equal(monthsUntil('2027-05-21', 30.44, now), 6)
  assert.equal(monthsUntil('2026-11-01', 30.44, now), 0)
  assert.equal(monthsUntil('2026-11-25', 30.44, now), 1)
})

test('biggestMoves: ranks by size of the move, either direction', () => {
  const pts = [100, 110, 98, 99, 120].map((v, i) => ({ t: i, v }))
  const m = biggestMoves(pts, 2)
  assert.equal(m.length, 2)
  assert.equal(m[0].t, 4) // 100 -> 120 is +20%
  assert.ok(m[1].pct < 0) // 110 -> 98 is -10.9%
})
