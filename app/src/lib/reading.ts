import { rate } from './rate.svelte'
interface Series { points: { v: number }[]; high: number | null; low: number | null }

export interface Reading { line: string; key: 'low' | 'high' | 'mid' | 'none' }

/** One descriptive sentence from our own saved history. For learning, never advice. */
export function readingFor(h: Series | null, current: number, rangeWords = 'this month'): Reading {
  if (!h || h.points.length < 3 || h.low === null || h.high === null) {
    return { line: 'Not enough history yet to say how today compares.', key: 'none' }
  }
  const vals = h.points.map((p) => p.v)
  const below = vals.filter((v) => v <= current).length / vals.length * 100
  const { lowPct, highPct } = rate.config.reading
  if (current <= h.low) return { line: `Gold is cheaper than it has been all ${rangeWords === 'this month' ? 'month' : rangeWords}.`, key: 'low' }
  if (current >= h.high) return { line: `Gold is dearer than it has been all ${rangeWords === 'this month' ? 'month' : rangeWords}.`, key: 'high' }
  if (below <= lowPct) return { line: `Gold is on the cheaper side of ${rangeWords}.`, key: 'low' }
  if (below >= highPct) return { line: `Gold is on the dearer side of ${rangeWords}.`, key: 'high' }
  return { line: `Gold is close to its usual level for ${rangeWords}.`, key: 'mid' }
}
