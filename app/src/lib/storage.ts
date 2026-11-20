// Small wrapper: localStorage may be blocked (private windows), so never throw.
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem('ibriz.' + key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}
export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem('ibriz.' + key, JSON.stringify(value))
  } catch {
    /* storage unavailable: the app still works, settings just won't persist */
  }
}
