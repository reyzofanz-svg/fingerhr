const CACHE_NAME = "fingerhr-v1";
const STATIC_CACHE = "fingerhr-static-v1";
const DYNAMIC_CACHE = "fingerhr-dynamic-v1";

const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/login",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        console.log("Failed to cache some static assets");
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip API calls and auth routes
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          // Clone the response
          const responseToCache = networkResponse.clone();

          // Cache successful responses
          if (networkResponse.ok) {
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }

          return networkResponse;
        })
        .catch(() => {
          // Network failed, return cached version if available
          return cachedResponse;
        });

      // Return cached version immediately if available, otherwise wait for network
      return cachedResponse || fetchPromise;
    })
  );
});

// Handle messages
self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }
});
