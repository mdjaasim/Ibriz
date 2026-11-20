// Indian grouping (5,51,081), real minus sign, plain-words helpers.

const MINUS = '−'

export function indian(n: number, decimals = 0): string {
  const neg = n < 0
  const fixed = Math.abs(n).toFixed(decimals)
  const [int, frac] = fixed.split('.')
  const last3 = int.slice(-3)
  const rest = int.slice(0, -3)
  const grouped = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3 : last3
  return (neg ? MINUS : '') + grouped + (frac ? '.' + frac : '')
}

export const rupees = (n: number, decimals = 0) => '₹' + indian(n, decimals)

export function signed(n: number, decimals = 0): string {
  return (n > 0 ? '+' : n < 0 ? MINUS : '') + indian(Math.abs(n), decimals)
}

export function signedRupees(n: number, decimals = 0): string {
  return (n > 0 ? '+' : n < 0 ? MINUS : '') + '₹' + indian(Math.abs(n), decimals)
}

export function pct(n: number, decimals = 2): string {
  return Math.abs(n).toFixed(decimals) + '%'
}

export function ago(iso: string | number, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000))
  if (s < 60) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} h ago`
  return `${Math.round(h / 24)} d ago`
}

export function clockTime(iso: string | number): string {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  })
}

export function dayLabel(iso: string | number): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Kolkata',
  })
}

export function shortDate(iso: string | number): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Kolkata',
  })
}
