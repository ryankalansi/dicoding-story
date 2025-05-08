import CameraUtils from "../../utils/camera";
import MapUtils from "../../utils/map";
import AddStoryPresenter from "./add-story-presenter";

export default class AddStoryPage {
  async render() {
    return `
      <section class="container">
        <div class="skip-link">
          <a href="#content" class="skip-to-content">Skip to content</a>
        </div>
        <h1 id="content">Add New Story</h1>

        <form id="add-story-form" class="add-story-form">
          <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" name="description" required></textarea>
          </div>

          <div class="form-group">
            <label>Photo</label>
            <div class="camera-container">
              <video id="camera-preview" class="camera-preview" autoplay></video>
              <canvas id="photo-canvas" class="photo-canvas"></canvas>
              <div class="camera-controls">
                <button type="button" id="start-camera" class="camera-button">Start Camera</button>
                <button type="button" id="capture-photo" class="camera-button" style="display: none;">Capture Photo</button>
                <button type="button" id="reset-camera" class="camera-button" style="display: none;">Reset Camera</button>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Location (Click on map to set location)</label>
            <div id="location-map" class="location-map"></div>
            <div class="location-info">
              <p>Selected Location: <span id="selected-location">Not selected</span></p>
              <button type="button" id="reset-location" class="reset-button">Reset Location</button>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" id="submit-button" class="submit-button">Submit Story</button>
          </div>
        </form>
      </section>
    `;
  }

  async afterRender() {
    // inisialisasi kamera
    const cameraPreview = document.getElementById("camera-preview");
    const photoCanvas = document.getElementById("photo-canvas");
    const startCameraButton = document.getElementById("start-camera");
    const capturePhotoButton = document.getElementById("capture-photo");
    const resetCameraButton = document.getElementById("reset-camera");

    CameraUtils.init({
      videoElement: cameraPreview,
      canvas: photoCanvas,
      startButton: startCameraButton,
      captureButton: capturePhotoButton,
      resetButton: resetCameraButton,
    });

    // Inisialisasi map
    const mapContainer = document.getElementById("location-map");
    const selectedLocationElement =
      document.getElementById("selected-location");
    const resetLocationButton = document.getElementById("reset-location");

    let selectedLat;
    let selectedLng;
    let locationMarker;

    const map = MapUtils.initMap({
      container: mapContainer,
      center: [0, 0],
      zoom: 1,
      onClickCallback: (lng, lat) => {
        selectedLat = lat;
        selectedLng = lng;

        selectedLocationElement.textContent = `Lat: ${lat.toFixed(
          6
        )}, Lng: ${lng.toFixed(6)}`;

        if (locationMarker) locationMarker.remove();

        locationMarker = MapUtils.addMarker({
          map,
          lng,
          lat,
          popupText: "Selected location",
        });
      },
    });

    resetLocationButton.addEventListener("click", () => {
      if (locationMarker) locationMarker.remove();
      selectedLat = undefined;
      selectedLng = undefined;
      selectedLocationElement.textContent = "Not selected";
    });

    // form submit
    const form = document.getElementById("add-story-form");
    const submitButton = document.getElementById("submit-button");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const description = document.getElementById("description").value;
      const photo = CameraUtils.getPhotoData();

      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";

      AddStoryPresenter.handleFormSubmit({
        description,
        photo,
        lat: selectedLat,
        lon: selectedLng,
        onSuccess: () => {
          alert("Story added successfully!");
          CameraUtils.clean();
          window.location.hash = "#/";

          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: "auto" });
            const tryFocus = () => {
              const contentEl = document.getElementById("content");
              if (contentEl) {
                contentEl.setAttribute("tabindex", "-1");
                contentEl.focus();
              }
            };

            if (document.startViewTransition) {
              document.startViewTransition(tryFocus);
            } else {
              tryFocus();
            }
          }, 200);
        },
        onError: (message) => {
          alert(`Failed to add story: ${message}`);
        },
      }).finally(() => {
        submitButton.disabled = false;
        submitButton.textContent = "Submit Story";
      });
    });
  }
}
