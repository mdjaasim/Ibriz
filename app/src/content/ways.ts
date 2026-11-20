// "Ways to hold gold": plain-words comparison. DRAFT for the owner's review.
// Facts only from PLAN.md section 5 and the lessons. Numbers are {tokens} filled from config (see learntext.ts).
export interface Way {
  id: string
  name: string
  cost: string
  protection: string
  selling: string
  unregulated?: boolean // shown in red: not regulated by SEBI or RBI
}

export const ways: Way[] = [
  { id: 'jewellery', name: 'Jewellery', cost: 'Making charges and GST, not returned', protection: 'BIS hallmark; you store it', selling: 'Any jeweller, after a deduction' },
  { id: 'coins-bars', name: 'Coins and bars', cost: 'A small premium and {gstGold} GST', protection: 'BIS hallmark; you store it', selling: 'Jewellers, after a deduction' },
  { id: 'etf', name: 'Gold ETF', cost: 'A small yearly fund fee', protection: 'Regulated by SEBI; nothing to store', selling: 'On the exchange, with a demat account' },
  { id: 'digital', name: 'Digital gold', cost: 'Buy-sell gap and {gstGold} GST', protection: 'Not regulated by SEBI or RBI', selling: 'Back through the same app', unregulated: true },
]

export const sgbNote = 'New Sovereign Gold Bonds are no longer issued.'
