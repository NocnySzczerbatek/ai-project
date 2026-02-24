/* Service Worker â€” Cobblemon Mastery Guide
   Cache'uje statyczne zasoby dla szybszego Ĺ‚adowania */

const CACHE_NAME = 'cobblemon-v13.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/arena.html',
  '/manifest.json',
  '/css/variables.css?v=12',
  '/css/base.css?v=12',
  '/css/layout.css?v=12',
  '/css/components.css?v=12',
  '/css/pokemon.css?v=12',
  '/css/competitive.css?v=12',
  '/css/pages.css?v=12',
  '/css/evolution.css?v=12',
  '/css/glassmorphism.css?v=12',
  '/css/responsive.css?v=12',
  '/css/arena.css',
  '/assets/styles.css?v=12',
  '/js/config.js?v=12',
  '/js/i18n.js?v=12',
  '/js/types.js?v=12',
  '/js/data.js?v=12',
  '/js/state.js?v=12',
  '/js/favorites.js?v=12',
  '/js/team.js?v=12',
  '/js/evolution.js?v=12',
  '/js/weakness.js?v=12',
  '/js/battle.js?v=12',
  '/js/detail.js?v=12',
  '/js/calculator.js?v=12',
  '/js/pages.js?v=12',
  '/js/utils.js?v=12',
  '/js/app.js?v=12',
  '/js/arena.js'
];

/* Instalacja â€” cache'uj zasoby statyczne */
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

/* Aktywacja â€” usuĹ„ stare wersje cache */
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

/* Fetch â€” strategia stale-while-revalidate dla statycznych, network-first dla API */
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  /* Ĺ»Ä…dania do PokeAPI â€” network-first z fallbackiem na cache */
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

  /* Zasoby statyczne â€” cache-first */
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
