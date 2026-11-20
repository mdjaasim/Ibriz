// Small helpers for the New alert form.
import { indian as grouped } from './format'

export const indian = (n: number) => grouped(n)

/** "11,200" or "11200.5" -> number; anything else -> 0. */
export function parseNumberSafe(text: string): number {
  const n = Number(String(text).replace(/[,\s₹]/g, ''))
  return Number.isFinite(n) && n > 0 ? n : 0
}
