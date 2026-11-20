// Guide copy. DRAFT: every guide waits for the owner's review (reviewed: null until then).
// Numbers are never typed here: use the tokens below, filled in from config / the rate engine.
//   {duty} {premium} {gst} {makingGst} {sovereign} {karat} {city} {dutySince}
export interface Guide {
  id: string
  title: string
  parent: 'main' | 'charts' | 'mygold' | 'calculator' // the screen the guide opens over
  lesson?: string // id of the lesson with the longer version
  reviewed: string | null // 'YYYY-MM-DD' once the owner has checked it
  steps: { h: string; p: string }[]
}

// Facts that change with policy. Update here when the rules change; owner reviews.
export const facts = {
  dutySince: '13 May 2026', // effective date of the current import duty
  sources: [
    { name: 'Past prices (first 30 days)', how: 'Daily closes from', link: 'goldprice.dev', url: 'https://goldprice.dev' },
    { name: 'World gold price', how: 'Every 5 minutes from', link: 'gold-api.com', url: 'https://gold-api.com' },
    { name: 'Rupee rate', how: 'Daily reference rate from', link: 'Frankfurter', url: 'https://frankfurter.dev' },
  ],
}

export const guides: Guide[] = [
  {
    id: 'reading-the-rate',
    title: 'Reading the rate',
    parent: 'main',
    lesson: 'how-rate-built',
    reviewed: null,
    steps: [
      { h: 'What it is', p: 'One gram of {karat}K gold in Tamil Nadu today, before making charges and GST.' },
      { h: "How it's worked out", p: 'The world gold price in rupees, plus {duty} import duty and a small shop premium.' },
      { h: 'How to read it', p: 'Shops across Tamil Nadu quote close to this. A sovereign is {sovereign} grams.' },
      { h: 'Watch out', p: 'Your bill will be higher: making charges and {gst} GST are added at the counter.' },
    ],
  },
  {
    id: 'reading-the-chart',
    title: 'Reading the chart',
    parent: 'charts',
    lesson: 'reading-charts',
    reviewed: null,
    steps: [
      { h: 'What it shows', p: 'The price of 1 gram of {karat}K gold in {city}. Each point is one day’s closing rate; on 1D it is one point every few minutes.' },
      { h: 'The labels', p: 'The top and bottom labels on the right are the highest and lowest price in the range. The gold label is the price now. Dates run along the bottom.' },
      { h: 'How to read it', p: 'Drag a finger across the line to read the price on any day. High, Low and Average below the chart summarise the same range.' },
      { h: 'Watch out', p: 'One day proves little. Longer ranges fill in as Ibriz collects more prices. Past prices say nothing certain about the future.' },
    ],
  },
  {
    id: 'how-the-reading-works',
    title: 'How the reading works',
    parent: 'main',
    lesson: 'reading-charts',
    reviewed: null,
    steps: [
      { h: 'What it is', p: 'One plain sentence about where today’s price sits against the past month, using only prices Ibriz has saved.' },
      { h: 'The four checks', p: 'Trend: today against the month’s average. Momentum: how much it moved over the range. Range: where today sits between the low and the high. Swings: how big the daily moves are.' },
      { h: 'Limits', p: 'With only a few weeks of history the reading is rough. It describes the past; it does not predict.' },
      { h: 'Watch out', p: 'This is for learning, not advice. It never says buy or sell.' },
    ],
  },
  {
    id: 'tracking-your-gold',
    title: 'Tracking your gold',
    parent: 'mygold',
    lesson: 'tracking-gold',
    reviewed: null,
    steps: [
      { h: 'Worth today', p: 'Net gold weight times today’s {city} rate for that karat. This is the gold’s melt value, not what a shop will pay.' },
      { h: 'Gain or loss', p: 'Compared with everything you paid, including making charges and {gst} GST. A new piece starts behind because those are not gold you can sell back.' },
      { h: 'If sold today', p: 'An estimate after a shop deduction you can change. Real offers vary, so ask the shop.' },
      { h: 'Private', p: 'Your pieces are kept only on this phone. Back them up from the menu: if you clear the browser or lose the phone, they are gone.' },
    ],
  },
  {
    id: 'what-you-pay',
    title: 'What you really pay',
    parent: 'calculator',
    lesson: 'making-charges',
    reviewed: null,
    steps: [
      { h: 'Buying', p: 'Gold value is weight times the rate. Add the making charge, then {gst} GST on the gold and {makingGst} on the making charge.' },
      { h: 'Making charge', p: 'Shops quote it as a percent of gold value or rupees per gram. Ask whether wastage is already inside it.' },
      { h: 'Selling', p: 'Shops usually pay near melt value minus a deduction. Making charges and GST are not returned.' },
      { h: 'Watch out', p: 'Everything here is an estimate. The shop’s bill is the final word.' },
    ],
  },
  {
    id: 'shop-premium',
    title: 'The shop premium',
    parent: 'main',
    lesson: 'how-rate-built',
    reviewed: null,
    steps: [
      { h: 'What it is', p: 'The extra on top of the world price and import duty that covers dealer margin and how local boards differ. Ibriz starts at {premium}.' },
      { h: 'Why it is only an estimate', p: 'Nobody publishes one official Tamil Nadu number. {premium} is a starting guess until it is checked against real shop rates.' },
      { h: 'Match your jeweller', p: 'Compare the rate for 1 gram of the same karat, before making charges and GST, with your jeweller’s board. Raise or lower the premium so Ibriz matches.' },
      { h: 'Per city', p: 'Each city keeps its own adjustment. Your change stays on this phone.' },
    ],
  },
]

export const fill = (text: string, v: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''))

export const pctText = (fraction: number, digits = 0) => `${(fraction * 100).toFixed(digits).replace(/\.0+$/, '')}%`
