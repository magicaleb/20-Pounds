const CACHE_NAME = 'calorie-flow-v2';
const BASE_URL = self.registration.scope;
const INDEX_URL = new URL('index.html', BASE_URL).toString();
const ASSETS = [
  new URL('', BASE_URL).toString(),
  INDEX_URL,
  new URL('styles.css', BASE_URL).toString(),
  new URL('app.js', BASE_URL).toString(),
  new URL('manifest.webmanifest', BASE_URL).toString(),
  new URL('icons/icon.svg', BASE_URL).toString()
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(INDEX_URL));
    })
  );
});
