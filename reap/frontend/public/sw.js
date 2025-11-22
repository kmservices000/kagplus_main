const getAppBase = () => {
  // Derive the scope path (e.g., "/reap/") so the SW works under subpaths.
  const scopePath = new URL(self.registration.scope).pathname
  return scopePath.endsWith('/') ? scopePath : `${scopePath}/`
}

const APP_BASE = getAppBase()
const INDEX_HTML = `${APP_BASE}index.html`
const CACHE_NAME = 'reap-offline-v1'
const SHELL_ASSETS = [APP_BASE, INDEX_HTML]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Handle navigation requests so client-side routes still resolve offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(INDEX_HTML).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(INDEX_HTML, response.clone())
            return response
          })
        })
      }),
    )
    return
  }

  if (request.method !== 'GET') return

  const requestUrl = new URL(request.url)
  if (requestUrl.origin !== self.location.origin) return
  if (!requestUrl.pathname.startsWith(APP_BASE)) return

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => {})
          return response
        })
        .catch(() => cached)

      return cached || fetchPromise
    }),
  )
})
