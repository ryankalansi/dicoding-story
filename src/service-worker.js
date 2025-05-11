import { icon } from "leaflet";

self.addEventListener("push", function (event) {
  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.message || "Push message received",
    icon: "/favicon.png",
    vibrate: [100, 50, 100],
  };

  event.waitUntil(
    self.ServiceWorkerRegistration.showNotification("Dicoding Stories", options)
  );
});
