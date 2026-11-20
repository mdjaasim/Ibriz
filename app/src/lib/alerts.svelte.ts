import { API_BASE } from '../config'
import { rate } from './rate.svelte'
import { holdings } from './holdings.svelte'
import { settings } from './settings.svelte'
import { load, save } from './storage'
import { subscribe, pushState } from './push'
import { indian } from './format'

// Alerts are kept on the phone. The ones set to "notification" also register a price rule with the Worker
// (a push address and a price, never what you own). Every alert is also checked here on each rate refresh,
// so they work with no push at all. Break-even alerts use your pieces, so they never leave the phone.

export type AlertKind = 'price' | 'move' | 'breakeven' | 'monthly'
export type Channel = 'push' | 'app'

export interface LocalAlert {
  id: string
  serverId?: string
  kind: AlertKind
  karat: number
  direction?: 'above' | 'below'
  target?: number // rupees per gram (price) or percent (move)
  pieceId?: string // break-even only
  channel: Channel
  active: boolean
  createdAt: number
  firedAt?: number // last time it was shown or sent
  city: string
}

export interface Hit { alert: LocalAlert; title: string; body: string }

const sameLocalDay = (a: number, b: number) => new Date(a).toDateString() === new Date(b).toDateString()
const sameLocalMonth = (a: number, b: number) => {
  const x = new Date(a), y = new Date(b)
  return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth()
}

async function api<T>(path: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(API_BASE + path, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok) throw new Error(json.error ?? 'The server said no. Try again.')
  return json
}

class AlertsStore {
  list = $state<LocalAlert[]>(load<LocalAlert[]>('alerts', []))
  quiet = $state(load('alertsQuiet', true))
  busy = $state(false)

  private persist() {
    save('alerts', $state.snapshot(this.list))
  }

  /** Alerts whose condition is true right now and not yet acknowledged: shown as banners. */
  get hits(): Hit[] {
    const now = Date.now()
    const out: Hit[] = []
    for (const a of this.list) {
      if (!a.active) continue
      if (a.kind === 'price' && a.target !== undefined && rate.latest) {
        const v = rate.perGram(a.karat)
        const hit = a.direction === 'above' ? v >= a.target : v <= a.target
        if (hit) out.push({ alert: a, title: `${a.karat}K is ${a.direction} ₹${indian(a.target)}`, body: `Now ₹${indian(Math.round(v))} a gram in ${settings.data.city}.` })
      } else if (a.kind === 'move' && a.target !== undefined) {
        const c = rate.change(a.karat)
        if (c && Math.abs(c.pct) >= a.target && !(a.firedAt && sameLocalDay(a.firedAt, now))) {
          out.push({ alert: a, title: `Gold moved ${Math.abs(c.pct).toFixed(1)}% today`, body: `${a.karat}K is ${c.abs < 0 ? 'down' : 'up'} ₹${indian(Math.abs(Math.round(c.abs)))} since yesterday.` })
        }
      } else if (a.kind === 'breakeven' && rate.latest) {
        const p = holdings.pieces.find((x) => x.id === a.pieceId)
        if (p && p.totalPaid && p.netG > 0) {
          const be = p.totalPaid / p.netG
          if (rate.perGram(p.karat) >= be) out.push({ alert: a, title: `${p.name} breaks even`, body: `${p.karat}K is at ₹${indian(Math.round(rate.perGram(p.karat)))} a gram, past the ₹${indian(Math.round(be))} you paid.` })
        }
      } else if (a.kind === 'monthly') {
        if (!(a.firedAt && sameLocalMonth(a.firedAt, now))) out.push({ alert: a, title: 'Your monthly gold check', body: 'Open My Gold to see what your gold is worth.' })
      }
    }
    return out
  }

