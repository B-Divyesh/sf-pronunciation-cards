const CACHE = 'pronunciation-cards-site-v5';
const PAGES = ['/', '/demo/', '/privacy/', '/terms/'];
const CORE = ['/assets/product-mark.svg', '/assets/pronunciation-cards-hero-960.webp'];

async function cachePage(cache, pagePath) {
  const response = await fetch(pagePath, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Could not cache ${pagePath}`);
  const html = await response.clone().text();
  await cache.put(pagePath, response);
  const assetPaths = [...new Set([...html.matchAll(/(?:src|href)="(\/assets\/[^"?]+(?:\?[^"#]*)?)"/g)].map((match) => match[1]))];
  await cache.addAll(assetPaths);
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') return (await caches.match('/')) || Response.error();
    throw error;
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then(async (cache) => {
    await cache.addAll(CORE);
    await Promise.all(PAGES.map((pagePath) => cachePage(cache, pagePath)));
  }).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  const url = new URL(event.request.url);
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request));
  } else if (url.pathname.startsWith('/downloads/')) {
    event.respondWith(fetch(event.request));
  } else if (url.pathname.startsWith('/assets/')) {
    event.respondWith(caches.match(event.request).then((cached) => cached || networkFirst(event.request)));
  } else {
    event.respondWith(networkFirst(event.request));
  }
});
