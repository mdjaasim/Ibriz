// Every number or rule that can change lives here (or comes from the Worker's /api/config).
// Screens and guides read from this; never write these values into a screen or a guide.

export const API_BASE: string = import.meta.env.VITE_API_BASE ?? ''

export interface AppConfig {
  duty: number // import duty, fraction
  premium: number // shop premium, fraction
  gstGold: number // GST on gold value, fraction
  gstMaking: number // GST on making charges, fraction
  gramsPerSovereign: number
  purity: Record<string, number> // karat -> share of pure gold
  karats: number[] // order shown in tabs
  defaultKarat: number
  cities: string[]
  defaultCity: string
  referenceCity: string // the benchmark the statewide rate is based on
  staleAfterMinutes: number // after this the rate is shown as delayed
  refreshSeconds: number // how often the app asks for a new rate
  defaultMakingPct: number // calculator starting point, user can change
  defaultSellDeductionPct: number // estimate of shop deduction when selling
  maxPremiumAdjustPct: number // limit of the premium slider, each way
  reading: { lowPct: number; highPct: number } // percentile bands for the one-line reading
  chartDefaultRange: string
}

// Fallback used until the Worker answers (and offline on first run). The Worker's
// /api/config replaces duty, premium, GST and purity with the live settings.
export const defaults: AppConfig = {
  duty: 0.15,
  premium: 0.03,
  gstGold: 0.03,
  gstMaking: 0.05,
  gramsPerSovereign: 8,
  purity: { '24': 1, '22': 0.916, '18': 0.75, '14': 0.585 },
  karats: [24, 22, 18, 14],
  defaultKarat: 22,
  cities: ['Chennai', 'Coimbatore', 'Madurai', 'Trichy'],
  defaultCity: 'Chennai',
  referenceCity: 'Chennai',
  staleAfterMinutes: 15,
  refreshSeconds: 60,
  defaultMakingPct: 12,
  defaultSellDeductionPct: 5,
  maxPremiumAdjustPct: 3,
  reading: { lowPct: 10, highPct: 90 },
  chartDefaultRange: '1m',
}
