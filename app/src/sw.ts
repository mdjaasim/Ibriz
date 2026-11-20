// Ibriz service worker: offline cache (precache + fonts) and push notifications for price alerts.
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { StaleWhileRevalidate } from 'workbox-strategies'

const sw = self as any // typed loosely: this file runs in a worker, not the page

precacheAndRoute((self as any).__WB_MANIFEST) // the literal self.__WB_MANIFEST is what the build replaces
cleanupOutdatedCaches()
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html')))
registerRoute(
  ({ url }: { url: URL }) => /^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(url.href),
  new StaleWhileRevalidate({ cacheName: 'fonts' })
)

sw.addEventListener('install', () => sw.skipWaiting())
sw.addEventListener('activate', (e: any) => e.waitUntil(sw.clients.claim()))

// A push carries only { title, body, url, tag }: a price rule, never anything about what the owner holds.
sw.addEventListener('push', (event: any) => {
  let data: { title?: string; body?: string; url?: string; tag?: string } = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { title: 'Ibriz', body: 'Open Ibriz to see today’s rate.' }
  }
  event.waitUntil(
    sw.registration.showNotification(data.title || 'Ibriz', {
      body: data.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: data.tag,
      data: { url: data.url || '/#/main' },
    })
  )
})

sw.addEventListener('notificationclick', (event: any) => {
  event.notification.close()
  const url: string = event.notification.data?.url || '/#/main'
  event.waitUntil(
    (async () => {
      const wins = await sw.clients.matchAll({ type: 'window', includeUncontrolled: true })
      for (const w of wins) {
        if ('focus' in w) {
          await w.focus()
          if ('navigate' in w) await w.navigate(url)
          return
        }
      }
      await sw.clients.openWindow(url)
    })()
  )
})
