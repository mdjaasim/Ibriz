// Tamil Nadu occasions when many families buy gold. Dates were looked up on 21 Nov 2026 from public
// panchang and calendar sites, which can differ by a day. `confirmed: false` = the owner should check it
// against a Tamil panchangam before it is trusted. The app only shows how far away each is and where today's
// price sits against Ibriz's own saved history: nothing here predicts a price.
export interface Occasion {
  id: string
  name: string
  date: string // YYYY-MM-DD, Indian date
  note?: string
  confirmed: boolean
  source: { label: string; url: string }
}

export const occasions: Occasion[] = [
  {
    id: 'karthigai-deepam-2026', name: 'Karthigai Deepam', date: '2026-11-24', confirmed: true,
    note: 'Festival of lamps. Some families buy a small piece of gold.',
    source: { label: 'Drik Panchang', url: 'https://www.drikpanchang.com/festivals/karthigai-deepam/karthigai-deepam-date-time.html?year=2026' },
  },
  {
    id: 'pongal-2027', name: 'Thai Pongal', date: '2027-01-15', confirmed: true,
    note: 'Bhogi is the day before. A usual time for new jewellery.',
    source: { label: 'Office Holidays, Tamil Nadu', url: 'https://www.officeholidays.com/holidays/india/tamil-nadu/pongal' },
  },
  {
    id: 'puthandu-2027', name: 'Tamil New Year (Puthandu)', date: '2027-04-14', confirmed: true,
    source: { label: 'Office Holidays, Tamil Nadu', url: 'https://www.officeholidays.com/holidays/india/tamil-nadu/tamil-new-year' },
  },
  {
    id: 'akshaya-tritiya-2027', name: 'Akshaya Tritiya', date: '2027-05-09', confirmed: true,
    note: 'Most sources give 9 May in India; a few overseas calendars show 8 May.',
    source: { label: 'Drik Panchang', url: 'https://www.drikpanchang.com/festivals/akshaya-tritiya/akshaya-tritiya-date-time.html?year=2027' },
  },
  {
    id: 'aadi-perukku-2027', name: 'Aadi Perukku (Aadi 18)', date: '2027-08-03', confirmed: true,
    source: { label: 'Drik Panchang', url: 'https://www.drikpanchang.com/tamil/festivals/aadi-perukku/aadi-perukku-date-time.html?year=2027' },
  },
  {
    id: 'navaratri-2027', name: 'Navaratri begins', date: '2027-09-30', confirmed: true,
    note: 'Ayudha Puja and Vijayadashami follow on about 9 October.',
    source: { label: 'Drik Panchang', url: 'https://www.drikpanchang.com/navratri/navratri-date.html?year=2027' },
  },
  {
    id: 'dhanteras-2027', name: 'Dhanteras', date: '2027-10-27', confirmed: true,
    note: 'Traditionally a day to buy gold, silver or utensils.',
    source: { label: 'Drik Panchang', url: 'https://www.drikpanchang.com/festivals/dhanteras/festivals-dhanteras-puja-timings.html?year=2027' },
  },
  {
    id: 'deepavali-2027', name: 'Deepavali', date: '2027-10-29', confirmed: false,
    note: 'Sources disagree by a day or more. Check your panchangam.',
    source: { label: 'AstroSage', url: 'https://panchang.astrosage.com/festival/diwali?date=2027' },
  },
]
