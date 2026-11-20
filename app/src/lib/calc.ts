// Pure maths for the calculator. No network, no storage, no config values inside:
// duty/GST/making come in as arguments so a policy change never touches this file.

export interface BuyInput {
  weightG: number // net gold weight
  ratePerG: number // today's rate for the chosen karat, rupees per gram
  makingPct: number // percent of gold value
  gstGoldPct: number // percent, e.g. from config
  gstMakingPct: number // percent
}
export interface BuyResult {
  gold: number
  making: number
  gstGold: number
  gstMaking: number
  total: number
  allInPerG: number
}

export function buy(i: BuyInput): BuyResult {
  const gold = i.weightG * i.ratePerG
  const making = (gold * i.makingPct) / 100
  const gstGold = (gold * i.gstGoldPct) / 100
  const gstMaking = (making * i.gstMakingPct) / 100
  const total = gold + making + gstGold + gstMaking
  return { gold, making, gstGold, gstMaking, total, allInPerG: i.weightG > 0 ? total / i.weightG : 0 }
}

export interface SellInput {
  weightG: number
  ratePerG: number
  deductionPct: number // what the shop takes off when it buys back
}
export interface SellResult { gold: number; deduction: number; net: number }

export function sell(i: SellInput): SellResult {
  const gold = i.weightG * i.ratePerG
  const deduction = (gold * i.deductionPct) / 100
  return { gold, deduction, net: gold - deduction }
}

/** Parse what a person typed ("12", "12.5", "1,200"); empty or junk gives 0. */
export function parseNumber(text: string): number {
  const n = Number(text.replace(/,/g, '').trim())
  return Number.isFinite(n) && n > 0 ? n : 0
}

/** Fineness as stamped on hallmarks: 22K is 916. Pure gold is stamped 999, not 1000. */
export function fineness(purity: number, pureFineness: number): number {
  return purity >= 1 ? pureFineness : Math.round(purity * 1000)
}
