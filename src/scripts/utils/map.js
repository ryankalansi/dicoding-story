import L from "leaflet";

const MapUtils = {
  initMap({ container, center = [0, 0], zoom = 2, onClickCallback = null }) {
    const map = L.map(container).setView([center[1], center[0]], zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    }).addTo(map);

    if (onClickCallback) {
      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        onClickCallback(lng, lat);
      });
    }

    return map;
  },

  addMarker({ map, lng, lat, popupText }) {
    const marker = L.marker([lat, lng]);

    if (popupText) {
      marker.bindPopup(popupText);
    }

    marker.addTo(map);
    return marker;
  },
};

export default MapUtils;
