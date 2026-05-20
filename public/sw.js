const CACHE_VERSION = 'v1';
const STATIC_CACHE = `ooo-static-${CACHE_VERSION}`;
const IMAGE_CACHE = `ooo-images-${CACHE_VERSION}`;
const API_CACHE = `ooo-api-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/my-academy',
  '/offline',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const valid = new Set([STATIC_CACHE, IMAGE_CACHE, API_CACHE]);
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((n) => n.startsWith('ooo-') && !valid.has(n))
          .map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin (except DO Spaces images)
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin && !url.hostname.endsWith('digitaloceanspaces.com')) return;

  // Only intercept requests within the /my-academy scope
  const inScope =
    url.pathname.startsWith('/my-academy') ||
    url.pathname.startsWith('/offline') ||
    url.pathname.startsWith('/api/') ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    request.destination === 'image' ||
    url.hostname.endsWith('digitaloceanspaces.com');
  if (!inScope) return;

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  if (request.destination === 'image' || url.hostname.endsWith('digitaloceanspaces.com')) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  if (['script', 'style', 'font'].includes(request.destination)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((cached) => cached || caches.match('/offline'))
      )
    );
    return;
  }

  event.respondWith(networkFirst(request, STATIC_CACHE));
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Network error', { status: 408, headers: { 'Content-Type': 'text/plain' } });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? { title: 'OOO Academy', body: 'New update available' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: data.url ? { url: data.url } : undefined,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/my-academy';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
