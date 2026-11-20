// Pure maths for the planners. No storage, no network, no config values inside:
// rates, GST, making and deductions come in as arguments.

export interface StagedInput {
  budget: number // total rupees to spend
  periods: number // number of equal purchases
  allInPerG: number // rupees per gram all in (rate plus making and GST), today's figure
}
export interface StagedResult {
  perPeriod: number
  gramsPerPeriod: number
  totalGrams: number
}

/** Splits a budget into equal purchases and shows the grams each buys at one price. Arithmetic only. */
export function stagedPlan(i: StagedInput): StagedResult {
  const periods = Math.max(1, Math.round(i.periods))
  const perPeriod = i.budget / periods
  const gramsPerPeriod = i.allInPerG > 0 ? perPeriod / i.allInPerG : 0
  return { perPeriod, gramsPerPeriod, totalGrams: gramsPerPeriod * periods }
}

/** The same budget at a different price: total grams if the all-in price were `factor` times today's. */
export function stagedAtFactor(i: StagedInput, factor: number): number {
  return i.allInPerG > 0 && factor > 0 ? i.budget / (i.allInPerG * factor) : 0
}

export interface BreakEvenInput {
  paid: number // everything paid: gold, making and GST
  netG: number // net gold weight
  deductionPct: number // what a shop would keep when buying back
  ratePerG: number // today's rate for this karat
}
export interface BreakEvenResult {
  meltRate: number // rate per gram at which melt value equals what you paid
  saleRate: number // rate per gram at which the sale estimate (after the deduction) equals what you paid
  saleAbs: number // rupees per gram above (+) or below (−) today's rate
  salePct: number // percent above (+) or below (−) today's rate
  meltPct: number
}

/** What rate gold must reach to get back what you paid. Null when the inputs cannot give an answer. */
export function breakEven(i: BreakEvenInput): BreakEvenResult | null {
  if (!(i.paid > 0) || !(i.netG > 0) || !(i.ratePerG > 0) || i.deductionPct < 0 || i.deductionPct >= 100) return null
  const meltRate = i.paid / i.netG
  const saleRate = meltRate / (1 - i.deductionPct / 100)
  return {
    meltRate,
    saleRate,
    saleAbs: saleRate - i.ratePerG,
    salePct: ((saleRate - i.ratePerG) / i.ratePerG) * 100,
    meltPct: ((meltRate - i.ratePerG) / i.ratePerG) * 100,
  }
}

export interface GoalInput {
  mode: 'grams' | 'rupees'
  target: number // grams of the goal karat, or rupees
  haveGrams: number // gold already held, in grams of the goal karat
  allInPerG: number // all-in rupees per gram of the goal karat today
  ratePerG: number // today's rate per gram of the goal karat (for valuing what you hold)
  months: number // monthly payments left, at least 1
}
export interface GoalResult {
  targetGrams: number
  haveGrams: number
  needGrams: number
  needRupees: number
  monthly: number
  progressPct: number // share of the target already held, 0 to 100
  done: boolean
}

/** Monthly amount needed to reach a goal at today's price. A rupee goal is turned into grams at today's rate. */
export function goalPlan(i: GoalInput): GoalResult {
  const months = Math.max(1, Math.round(i.months))
  const targetGrams = i.mode === 'grams' ? i.target : i.ratePerG > 0 ? i.target / i.ratePerG : 0
  const needGrams = Math.max(0, targetGrams - i.haveGrams)
  const needRupees = needGrams * i.allInPerG
  return {
    targetGrams,
    haveGrams: i.haveGrams,
    needGrams,
    needRupees,
    monthly: needRupees / months,
    progressPct: targetGrams > 0 ? Math.min(100, (i.haveGrams / targetGrams) * 100) : 0,
    done: targetGrams > 0 && i.haveGrams >= targetGrams,
  }
}

const DAY = 86400000

/** Whole days from now to a date, counting today as 0. Negative when the date has passed. */
export function daysUntil(dateIso: string, now = Date.now()): number {
  const t = Date.parse(dateIso + 'T00:00:00+05:30') // Indian date
  const today = Date.parse(new Date(now + 5.5 * 3600000).toISOString().slice(0, 10) + 'T00:00:00Z') - 5.5 * 3600000
  return Math.round((t - today) / DAY)
}

/** Monthly payments left until a deadline (at least 1 while the deadline is ahead, 0 if it has passed). */
export function monthsUntil(dateIso: string, daysPerMonth: number, now = Date.now()): number {
  const d = daysUntil(dateIso, now)
  return d <= 0 ? 0 : Math.max(1, Math.round(d / daysPerMonth))
}

export interface Move { t: number; pct: number; from: number; to: number }

/** The biggest day-to-day moves in a series of daily points. Descriptive only: it says when, not why. */
export function biggestMoves(points: { t: number; v: number }[], n: number): Move[] {
  const out: Move[] = []
  for (let k = 1; k < points.length; k++) {
    const a = points[k - 1].v, b = points[k].v
    if (a > 0) out.push({ t: points[k].t, pct: ((b - a) / a) * 100, from: a, to: b })
  }
  return out.sort((x, y) => Math.abs(y.pct) - Math.abs(x.pct)).slice(0, n)
}
