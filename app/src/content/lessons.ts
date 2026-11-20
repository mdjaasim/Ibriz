// Lessons: drafted for the owner to review before they ship. `reviewed: null` means not reviewed yet.
// Text may contain {tokens} (see learntext.ts) and [[glossary-id|label]] links. Never type a rate, duty,
// GST or purity number here: use the tokens so a policy change updates every lesson.
export interface Source { label: string; url: string }
export interface Lesson {
  id: string
  title: string
  group: string // chapter title
  reviewed: string | null // ISO date the owner last reviewed it; null = not yet
  body: string[]
  minutes?: number
  summary?: string
  figure?: 'purity'
  sources?: Source[]
}
export interface Chapter { id: string; numeral: string; title: string; blurb: string }

export const chapters: Chapter[] = [
  { id: 'basics', numeral: 'I', title: 'Gold basics', blurb: 'Purity, hallmarks, the sovereign' },
  { id: 'buying', numeral: 'II', title: 'Buying wisely', blurb: 'Making charges, GST, fair prices' },
  { id: 'selling', numeral: 'III', title: 'Selling and exchanging', blurb: 'What you get back, and why' },
  { id: 'holding', numeral: 'IV', title: 'Other ways to hold gold', blurb: 'Coins, ETFs, digital gold' },
]

const BIS: Source = { label: 'BIS hallmarking FAQ', url: 'https://www.bis.gov.in/hallmarking-overview/hallmarking-faqs/hallmarking-faq' }
const BANKBAZAAR: Source = { label: 'Tamil Nadu gold rate (BankBazaar)', url: 'https://www.bankbazaar.com/gold-rate-tamil-nadu.html' }

