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

// Tambahan: Handle message dari main thread untuk notifikasi lokal
self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const { title, body, icon } = event.data;

    const options = {
      body: body,
      icon: icon || "/favicon-192.png",
      vibrate: [100, 50, 100],
      tag: "story-created", // Untuk mencegah duplikasi
      requireInteraction: false,
    };

    event.waitUntil(self.registration.showNotification(title, options));
  }
});
