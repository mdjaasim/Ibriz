// Calculator and learning settings that are not rates. Change them here, not in screens.
export const calcLimits = {
  makingMaxPct: 30,
  deductionMaxPct: 15,
  stepPct: 0.5,
  weightMaxG: 100000,
}
// 24K is stamped 999 on hallmarks (BIS), not 1000. Purity for the other karats comes from rate.config.
export const pureGoldFineness = 999
// Where the Hallmark screen sends people to verify a HUID (BIS hallmarking page; BIS Care app is named there).
export const bisHallmarkUrl = 'https://www.bis.gov.in/hallmarking-overview/hallmarking-faqs/hallmarking-faq'