export const lessons: Lesson[] = [
  {
    id: 'why-22k', title: 'Why jewellery is 22K, not 24K', group: 'Gold basics', reviewed: null, minutes: 2, figure: 'purity',
    summary: 'Pure gold is too soft to hold a shape. A little copper and silver make it strong enough to wear every day.',
    body: [
      "Gold's purity is counted in [[karat|karats]], out of 24. Pure gold, 24K, is so soft that a thin chain would bend out of shape with daily wear.",
      'So jewellers mix in a little copper and silver. 22K is {purity:22} gold, which is why its [[hallmark]] reads {fineness:22}.',
      '@figure',
      'That is also why the 22K rate is lower than the 24K rate: you pay for the gold that is actually there.',
    ],
    sources: [BIS],
  },
  {
    id: 'sovereign', title: 'The sovereign, explained', group: 'Gold basics', reviewed: null, minutes: 2,
    summary: 'The unit Tamil Nadu shops quote.',
    body: [
      'In Tamil Nadu, shops quote gold by the [[sovereign]], also called a pavan. One sovereign is {sovereign} grams.',
      'Ibriz shows the rate per gram and per sovereign, so you can compare with a shop board without doing sums.',
      'Remember to check which purity a price is for. A sovereign of 22K and a sovereign of 24K are the same weight but not the same price.',
    ],
    sources: [BANKBAZAAR],
  },
  {
    id: 'how-rate-built', title: 'How the rate is built', group: 'Gold basics', reviewed: null, minutes: 3,
    summary: 'World price, rupee, duty and a small premium.',
    body: [
      'We start with the world price of gold in US dollars per ounce and convert it to rupees per gram using the dollar-rupee rate.',
      'Then we add the [[import-duty|import duty]], currently {duty}, and a small shop premium, currently {premium}.',
      'The result is an indicative rate, not a shop quote. Shops add their own margin, and the day’s board rate can differ. GST and making charges are not included: they appear only in the calculator.',
    ],
  },
  {
    id: 'why-price-moves', title: 'Why the price moves', group: 'Gold basics', reviewed: null, minutes: 2,
    summary: 'What the change figure is measured against.',
    body: [
      'The change on the Today screen compares the rate now with the rate about a day ago, from our own saved readings.',
      'Gold moves with the world gold price and with the rupee. If the dollar gets dearer against the rupee, gold in rupees rises even when the world price is flat. A change in import duty moves it too.',
      'One day proves little. Look at the chart over a month before reading anything into it.',
    ],
  },
  {
    id: 'check-purity', title: 'Checking purity', group: 'Gold basics', reviewed: null, minutes: 2,
    summary: 'The three marks on a hallmarked piece.',
    body: [
      'A hallmarked piece carries three marks: the BIS logo, the carat and [[fineness]] (for example 22K{fineness:22}), and a six-character [[huid|HUID]].',
      'You can check a HUID in the BIS Care app. Do it before you pay, not after.',
      'The Hallmark tool in the menu walks you through the three marks.',
    ],
    sources: [BIS],
  },
  {
    id: 'making-charges', title: 'What you really pay', group: 'Buying wisely', reviewed: null, minutes: 3,
    summary: 'Gold value, making charges and GST add up to the bill.',
    body: [
      'A jewellery bill has the gold value (weight × rate), the [[making-charges|making charges]], and [[gst|GST]].',
      'GST is {gstGold} on the gold value and {gstMaking} on the making charges.',
      'The calculator in the menu shows each line so you can check a bill step by step.',
    ],
  },
  {
    id: 'fair-making', title: 'Is the making charge fair?', group: 'Buying wisely', reviewed: null, minutes: 2,
    summary: 'Percent, per gram, and wastage.',
    body: [
      'Shops quote making charges as a percentage of gold value or as rupees per gram. Intricate work costs more than plain.',
      'Ask whether [[wastage]] is separate or already inside the making charge, so you do not pay for it twice.',
      'Compare the total, not the percentage: two shops can reach the same total in different ways.',
    ],
  },
  {
    id: 'net-weight', title: 'Gross and net weight', group: 'Buying wisely', reviewed: null, minutes: 2,
    summary: 'Stones weigh, but they are not gold.',
    body: [
      'Gross weight is everything on the scale. [[net-weight|Net weight]] is the gold alone, after stones and other materials.',
      'You pay the gold rate only for net weight. Check the bill shows both.',
    ],
  },
  {
    id: 'buying-checklist', title: 'Before you pay', group: 'Buying wisely', reviewed: null, minutes: 2,
    summary: 'A short checklist.',
    body: [
      'Check the hallmark marks. Ask for a bill that lists net weight, rate, making charges and GST separately.',
      'Keep the bill: it records the [[huid|HUID]] and what you paid, and you will want it when you sell.',
    ],
  },
  {
    id: 'melt-vs-shop', title: 'Melt value and shop price', group: 'Selling and exchanging', reviewed: null, minutes: 3,
    summary: 'Why resale returns less than you paid.',
    body: [
      '[[melt-value|Melt value]] is the gold in a piece worth at today’s rate. When you bought, you also paid making charges and GST.',
      'When a shop buys back, it usually pays near melt value and takes a deduction. Making charges and GST are not returned, which is why selling gives less than the bill.',
    ],
  },
  {
    id: 'shop-deduction', title: 'The shop deduction', group: 'Selling and exchanging', reviewed: null, minutes: 2,
    summary: 'Ask before you sell.',
    body: [
      'Shops take a deduction when they buy old gold. It differs from shop to shop, so ask. The calculator lets you try different deductions.',
      'Any figure Ibriz shows for selling is an estimate, not an offer.',
    ],
  },
  {
    id: 'exchange-old', title: 'Exchanging old gold', group: 'Selling and exchanging', reviewed: null, minutes: 2,
    summary: 'Swap for a new piece.',
    body: [
      'Many shops let you exchange old jewellery against a new piece. Ask for the old gold to be tested and weighed in front of you, and for the rate and deduction to be written on the bill.',
    ],
  },
  {
    id: 'forms', title: 'Jewellery, coins and bars', group: 'Other ways to hold gold', reviewed: null, minutes: 2,
    summary: 'Which form suits which goal.',
    body: [
      'Jewellery is for wearing and carries making charges. Coins and bars are 24K ([[fineness]] {fineness:24}) and cost less to make, so more of what you pay is gold.',
    ],
  },
  {
    id: 'gold-etf', title: 'Gold ETFs and funds', group: 'Other ways to hold gold', reviewed: null, minutes: 2,
    summary: 'Gold without storing it.',
    body: [
      'Gold ETFs and gold funds track the gold price and are held electronically. They need a demat account or a fund account, and they carry small fund costs.',
    ],
  },
  {
    id: 'digital-gold', title: 'Digital gold', group: 'Other ways to hold gold', reviewed: null, minutes: 2,
    summary: 'Not regulated like funds.',
    body: [
      'Digital gold sold through apps is not regulated by SEBI or RBI, and SEBI warned the public about it in November 2025. Read the terms and check who holds the gold before putting money in.',
    ],
    sources: [{ label: 'SEBI warning on digital gold (Moneylife)', url: 'https://www.moneylife.in/article/sebi-warns-against-investing-in-unregulated-digital-gold-and-egold-products/78789.html' }],
  },
  {
    id: 'sgb', title: 'Sovereign Gold Bonds', group: 'Other ways to hold gold', reviewed: null, minutes: 2,
    summary: 'No new issues.',
    body: [
      'Sovereign Gold Bonds are no longer issued. They can only be bought and sold on the market, and the tax treatment has changed. Check the current rules before acting.',
    ],
  },
]
