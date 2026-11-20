// Pure maths for My Gold. No storage, no network: everything comes in as arguments.

export interface PieceLike {
  netG: number
  karat: number
  form: string
  totalPaid?: number
}

export interface PieceStats {
  melt: number // net weight x live rate for its karat
  paid: number | null
  gain: number | null
  gainPct: number | null
  paidPerGram: number | null // everything paid, per net gram
  breakEvenRate: number | null // rate per gram (same karat) at which melt value equals paid
  saleEstimate: number // melt after a shop deduction (an estimate)
}

/** ratePerGram = live rate per gram for this piece's karat. */
export function pieceStats(p: PieceLike, ratePerGram: number, deductionPct: number): PieceStats {
  const melt = p.netG * ratePerGram
  const paid = p.totalPaid !== undefined && p.totalPaid > 0 ? p.totalPaid : null
  const gain = paid === null ? null : melt - paid
  return {
    melt,
    paid,
    gain,
    gainPct: gain === null || paid === null ? null : (gain / paid) * 100,
    paidPerGram: paid === null || p.netG <= 0 ? null : paid / p.netG,
    breakEvenRate: paid === null || p.netG <= 0 ? null : paid / p.netG,
    saleEstimate: melt * (1 - deductionPct / 100),
  }
}

export interface PortfolioStats {
  count: number
  grams: number
  gramsByForm: Record<string, number>
  gramsByKarat: Record<number, number>
  gramsPure24: number // 24K-equivalent grams
  worth: number
  paid: number | null // null unless every piece has a price
  gain: number | null
  gainPct: number | null
  avgCostPerGram: number | null
}

export function portfolioStats(
  pieces: PieceLike[],
  ratePerGram: (karat: number) => number,
  purity: (karat: number) => number
): PortfolioStats {
  const gramsByForm: Record<string, number> = {}
  const gramsByKarat: Record<number, number> = {}
  let grams = 0, pure = 0, worth = 0, paid = 0
  let allPriced = pieces.length > 0
  for (const p of pieces) {
    grams += p.netG
    pure += p.netG * purity(p.karat)
    worth += p.netG * ratePerGram(p.karat)
    gramsByForm[p.form] = (gramsByForm[p.form] ?? 0) + p.netG
    gramsByKarat[p.karat] = (gramsByKarat[p.karat] ?? 0) + p.netG
    if (p.totalPaid !== undefined && p.totalPaid > 0) paid += p.totalPaid
    else allPriced = false
  }
  const paidAll = allPriced ? paid : null
  const gain = paidAll === null ? null : worth - paidAll
  return {
    count: pieces.length,
    grams,
    gramsByForm,
    gramsByKarat,
    gramsPure24: pure,
    worth,
    paid: paidAll,
    gain,
    gainPct: gain === null || !paidAll ? null : (gain / paidAll) * 100,
    avgCostPerGram: paidAll === null || grams <= 0 ? null : paidAll / grams,
  }
}

/** Value of every piece if the rate for `karat` were `rate` (What if). Other karats scale with it. */
export function whatIfValue(netG: number, pieceKarat: number, rate: number, baseKarat: number, purity: (k: number) => number): number {
  return netG * rate * (purity(pieceKarat) / purity(baseKarat))
}

/** Net gold weight from scale weight and stone weight. Never below zero. */
export function netWeight(grossG: number, stoneG: number): number {
  return Math.max(0, grossG - stoneG)
}
