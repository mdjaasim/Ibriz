import { indian, pct } from './format'
export const gainColor = (n: number | null | undefined) => (n === null || n === undefined ? 'var(--ink-3)' : n < 0 ? 'var(--down)' : 'var(--up)')
export const gainPctText = (n: number | null) => (n === null ? '' : (n < 0 ? '−' : '+') + pct(n, 1))
export const monthYear = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '')
export const longDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '')
export const rupee = (n: number) => '₹' + indian(Math.round(n))
/** Lakh form for scales: 3.5L */
export const lakh = (n: number) => '₹' + (n / 100000).toFixed(1).replace(/\.0$/, '') + 'L'