  /** Short label for the list. */
  label(a: LocalAlert): { title: string; sub: string } {
    const where = a.channel === 'push' ? 'notification' : 'in the app'
    if (a.kind === 'price') return { title: `${a.karat}K ${a.direction === 'below' ? 'drops below' : 'rises above'} ₹${indian(a.target ?? 0)}`, sub: `Price · ${where}` }
    if (a.kind === 'move') return { title: `${a.karat}K moves ${a.target}% in a day`, sub: `Daily move · ${where}` }
    if (a.kind === 'breakeven') {
      const p = holdings.pieces.find((x) => x.id === a.pieceId)
      const be = p?.totalPaid && p.netG > 0 ? ` At ₹${indian(Math.round(p.totalPaid / p.netG))} a gram` : ''
      return { title: `${p?.name ?? 'A piece'} breaks even`, sub: `${be ? be.trim() + ' · ' : ''}in the app` }
    }
    return { title: 'Monthly gold check', sub: `On the 1st · ${where}` }
  }

  async add(input: Omit<LocalAlert, 'id' | 'active' | 'createdAt' | 'city' | 'serverId'>): Promise<LocalAlert> {
    this.busy = true
    try {
      const alert: LocalAlert = { ...input, id: crypto.randomUUID(), active: true, createdAt: Date.now(), city: settings.data.city }
      if (alert.channel === 'push') {
        const vapid = rate.config.vapidPublic
        if (!vapid) throw new Error('Notifications are not set up on the server yet.')
        const sub = await subscribe(vapid)
        const created = await api<{ id: string }>('/api/alerts', 'POST', {
          subscription: sub,
          kind: alert.kind,
          karat: alert.karat,
          direction: alert.direction,
          target: alert.target,
          quiet: this.quiet,
          city: alert.city,
          cityAdjust: settings.data.cityAdjust[alert.city] ?? 0,
        })
        alert.serverId = created.id
      }
      this.list.push(alert)
      this.persist()
      return alert
    } finally {
      this.busy = false
    }
  }

  async setActive(id: string, active: boolean) {
    const a = this.list.find((x) => x.id === id)
    if (!a) return
    a.active = active
    if (active) a.firedAt = undefined
    this.persist()
    if (a.serverId) api('/api/alerts/update', 'POST', { id: a.serverId, active }).catch(() => {})
  }

  async remove(id: string) {
    const a = this.list.find((x) => x.id === id)
    this.list = this.list.filter((x) => x.id !== id)
    this.persist()
    if (a?.serverId) api('/api/alerts/' + a.serverId, 'DELETE').catch(() => {})
  }

  /** "Got it" on a banner: one-off alerts switch off, repeating ones wait for the next day or month. */
  dismiss(id: string) {
    const a = this.list.find((x) => x.id === id)
    if (!a) return
    a.firedAt = Date.now()
    if (a.kind === 'price' || a.kind === 'breakeven') {
      a.active = false
      if (a.serverId) api('/api/alerts/update', 'POST', { id: a.serverId, active: false }).catch(() => {})
    }
    this.persist()
  }

  async setQuiet(on: boolean) {
    this.quiet = on
    save('alertsQuiet', on)
    for (const a of this.list) if (a.serverId) api('/api/alerts/update', 'POST', { id: a.serverId, quiet: on }).catch(() => {})
  }

  /** Pulls the server's view (a push alert that already fired is switched off there). */
  async sync() {
    const ids = this.list.filter((a) => a.serverId).map((a) => a.serverId!)
    if (!ids.length) return
    try {
      const res = await api<{ alerts: { id: string; active: number; last_fired: number | null }[] }>('/api/alerts/list', 'POST', { ids })
      const known = new Set(res.alerts.map((r) => r.id))
      for (const r of res.alerts) {
        const a = this.list.find((x) => x.serverId === r.id)
        if (!a) continue
        a.active = !!r.active
        if (r.last_fired) a.firedAt = r.last_fired
      }
      // alerts the server no longer knows (for example its push address expired) stay on the phone as in-app alerts
      for (const a of this.list) if (a.serverId && !known.has(a.serverId)) { a.serverId = undefined; a.channel = 'app' }
      this.persist()
    } catch {
      /* offline: keep what we have */
    }
  }

  get pushState() {
    return pushState()
  }
}

export const alerts = new AlertsStore()

setTimeout(() => alerts.sync(), 1500) // once at start: pick up alerts that fired while the app was closed
