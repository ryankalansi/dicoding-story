// Import workbox dari CDN
importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js"
);

// Gunakan workbox untuk routing
const { registerRoute } = workbox.routing;
const { CacheFirst, NetworkFirst, StaleWhileRevalidate } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;
const { precacheAndRoute } = workbox.precaching;

// Konfigurasi caching untuk gambar
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "image-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
      }),
    ],
  })
);

// Konfigurasi caching khusus untuk gambar story dari API
registerRoute(
  /^https:\/\/story-api\.dicoding\.dev\/images\/stories\//,
  new StaleWhileRevalidate({
    cacheName: "story-images",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 hari
      }),
    ],
  })
);

// Konfigurasi caching untuk API
registerRoute(
  /^https:\/\/story-api\.dicoding\.dev\/v1\//,
  new NetworkFirst({
    cacheName: "api-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60, // 1 jam
      }),
    ],
    networkTimeoutSeconds: 10,
  })
);

// Avatar images
registerRoute(
  /^https:\/\/ui-avatars\.com\/api/,
  new StaleWhileRevalidate({
    cacheName: "avatar-images",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 hari
      }),
    ],
  })
);

// Handler untuk push notification
self.addEventListener("push", function (event) {
  let notificationData = {
    title: "New Notification",
    options: {
      body: "This is a notification from Dicoding Stories",
      icon: "/favicon-192.png",
      badge: "/favicon-192.png",
      vibrate: [100, 50, 100],
    },
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || "New Notification",
        options: {
          body:
            data.options?.body ||
            "This is a notification from Dicoding Stories",
          icon: "/favicon-192.png",
          badge: "/favicon-192.png",
          vibrate: [100, 50, 100],
        },
      };
    } catch (error) {
      console.error("Error parsing push data:", error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title,
      notificationData.options
    )
  );
});

// Handler untuk klik notifikasi
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  event.waitUntil(clients.openWindow("/"));
});

// Precache aset statis
precacheAndRoute(self.__WB_MANIFEST || []);
