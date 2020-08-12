// TODO: https://developers.google.com/web/fundamentals/primers/service-workers
// cache static all assets in order to display the app offline. 
// cache transaction data, using cached data as a fallback when app is offline 
// one cache for static assets
// one cache for dynamic data from request to routes beginning with "/api"

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/styles.css",
    "/index.js",
    "/db.js",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"
  ];
  
  const CACHE_NAME = "static-cache-v1";
  const DATA_CACHE_NAME = "data-cache-v1";
  
  //install
  self.addEventListener("install", (evt) => {
    evt.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(FILES_TO_CACHE);
      })
    );
  
    self.skipWaiting();
  });
  
  //activate
  self.addEventListener("activate", function(evt) {
    evt.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
  
    self.clients.claim();
  });
  
  //fetch
  self.addEventListener("fetch", (evt) => {
    // cache successful GET requests to the API
    if (evt.request.url.includes("/api/") && evt.request.method === "GET") {
      evt.respondWith(
        caches
          .open(DATA_CACHE_NAME)
          .then((cache) => {
            return fetch(evt.request)
              .then((response) => {
                // If the response was good, clone it and store it in the cache.
                if (response.status === 200) {
                  cache.put(evt.request, response.clone());
                }
  
                return response;
              })
              .catch(() => {
                // Network request failed, try to get it from the cache.
                return cache.match(evt.request);
              });
          })
          .catch((err) => console.log(err))
      );
  
      // stop execution of the fetch event callback
      return;
    }
  
    // "offline-first" approach.
    evt.respondWith(
      caches.match(evt.request).then((response) => {
        return response || fetch(evt.request);
      })
    );
  });