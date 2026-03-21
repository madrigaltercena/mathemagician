// Mathemagician Service Worker
// Simplified: passthrough to network only (no caching)
// to avoid stale cache issues with React bundles

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
