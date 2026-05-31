// Daily Quest - Service Worker
const CACHE_NAME = 'daily-quest-v1';
const ASSETS = [
  './daily_quest_v3.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=Fredoka+One&family=Tajawal:wght@400;700;900&display=swap'
];

// Install - cache all assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS.filter(a => !a.startsWith('http')));
    }).then(() => self.skipWaiting())
  );
});

// Activate - delete old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch - serve from cache, fallback to network
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Cache Google Fonts dynamically
        if (e.request.url.includes('fonts.googleapis') || 
            e.request.url.includes('fonts.gstatic')) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback
        return caches.match('./daily_quest_v3.html');
      });
    })
  );
});
