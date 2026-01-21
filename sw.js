// sw.js — Service Worker base (Apps vidrio + fondo)
// Reutilizable para todas las apps del proyecto

const CACHE_VERSION = "v1"; 
const CACHE_NAME = `lioapp-cache-${CACHE_VERSION}`;

const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./fondo.jpg",
  "./icon-192.png",
  "./icon-512.png"
];

// Instala y cachea archivos base
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activa y limpia cachés viejos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Estrategia offline-first
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      return (
        cached ||
        fetch(event.request)
          .then(response => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache =>
              cache.put(event.request, copy)
            );
            return response;
          })
          .catch(() => caches.match("./index.html"))
      );
    })
  );
});
