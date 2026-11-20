// Guide copy. DRAFT: every guide waits for the owner's review (reviewed: null until then).
// Numbers are never typed here: use the tokens below, filled in from config / the rate engine.
//   {duty} {premium} {gst} {makingGst} {sovereign} {karat} {dutySince}
export interface Guide {
  id: string
  title: string
  reviewed: string | null // 'YYYY-MM-DD' once the owner has checked it
  steps: { h: string; p: string }[]
}

// Facts that change with policy. Update here when the rules change; owner reviews.
export const facts = {
  dutySince: '13 May 2026', // effective date of the current import duty
  sources: [
    { name: 'World gold price', how: 'Every 5 minutes from', link: 'gold-api.com', url: 'https://gold-api.com' },
    { name: 'Rupee rate', how: 'Daily reference rate from', link: 'Frankfurter', url: 'https://frankfurter.dev' },
  ],
}

export const guides: Guide[] = [
  {
    id: 'reading-the-rate',
    title: 'Reading the rate',
    reviewed: null,
    steps: [
      { h: 'What it is', p: 'One gram of {karat}K gold in Tamil Nadu today, before making charges and GST.' },
      { h: "How it's worked out", p: 'The world gold price in rupees, plus {duty} import duty and a small shop premium.' },
      { h: 'How to read it', p: 'Shops across Tamil Nadu quote close to this. A sovereign is {sovereign} grams.' },
      { h: 'Watch out', p: 'Your bill will be higher: making charges and {gst} GST are added at the counter.' },
    ],
  },
]

export const fill = (text: string, v: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''))

export const pctText = (fraction: number, digits = 0) => `${(fraction * 100).toFixed(digits).replace(/\.0+$/, '')}%`
