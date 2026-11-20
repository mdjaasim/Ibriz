// Glossary drafts. Numbers are {tokens} filled from config. Owner reviews before release.
export interface Term { id: string; term: string; meaning: string }

export const glossary: Term[] = [
  { id: 'bis', term: 'BIS', meaning: 'Bureau of Indian Standards. The government body that runs hallmarking in India.' },
  { id: 'fineness', term: 'Fineness', meaning: 'Parts of pure gold in a thousand. 22K is {fineness:22}, 18K is {fineness:18}.' },
  { id: 'gst', term: 'GST', meaning: 'Tax on your bill: {gstGold} on the gold, {gstMaking} on making charges.' },
  { id: 'hallmark', term: 'Hallmark', meaning: 'The BIS stamp that proves purity: logo, carat and fineness, HUID.' },
  { id: 'huid', term: 'HUID', meaning: 'A six-character code unique to each hallmarked piece.' },
  { id: 'ibja', term: 'IBJA', meaning: 'India Bullion and Jewellers Association. Publishes a daily benchmark rate.' },
  { id: 'import-duty', term: 'Import duty', meaning: 'Tax on gold brought into India: {duty} at present.' },
  { id: 'karat', term: 'Karat', meaning: 'Purity out of 24. 22K is {purity:22} gold.' },
  { id: 'making-charges', term: 'Making charges', meaning: 'What the shop charges to craft a piece, usually a percentage.' },
  { id: 'melt-value', term: 'Melt value', meaning: 'What the gold in a piece is worth by weight and purity, ignoring making charges and design.' },
  { id: 'net-weight', term: 'Net weight', meaning: 'The weight of the gold alone, after stones and other materials are taken out.' },
  { id: 'sovereign', term: 'Sovereign', meaning: '{sovereign} grams of gold, also called a pavan.' },
  { id: 'wastage', term: 'Wastage', meaning: 'An extra charge some shops add for gold lost while making a piece. Ask whether it is already inside the making charge.' },
]
