// Browser side of Web Push. Nothing here ever sends holdings: only a push address and a price rule go to the server.
export type PushState = 'ok' | 'install' | 'unsupported' | 'denied'

const isIos = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true

/** Can this phone get notifications right now? iPhone only after Add to Home Screen (iOS 16.4+). */
export function pushState(): PushState {
  if (isIos() && !isStandalone()) return 'install'
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'denied') return 'denied'
  return 'ok'
}

const toBytes = (b64url: string) => {
  const pad = '='.repeat((4 - (b64url.length % 4)) % 4)
  const bin = atob(b64url.replace(/-/g, '+').replace(/_/g, '/') + pad)
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}

export interface SubscriptionJSON { endpoint: string; keys: { p256dh: string; auth: string } }

/** Asks for permission (once) and returns this phone's push subscription. Throws a plain-words Error. */
export async function subscribe(vapidPublic: string): Promise<SubscriptionJSON> {
  const state = pushState()
  if (state === 'install') throw new Error('On iPhone, add Ibriz to your Home Screen first.')
  if (state === 'unsupported') throw new Error('This browser cannot show notifications.')
  if (state === 'denied') throw new Error('Notifications are blocked for Ibriz. Allow them in your browser settings.')
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new Error('Notifications were not allowed.')
  const reg = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, rej) => setTimeout(() => rej(new Error('The app is still getting ready. Try again in a moment.')), 5000)),
  ])
  const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toBytes(vapidPublic) as BufferSource }))
  const j = sub.toJSON()
  if (!j.endpoint || !j.keys?.p256dh || !j.keys?.auth) throw new Error('Could not set up notifications on this phone.')
  return { endpoint: j.endpoint, keys: { p256dh: j.keys.p256dh, auth: j.keys.auth } }
}
