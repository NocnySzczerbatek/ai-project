/* Service Worker — Cobblemon Mastery Guide
   Cache'uje statyczne zasoby dla szybszego ladowania */

const CACHE_NAME = 'cobblemon-v16.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/arena.html',
  '/manifest.json',
  '/css/variables.css?v=16',
  '/css/base.css?v=16',
  '/css/layout.css?v=16',
  '/css/components.css?v=16',
  '/css/pokemon.css?v=16',
  '/css/competitive.css?v=16',
  '/css/pages.css?v=16',
  '/css/evolution.css?v=16',
  '/css/glassmorphism.css?v=16',
  '/css/responsive.css?v=16',
  '/css/arena.css',
  '/assets/styles.css?v=16',
  '/js/config.js?v=16',
  '/js/i18n.js?v=16',
  '/js/types.js?v=16',
  '/js/utils.js?v=16',
  '/js/data.js?v=16',
  '/js/state.js?v=16',
  '/js/favorites.js?v=16',
  '/js/team.js?v=16',
  '/js/evolution.js?v=16',
  '/js/weakness.js?v=16',
  '/js/battle.js?v=16',
  '/js/detail.js?v=16',
  '/js/calculator.js?v=16',
  '/js/pages.js?v=16',
  '/js/app.js?v=16',
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

/* Aktywacja — usun stare wersje cache */
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

self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/* Fetch — strategia stale-while-revalidate dla statycznych, network-first dla API */
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  /* Zadania do PokeAPI — network-first z fallbackiem na cache */
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
      }).catch(function() {
        return cached || new Response('<h1>Offline</h1><p>Brak polaczenia z internetem. Sprobuj ponownie pozniej.</p>', {
          headers: { 'Content-Type': 'text/html; charset=UTF-8' }
        });
      });

      return cached || fetchPromise;
    })
  );
});