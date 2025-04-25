import StoriesAPI from "../../data/api";
import CameraUtils from "../../utils/camera";
import MapUtils from "../../utils/map";

export default class AddStoryPage {
  async render() {
    return `
      <section class="container">
        <div class="skip-link">
          <a href="#content" class="skip-to-content">Skip to content</a>
        </div>
        <h1 id="content" tabindex="0">Add New Story</h1>
        
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

        if (locationMarker) {
          locationMarker.remove();
        }

        locationMarker = MapUtils.addMarker({
          map,
          lng,
          lat,
          popupText: "Selected location",
        });
      },
    });

    resetLocationButton.addEventListener("click", () => {
      if (locationMarker) {
        locationMarker.remove();
      }

      selectedLat = undefined;
      selectedLng = undefined;
      selectedLocationElement.textContent = "Not selected";
    });

    // form submit
    const form = document.getElementById("add-story-form");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const description = document.getElementById("description").value;
      const photo = CameraUtils.getPhotoData();

      if (!description) {
        alert("Please enter a description for your story");
        return;
      }

      if (!photo) {
        alert("Please capture a photo for your story");
        return;
      }

      try {
        const submitButton = document.getElementById("submit-button");
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";

        let response;

        if (StoriesAPI.checkAuth()) {
          response = await StoriesAPI.addStory({
            description,
            photo,
            lat: selectedLat,
            lon: selectedLng,
          });
        } else {
          response = await StoriesAPI.addGuestStory({
            description,
            photo,
            lat: selectedLat,
            lon: selectedLng,
          });
        }

        if (response.error) {
          alert(`Failed to add story: ${response.message}`);
        } else {
          alert("Story added successfully!");
          // berhentikan kamera
          CameraUtils.clean();
          // kembali ke beranda
          window.location.hash = "#/";
        }
      } catch (error) {
        console.error("Error adding story:", error);
        alert("Failed to add story. Please try again.");
      } finally {
        const submitButton = document.getElementById("submit-button");
        submitButton.disabled = false;
        submitButton.textContent = "Submit Story";
      }
    });
  }
}
