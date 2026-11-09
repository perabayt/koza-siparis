/* Koza Sipariş servis çalışanı: kurulabilirlik + çevrimdışı açılış.
   Sayfa ve kod: önce ağ, olmazsa önbellek. Ürün görselleri: önce önbellek. */
const CACHE = 'koza-v5'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()))
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return
  const isImg = /\/p\/\d+-[sl]\.webp$/.test(req.url)
  if (isImg) {
    e.respondWith(caches.open(CACHE).then(async (c) => {
      const hit = await c.match(req)
      if (hit) return hit
      const res = await fetch(req)
      if (res.ok) c.put(req, res.clone())
      return res
    }))
    return
  }
  e.respondWith(fetch(req).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)) }
    return res
  }).catch(() => caches.match(req).then((r) => r || caches.match('./'))))
})
