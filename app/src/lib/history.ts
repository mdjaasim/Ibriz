import { API_BASE } from '../config'
import { load, save } from './storage'

export type Range = '1d' | '1w' | '1m' | '3m' | '1y'
export interface Point { t: number; v: number; hi: number; lo: number }
export interface History {
  range: Range
  points: Point[] // v = 24K rupees per gram; multiply by purity for other karats
  high: number | null
  low: number | null
  average: number | null
}

/** Chart data from the Worker's rollups. Falls back to the last saved copy when offline. */
export async function fetchHistory(range: Range): Promise<History | null> {
  try {
    const res = await fetch(`${API_BASE}/api/history?range=${range}`)
    if (!res.ok) throw new Error(String(res.status))
    const h = (await res.json()) as History
    save('history.' + range, h)
    return h
  } catch {
    return load<History | null>('history.' + range, null)
  }
}

const DAY = 86400000
export const RANGE_DAYS: Record<Range, number> = { '1d': 1, '1w': 7, '1m': 30, '3m': 91, '1y': 366 }

/** True when the history reaches back about as far as the range asks (a day of slack). */
export function coversRange(points: { t: number }[], range: Range, now = Date.now()): boolean {
  if (!points.length) return false
  return points[0].t <= now - RANGE_DAYS[range] * DAY + 2 * DAY
}
