/* Service Worker — Cobblemon Mastery Guide
   Cache'uje statyczne zasoby dla szybszego ładowania */

const CACHE_NAME = 'cobblemon-v5.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/arena.html',
  '/manifest.json',
  '/css/variables.css',
  '/css/base.css',
  '/css/layout.css',
  '/css/components.css',
  '/css/pokemon.css',
  '/css/competitive.css',
  '/css/pages.css',
  '/css/evolution.css',
  '/css/glassmorphism.css',
  '/css/responsive.css',
  '/css/arena.css',
  '/assets/styles.css',
  '/js/config.js',
  '/js/i18n.js',
  '/js/types.js',
  '/js/data.js',
  '/js/state.js',
  '/js/favorites.js',
  '/js/team.js',
  '/js/evolution.js',
  '/js/weakness.js',
  '/js/battle.js',
  '/js/detail.js',
  '/js/calculator.js',
  '/js/pages.js',
  '/js/utils.js',
  '/js/app.js',
  '/js/arena.js'
];

/* Instalacja — cache'uj zasoby statyczne */
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

/* Aktywacja — usuń stare wersje cache */
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

/* Fetch — strategia stale-while-revalidate dla statycznych, network-first dla API */
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  /* Żądania do PokeAPI — network-first z fallbackiem na cache */
  if (url.hostname === 'pokeapi.co') {
    event.respondWith(
      fetch(event.request).then(function(response) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, clone);
        });
        return response;
      }).catch(function() {
        return caches.match(event.request);
      })
    );
    return;
  }

  /* Zasoby statyczne — cache-first */
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      var fetchPromise = fetch(event.request).then(function(response) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, clone);
        });
        return response;
      }).catch(function() { return cached; });

      return cached || fetchPromise;
    })
  );
});
