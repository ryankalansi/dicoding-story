// Cache names
const CACHE_NAME = "dicoding-stories-v1";
const IMAGE_CACHE_NAME = "dicoding-stories-images-v1";

// Install event
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  self.skipWaiting();
});

// Activate event
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event with better image caching strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle story images from Dicoding API
  if (
    url.origin === "https://story-api.dicoding.dev" &&
    url.pathname.includes("/images/stories/")
  ) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            // Return cached image and update in background
            fetchAndCache(cache, request);
            return cachedResponse;
          }

          // If not cached, fetch and cache
          return fetchAndCache(cache, request);
        });
      })
    );
    return;
  }

  // Handle avatar images
  if (url.origin === "https://ui-avatars.com") {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetchAndCache(cache, request);
        });
      })
    );
    return;
  }

  // Handle API requests
  if (
    url.origin === "https://story-api.dicoding.dev" &&
    url.pathname.startsWith("/v1/")
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached response if network fails
          return caches.match(request);
        })
    );
    return;
  }
});

// Helper function to fetch and cache
async function fetchAndCache(cache, request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error("Fetch failed:", error);
    // Return a placeholder image for failed image requests
    if (request.destination === "image") {
      return new Response(
        '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#666">Image not available offline</text></svg>',
        { headers: { "Content-Type": "image/svg+xml" } }
      );
    }
    throw error;
  }
}

// Push notification handling
self.addEventListener("push", function (event) {
  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.message || "Push message received",
    icon: "/favicon-192.png",
    vibrate: [100, 50, 100],
  };

  event.waitUntil(
    self.registration.showNotification("Dicoding Stories", options)
  );
});

// Handle message from main thread for local notifications
self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const { title, body, icon } = event.data;

    const options = {
      body: body,
      icon: icon || "/favicon-192.png",
      vibrate: [100, 50, 100],
      tag: "story-created",
      requireInteraction: false,
    };

    event.waitUntil(self.registration.showNotification(title, options));
  }
});
