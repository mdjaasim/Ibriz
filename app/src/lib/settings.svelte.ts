import { defaults } from '../config'
import { load, save } from './storage'

export type Theme = 'night' | 'day' | 'system'
export type Lang = 'en' | 'ta'

interface Persisted {
  theme: Theme
  lang: Lang
  city: string
  karat: number
  // premium adjustment per city, in percentage points (0 = same as statewide)
  cityAdjust: Record<string, number>
  onboarded: boolean
}

const initial: Persisted = {
  theme: 'night',
  lang: 'en',
  city: defaults.defaultCity,
  karat: defaults.defaultKarat,
  cityAdjust: {},
  onboarded: false,
}

class Settings {
  data = $state<Persisted>({ ...initial, ...load<Partial<Persisted>>('settings', {}) })

  set<K extends keyof Persisted>(key: K, value: Persisted[K]) {
    this.data[key] = value
    save('settings', $state.snapshot(this.data))
    this.apply()
  }

  apply() {
    const t = this.data.theme
    const day =
      t === 'day' || (t === 'system' && matchMedia('(prefers-color-scheme: light)').matches)
    document.documentElement.dataset.theme = day ? 'day' : 'night'
    document.documentElement.lang = this.data.lang
  }
}

export const settings = new Settings()
