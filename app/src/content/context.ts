// Dated events that moved the gold price in rupees. Numbers are {tokens}: duty, dutyBefore, dutySince come
// from config and facts (guides.ts), never typed here. DRAFT for the owner's review.
export interface ContextEvent {
  id: string
  date: string // YYYY-MM-DD, when it took effect
  title: string
  body: string
  source: { label: string; url: string }
}

export const contextEvents: ContextEvent[] = [
  {
    id: 'duty-2026',
    date: '2026-05-13',
    title: 'Import duty on gold went up',
    body: 'The effective import duty rose from {dutyBefore} to {duty} from {dutySince} (customs notifications {dutyNotifications}, dated {dutyNotified}). Duty is part of how Ibriz builds the rate, so gold in rupees rose with it, even with the world price unchanged.',
    source: { label: 'Gold import duty in India', url: 'https://insightfultrade.com/gold-import-duty-in-india/' },
  },
]
