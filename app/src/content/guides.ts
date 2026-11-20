// Guide copy. DRAFT: every guide waits for the owner's review (reviewed: null until then).
// Numbers are never typed here: use the tokens below, filled in from config / the rate engine.
//   {duty} {premium} {gst} {makingGst} {sovereign} {karat} {city} {dutySince}
export interface Guide {
  id: string
  title: string
  parent: 'main' | 'charts' | 'mygold' | 'calculator' | 'alerts' | 'compare' | 'stagedbuying' | 'breakeven' | 'goals' | 'season' | 'context' // the screen the guide opens over
  lesson?: string // id of the lesson with the longer version
  reviewed: string | null // 'YYYY-MM-DD' once the owner has checked it
  steps: { h: string; p: string }[]
}

// Facts that change with policy. Update here when the rules change; owner reviews.
export const facts = {
  dutySince: '13 May 2026', // effective date of the current import duty
  dutyBefore: 0.06, // effective import duty before that date
  dutyNotifications: '15/2026 and 16/2026', // customs notifications that set it
  dutyNotified: '12 May 2026', // date of those notifications
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
  {
    id: 'which-form-suits-you',
    title: 'Which form suits you',
    parent: 'compare',
    lesson: 'which-form-suits-you',
    reviewed: null,
    steps: [
      { h: 'What it is', p: 'The same gold held in different ways. Each has its own extra costs, its own protections and its own way out.' },
      { h: 'How to read it', p: 'Extra cost is what you pay beyond the gold. Protection says who regulates it and who keeps it safe. Selling says how you turn it back into money.' },
      { h: 'Watch out', p: 'Anything marked in red is not regulated by SEBI or RBI. Read who holds the gold and what happens if the company stops.' },
      { h: 'Not advice', p: 'Ibriz does not say which to choose. It lays the differences side by side so you can decide.' },
    ],
  },
  {
    id: 'staged-buying',
    title: 'Buying in steps',
    parent: 'stagedbuying',
    lesson: 'staged-buying',
    reviewed: null,
    steps: [
      { h: 'What it is', p: 'Splitting one budget into equal purchases over weeks or months instead of buying once.' },
      { h: 'What it shows', p: 'How many grams each purchase buys at today’s price, with making charges and {gst} GST included if you add them.' },
      { h: 'The two extra lines', p: 'The same budget if the price were a little lower or higher. It shows how much the price matters. It does not say which will happen.' },
      { h: 'Watch out', p: 'This is arithmetic, not a forecast. Buying in steps does not promise a lower average price.' },
    ],
  },
  {
    id: 'break-even',
    title: 'Getting back what you paid',
    parent: 'breakeven',
    lesson: 'break-even',
    reviewed: null,
    steps: [
      { h: 'What it is', p: 'The rate gold must reach, per gram, for a piece to be worth what you paid for it.' },
      { h: 'Two answers', p: 'The first counts the gold alone. The second also takes off a shop deduction, because that is what a shop usually keeps when it buys back.' },
      { h: 'Why it is higher', p: 'You paid making charges and {gst} GST on top of the gold. Those are not returned when you sell.' },
      { h: 'Watch out', p: 'The deduction is an estimate you can change. Ask the shop for its real figure.' },
    ],
  },
  {
    id: 'saving-goals',
    title: 'Saving towards a goal',
    parent: 'goals',
    lesson: 'gold-goals',
    reviewed: null,
    steps: [
      { h: 'What it is', p: 'A target in grams or rupees by a date. Ibriz works out how much to put in each month.' },
      { h: 'Progress', p: 'Counted from the gold in My Gold, which stays only on this phone. Nothing about your goal is sent anywhere.' },
      { h: 'The monthly amount', p: 'Uses today’s all-in price, so it changes when the price changes. A rupee goal is turned into grams at today’s rate.' },
      { h: 'Watch out', p: 'It is arithmetic, not a forecast. If the price moves, the amount needed moves with it.' },
    ],
  },
  {
    id: 'gold-occasions',
    title: 'Gold and occasions',
    parent: 'season',
    lesson: 'gold-occasions',
    reviewed: null,
    steps: [
      { h: 'What it is', p: 'The next festivals when many Tamil Nadu families buy gold, and how many days away each is.' },
      { h: 'Where today sits', p: 'Compares today’s price with the range Ibriz has saved. It looks backwards only.' },
      { h: 'Dates', p: 'Taken from public panchang calendars. They can differ by a day, so check yours.' },
      { h: 'Watch out', p: 'Nothing here predicts a price. Shops may run offers around festivals, so compare the whole bill.' },
    ],
  },
  {
    id: 'what-moved-the-price',
    title: 'What moved the price',
    parent: 'context',
    lesson: 'what-moved-the-price',
    reviewed: null,
    steps: [
      { h: 'What it is', p: 'Dated events that changed the gold price in rupees, such as a change in import duty.' },
      { h: 'Biggest moves', p: 'The largest day-to-day changes in the prices Ibriz has saved. It shows when they happened, not why.' },
      { h: 'Why it matters', p: 'A jump can come from the world price, the rupee or a policy change. Checking the date helps you tell them apart.' },
      { h: 'Watch out', p: 'Past moves do not tell you what comes next.' },
    ],
  },
  {
    id: 'setting-a-useful-alert',
    title: 'Setting a useful alert',
    parent: 'alerts',
    lesson: 'useful-alert',
    reviewed: null,
    steps: [
      { h: 'Two kinds', p: 'A price alert tells you when {karat}K reaches a rate you pick. A daily move alert tells you when the price moves a set percent in one day.' },
      { h: 'Pick a distance that matters', p: 'A target a few percent away from today is reached in days or weeks. A target very close to today fires over and over and stops being useful.' },
      { h: 'Fewer is better', p: 'A price alert fires once and then switches itself off. Turn it back on, or set a new target, when you want another.' },
      { h: 'Private', p: 'An alert holds only a price and this phone’s notification address, never what you own. On iPhone, notifications need Ibriz on your Home Screen.' },
    ],
  },
]

export const fill = (text: string, v: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''))

export const pctText = (fraction: number, digits = 0) => `${(fraction * 100).toFixed(digits).replace(/\.0+$/, '')}%`
