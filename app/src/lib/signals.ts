// Descriptive readings from Ibriz's own saved prices. For learning, never advice, no forecasts.
export interface SignalInput { points: { t: number; v: number }[]; current: number; todayPct: number | null }

export interface Signals {
  average: number
  vsAverage: 'below' | 'above' | 'near'
  momentumPct: number
  momentumSince: number // ms timestamp of first point
  rangePos: number // 0 (month low) .. 1 (month high)
  swings: 'bigger' | 'smaller' | 'usual'
  swingLevel: number // 1..5 bars
}

const std = (a: number[]) => {
  if (a.length < 2) return 0
  const m = a.reduce((s, x) => s + x, 0) / a.length
  return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1))
}

export function computeSignals({ points, current }: SignalInput, nearBand = 0.005): Signals | null {
  if (points.length < 5) return null
  const vals = points.map((p) => p.v)
  const average = vals.reduce((a, b) => a + b, 0) / vals.length
  const lo = Math.min(...vals), hi = Math.max(...vals)
  const moves = vals.slice(1).map((v, i) => (v - vals[i]) / vals[i])
  const recent = moves.slice(-Math.max(3, Math.floor(moves.length / 4)))
  const sAll = std(moves), sRecent = std(recent)
  const ratio = sAll ? sRecent / sAll : 1
  return {
    average,
    vsAverage: Math.abs(current - average) / average <= nearBand ? 'near' : current < average ? 'below' : 'above',
    momentumPct: ((current - vals[0]) / vals[0]) * 100,
    momentumSince: points[0].t,
    rangePos: hi === lo ? 0.5 : (current - lo) / (hi - lo),
    swings: ratio > 1.25 ? 'bigger' : ratio < 0.8 ? 'smaller' : 'usual',
    swingLevel: Math.max(1, Math.min(5, Math.round(ratio * 3))),
  }
}
