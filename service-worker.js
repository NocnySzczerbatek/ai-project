/* Service Worker — Cobblemon Mastery Guide
   Cache'uje statyczne zasoby dla szybszego ladowania */

const CACHE_NAME = 'cobblemon-v14.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/arena.html',
  '/manifest.json',
  '/css/variables.css?v=13',
  '/css/base.css?v=13',
  '/css/layout.css?v=13',
  '/css/components.css?v=13',
  '/css/pokemon.css?v=13',
  '/css/competitive.css?v=13',
  '/css/pages.css?v=13',
  '/css/evolution.css?v=13',
  '/css/glassmorphism.css?v=13',
  '/css/responsive.css?v=13',
  '/css/arena.css',
  '/assets/styles.css?v=13',
  '/js/config.js?v=13',
  '/js/i18n.js?v=13',
  '/js/types.js?v=13',
  '/js/utils.js?v=13',
  '/js/data.js?v=13',
  '/js/state.js?v=13',
  '/js/favorites.js?v=13',
  '/js/team.js?v=13',
  '/js/evolution.js?v=13',
  '/js/weakness.js?v=13',
  '/js/battle.js?v=13',
  '/js/detail.js?v=13',
  '/js/calculator.js?v=13',
  '/js/pages.js?v=13',
  '/js/app.js?v=13',
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