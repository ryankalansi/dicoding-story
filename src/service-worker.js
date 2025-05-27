self.addEventListener("push", function (event) {
  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.message || "Push message received",
    icon: "/favicon-192.png",
    badge: "/favicon-192.png",
    vibrate: [100, 50, 100],
    tag: "dicoding-stories",
    requireInteraction: false,
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(
    self.registration.showNotification("Dicoding Stories", options)
  );
});

// Handle notification click
self.addEventListener("notificationclick", function (event) {
  console.log("Notification clicked:", event);

  event.notification.close();

  // Navigate to the app when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: "window" }).then(function (clientList) {
      // If app is already open, focus it
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url === event.notification.data.url && "focus" in client) {
          return client.focus();
        }
      }

      // If app is not open, open it
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url || "/");
      }
    })
  );
});

// Tambahan: Handle message dari main thread untuk notifikasi lokal
self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const { title, body, icon } = event.data;

    const options = {
      body: body,
      icon: icon || "/favicon-192.png",
      badge: "/favicon-192.png",
      vibrate: [100, 50, 100],
      tag: "story-created",
      requireInteraction: false,
    };

    event.waitUntil(self.registration.showNotification(title, options));
  }
});
