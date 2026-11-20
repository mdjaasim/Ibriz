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
