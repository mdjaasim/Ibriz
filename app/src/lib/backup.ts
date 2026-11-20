import type { Piece } from './holdings.svelte'
import { load, save } from './storage'

// Backup file: JSON, optionally encrypted with a passphrase (PBKDF2 -> AES-GCM). Never leaves the phone
// unless the user shares the file themselves.

const KDF_ITERATIONS = 250_000

const b64 = (buf: ArrayBuffer | Uint8Array) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s)
}
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))

async function key(pass: string, salt: Uint8Array): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: KDF_ITERATIONS, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
}

export async function makeBackup(pieces: Piece[], passphrase?: string): Promise<string> {
  const payload = JSON.stringify({ pieces })
  if (!passphrase) return JSON.stringify({ app: 'ibriz', version: 1, exportedAt: new Date().toISOString(), encrypted: false, pieces })
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await key(passphrase, salt), new TextEncoder().encode(payload))
  return JSON.stringify({ app: 'ibriz', version: 1, exportedAt: new Date().toISOString(), encrypted: true, salt: b64(salt), iv: b64(iv), data: b64(ct) })
}

export function isEncrypted(text: string): boolean {
  try { return JSON.parse(text).encrypted === true } catch { return false }
}

export async function readBackup(text: string, passphrase?: string): Promise<Piece[]> {
  let f: any
  try { f = JSON.parse(text) } catch { throw new Error('That file is not an Ibriz backup.') }
  if (f?.app !== 'ibriz') throw new Error('That file is not an Ibriz backup.')
  if (!f.encrypted) return f.pieces as Piece[]
  if (!passphrase) throw new Error('This backup needs its passphrase.')
  try {
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(f.iv) as BufferSource }, await key(passphrase, unb64(f.salt)), unb64(f.data) as BufferSource)
    return JSON.parse(new TextDecoder().decode(pt)).pieces as Piece[]
  } catch {
    throw new Error('Wrong passphrase, or the file is damaged.')
  }
}

export const lastBackup = () => load<string | null>('lastBackup', null)
export const markBackedUp = () => save('lastBackup', new Date().toISOString())

/** True when there are pieces and no backup within `days`. */
export function backupDue(hasPieces: boolean, days: number, now = Date.now()): boolean {
  if (!hasPieces) return false
  const last = lastBackup()
  return !last || now - Date.parse(last) > days * 86400000
}

export function downloadText(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url; a.download = name; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Shrink a bill photo and return a JPEG data URL (stays on the device). */
export function shrinkImage(file: File, maxPx: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const k = Math.min(1, maxPx / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k)
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL('image/jpeg', 0.75))
    }
    img.onerror = () => reject(new Error('Could not read that photo.'))
    img.src = url
  })
}
