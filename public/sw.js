/**
 * KaonTa Bohol - Service Worker
 * Provides offline caching for previously viewed restaurants, dishes, and app shell.
 */

const STATIC_CACHE = 'kaonta-static-v1';
const RESTAURANT_CACHE = 'kaonta-restaurant-cache-v1';
const ASSETS_CACHE = 'kaonta-assets-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
];

// Install: precache initial shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-caching some static assets skipped:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: cleanup old caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (![STATIC_CACHE, RESTAURANT_CACHE, ASSETS_CACHE].includes(key)) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // 1. Restaurant Details and Discovery API calls (/api/businesses/*, /api/products, etc.)
  if (url.pathname.startsWith('/api/businesses') || url.pathname.startsWith('/api/products') || url.pathname.startsWith('/api/categories') || url.pathname.startsWith('/api/municipalities')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // If valid response, clone and cache it for offline use
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(RESTAURANT_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Network failed (device is offline). Try finding matching cached response
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            // Return cached version with custom offline header
            const headers = new Headers(cachedResponse.headers);
            headers.set('X-KaonTa-Offline-Cache', 'true');
            return new Response(await cachedResponse.blob(), {
              status: cachedResponse.status,
              statusText: cachedResponse.statusText,
              headers,
            });
          }

          // Return JSON error response if not cached
          return new Response(
            JSON.stringify({
              error: 'You are currently offline, and this restaurant details have not been cached yet.',
              isOffline: true,
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        })
    );
    return;
  }

  // 2. Images (Unsplash, external photos, icons)
  if (
    request.destination === 'image' ||
    url.hostname.includes('unsplash.com') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif|ico)$/i)
  ) {
    event.respondWith(
      caches.open(ASSETS_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then((networkResponse) => {
              if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => {
              // Return nothing or cached placeholder if available
              return caches.match('/icon.svg');
            });
        });
      })
    );
    return;
  }

  // 3. Navigation / HTML Document requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html').then((matching) => {
          return matching || caches.match('/');
        });
      })
    );
    return;
  }

  // 4. Default Stale-While-Revalidate for other static assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
