const CACHE_NAME = "gur-crm-cache-v1";
const ASSETS_TO_CACHE = [
  "./",
  "index.html",
  "style.css",
  "script.js",
  "manifest.json"
];

// 1. Install Event: Cache all critical static resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching critical app assets...");
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Clean up outdated caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Service Worker: Clearing legacy cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Network-First strategy falling back to Cache
// This ensures they get the latest code updates immediately if online,
// but loads from cache instantly when offline.
self.addEventListener("fetch", (event) => {
  // Only handle standard GET requests
  if (event.request.method !== "GET") return;

  // Skip API calls to external servers (e.g. Gemini AI endpoint) from caching
  if (event.request.url.includes("generativelanguage.googleapis.com")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If network fetch succeeds, cache a clone of the response
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If network is offline or fails, serve from cache
        console.log("Service Worker: Serving asset from cache due to offline state...");
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If resource is not in cache, return simple offline fallback if necessary
          if (event.request.headers.get("accept").includes("text/html")) {
            return caches.match("index.html");
          }
        });
      })
  );
});
