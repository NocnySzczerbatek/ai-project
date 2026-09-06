/* Service Worker — Cobblemon Mastery Guide
   Cache'uje statyczne zasoby dla szybszego ladowania */

const CACHE_NAME = 'cobblemon-v29.7';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/arena.html',
  '/catch-zone.html',
  '/manifest.json',
  '/css/variables.css?v=22',
  '/css/base.css?v=23',
  '/css/layout.css?v=26',
  '/css/components.css?v=22',
  '/css/pokemon.css?v=22',
  '/css/competitive.css?v=22',
  '/css/pages.css?v=26',
  '/css/evolution.css?v=22',
  '/css/glassmorphism.css?v=22',
  '/css/responsive.css?v=25',
  '/css/arena.css?v=1',
  '/css/catchzone.css?v=6',
  '/assets/styles.css?v=22',
  '/js/config.js?v=22',
  '/js/i18n.js?v=22',
  '/js/types.js?v=22',
  '/js/utils.js?v=22',
  '/js/data.js?v=22',
  '/js/state.js?v=22',
  '/js/favorites.js?v=22',
  '/js/team.js?v=23',
  '/js/evolution.js?v=22',
  '/js/weakness.js?v=22',
  '/js/battle.js?v=22',
  '/js/detail.js?v=22',
  '/js/calculator.js?v=22',
  '/js/pages.js?v=27',
  '/js/app.js?v=25',
  '/js/arena.js?v=3',
  '/js/catchzone.js?v=7'
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

  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    event.respondWith(fetch(event.request).catch(function() {
      return caches.match(event.request) || new Response('<h1>Offline</h1><p>Brak polaczenia z internetem. Sprobuj ponownie pozniej.</p>', {
        headers: { 'Content-Type': 'text/html; charset=UTF-8' }
      });
    }));
    return;
  }

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

  /* Zasoby statyczne — network-first, by uniknac starego cache */
  event.respondWith(
    fetch(event.request).then(function(response) {
      var clone = response.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(event.request, clone);
      });
      return response;
    }).catch(function() {
      return caches.match(event.request) || new Response('<h1>Offline</h1><p>Brak polaczenia z internetem. Sprobuj ponownie pozniej.</p>', {
        headers: { 'Content-Type': 'text/html; charset=UTF-8' }
      });
    })
  );
});