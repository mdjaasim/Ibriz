import { API_BASE, defaults, type AppConfig } from '../config'
import { load, save } from './storage'
import { settings } from './settings.svelte'

export interface Latest {
  updatedAt: string
  goldPriceTime: string
  label: string
  source: string
  xauUsd: number
  usdInr: number
  fxDate: string
  fxStale: boolean
  spotInrPerGram: number
  duty: number
  premium: number
  rate24: number
  rates: Record<string, { perGram: number; perSovereign: number; per10g: number }>
  change24h: { abs: number; pct: number } | null
}

export type Status = 'loading' | 'live' | 'delayed' | 'offline'

class RateStore {
  latest = $state<Latest | null>(load<Latest | null>('rate', null))
  config = $state<AppConfig>({ ...defaults, ...load<Partial<AppConfig>>('config', {}) })
  online = $state(true)
  loading = $state(true)
  now = $state(Date.now())

  /** Adjustment for the chosen city, as a fraction (0 = same as statewide). */
  get cityFactor(): number {
    return 1 + (settings.data.cityAdjust[settings.data.city] ?? 0) / 100
  }

  get status(): Status {
    if (!this.latest) return this.loading ? 'loading' : 'offline'
    if (!this.online) return 'offline'
    const ageMin = (this.now - Date.parse(this.latest.updatedAt)) / 60000
    return this.latest.fxStale || ageMin > this.config.staleAfterMinutes ? 'delayed' : 'live'
  }

  /** 24K rupees per gram for the chosen city. */
  get rate24(): number {
    return (this.latest?.rate24 ?? 0) * this.cityFactor
  }

  purity(karat: number): number {
    return this.config.purity[String(karat)] ?? 0
  }

  perGram(karat: number): number {
    return this.rate24 * this.purity(karat)
  }
  perSovereign(karat: number): number {
    return this.perGram(karat) * this.config.gramsPerSovereign
  }
  per10g(karat: number): number {
    return this.perGram(karat) * 10
  }

  /** Change since yesterday for a karat, in rupees per gram and percent. */
  change(karat: number): { abs: number; pct: number } | null {
    const c = this.latest?.change24h
    if (!c) return null
    return { abs: c.abs * this.purity(karat) * this.cityFactor, pct: c.pct }
  }

  async refresh() {
    try {
      const res = await fetch(API_BASE + '/api/rate', { cache: 'no-cache' })
      if (!res.ok) throw new Error(String(res.status))
      this.latest = (await res.json()) as Latest
      save('rate', this.latest)
      this.online = true
    } catch {
      this.online = false
    } finally {
      this.loading = false
      this.now = Date.now()
    }
  }

  async loadConfig() {
    try {
      const res = await fetch(API_BASE + '/api/config')
      if (!res.ok) return
      const c = (await res.json()) as Partial<AppConfig>
      this.config = { ...this.config, ...c }
      save('config', c)
    } catch {
      /* keep the saved or default config */
    }
  }

  start() {
    this.loadConfig()
    this.refresh()
    setInterval(() => this.refresh(), this.config.refreshSeconds * 1000)
    setInterval(() => (this.now = Date.now()), 30000)
    addEventListener('online', () => this.refresh())
    addEventListener('offline', () => (this.online = false))
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this.refresh()
    })
  }
}

export const rate = new RateStore()
