// Fills {tokens} in lesson and glossary text from the live config, so no number is typed into prose.
//   {duty} {gstGold} {gstMaking} {premium}  -> "15%"
//   {sovereign}                             -> "8"
//   {purity:22}                             -> "91.6%"      {fineness:22} -> "916"
import { rate } from '../lib/rate.svelte'
import { fineness } from '../lib/calc'
import { pureGoldFineness } from '../lib/calcconfig'

const trim = (n: number) => String(Math.round(n * 10) / 10)

export function fill(text: string): string {
  const c = rate.config
  return text.replace(/\{(\w+)(?::(\w+))?\}/g, (m, key: string, arg?: string) => {
    switch (key) {
      case 'duty': return trim(c.duty * 100) + '%'
      case 'gstGold': return trim(c.gstGold * 100) + '%'
      case 'gstMaking': return trim(c.gstMaking * 100) + '%'
      case 'premium': return trim(c.premium * 100) + '%'
      case 'sovereign': return String(c.gramsPerSovereign)
      case 'purity': {
        const p = c.purity[arg ?? ''] ?? 0
        return p >= 1 ? '99.9%' : trim(p * 100) + '%'
      }
      case 'fineness': return String(fineness(c.purity[arg ?? ''] ?? 0, pureGoldFineness))
      default: return m
    }
  })
}

export type Token = { kind: 'text'; text: string } | { kind: 'term'; id: string; label: string }

/** Splits "[[karat|karats]]" markers (glossary links) out of already-filled text. */
export function tokens(text: string): Token[] {
  const out: Token[] = []
  const re = /\[\[([\w-]+)(?:\|([^\]]+))?\]\]/g
  let last = 0
  for (const m of text.matchAll(re)) {
    if (m.index > last) out.push({ kind: 'text', text: text.slice(last, m.index) })
    out.push({ kind: 'term', id: m[1], label: m[2] ?? m[1] })
    last = m.index + m[0].length
  }
  if (last < text.length) out.push({ kind: 'text', text: text.slice(last) })
  return out
}
