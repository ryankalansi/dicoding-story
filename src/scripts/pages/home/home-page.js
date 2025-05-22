import HomePresenter from "./home-presenter";
import { showFormattedDate } from "../../utils/index";
import MapUtils from "../../utils/map";
import DataStore from "../../db/data-store";

export default class HomePage {
  constructor() {
    this.presenter = new HomePresenter({ view: this });
  }

  async render() {
    return `
      <section class="container">
        <div class="skip-link">
          <a href="#main-content" class="skip-to-content">Skip to content</a>
        </div>
        <h1 id="main-content" tabindex="0">Dicoding Story</h1>
        <div id="stories-container" class="stories-container">
          <div class="loading">Loading stories...</div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.storiesContainer = document.getElementById("stories-container");
    this.presenter.loadStories();
    this._setupEventListeners();
  }

  _setupEventListeners() {
    // Event delegation untuk tombol save
    this.storiesContainer.addEventListener("click", async (event) => {
      if (event.target.classList.contains("save-story-btn")) {
        event.preventDefault();
        await this._handleSaveStory(event);
      }
    });
  }

  async _handleSaveStory(event) {
    const button = event.target;
    const storyId = button.dataset.storyId;
    const storyData = JSON.parse(button.dataset.story);

    try {
      button.disabled = true;
      button.textContent = "...";

      const isSaved = await DataStore.toggleSaveStory(storyData);

      if (isSaved) {
        button.innerHTML = "❤️ Saved";
        button.classList.add("saved");
        this._showNotification("Story berhasil disimpan!");
      } else {
        button.innerHTML = "🤍 Save";
        button.classList.remove("saved");
        this._showNotification("Story dihapus dari simpanan");
      }
    } catch (error) {
      console.error("Error saving story:", error);
      this._showNotification("Gagal menyimpan story", "error");
    } finally {
      button.disabled = false;
    }
  }

  _showNotification(message, type = "success") {
    // Buat notifikasi sederhana
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === "error" ? "#f44336" : "#4caf50"};
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  showStories(stories) {
    if (!stories || stories.length === 0) {
      this._renderEmpty();
      return;
    }
    this._renderStories(stories);
  }

  showError(message) {
    this._renderError(message);
  }

  _renderError(message) {
    this.storiesContainer.innerHTML = `<div class="error-message">${message}</div>`;
  }

  _renderEmpty() {
    this.storiesContainer.innerHTML = `<div class="empty-message">No stories available</div>`;
  }

  async _renderStories(stories) {
    const storiesContainer = document.getElementById("stories-container");

    // Cek status saved untuk setiap story
    const storiesWithSaveStatus = await Promise.all(
      stories.map(async (story) => ({
        ...story,
        isSaved: await DataStore.isStorySaved(story.id),
      }))
    );

    const storiesHTML = storiesWithSaveStatus
      .map(
        (story) => `
        <article class="story-item">
          <div class="story-header">
            <img class="profile-pic" src="https://ui-avatars.com/api/?name=${
              story.name
            }&background=random" alt="Profile picture of ${story.name}">
            <div class="story-meta">
              <h2><a href="#/detail/${story.id}" class="story-title">${
          story.name
        }</a></h2>
              <p class="story-date">${showFormattedDate(story.createdAt)}</p>
            </div>
            <button 
              class="save-story-btn ${story.isSaved ? "saved" : ""}" 
              data-story-id="${story.id}"
              data-story='${JSON.stringify(story)}'
              aria-label="${story.isSaved ? "Unsave" : "Save"} story from ${
          story.name
        }"
            >
              ${story.isSaved ? "❤️ Saved" : "🤍 Save"}
            </button>
          </div>
          <img src="${story.photoUrl}" alt="Story image from ${
          story.name
        }" class="story-image">
          <p class="story-description">${story.description}</p>
          ${this._renderMapIfLocationExists(story)}
          <a href="#/detail/${story.id}" class="read-more">Read more</a>
        </article>
      `
      )
      .join("");

    storiesContainer.innerHTML = storiesHTML;

    // Initialize maps
    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const mapContainer = document.getElementById(`map-${story.id}`);
        if (mapContainer) {
          const map = MapUtils.initMap({
            container: mapContainer,
            center: [story.lon, story.lat],
            zoom: 10,
          });

          MapUtils.addMarker({
            map,
            lng: story.lon,
            lat: story.lat,
            popupText: `<strong>${
              story.name
            }</strong><p>${story.description.substring(0, 100)}...</p>`,
          });
        }
      }
    });
  }

  _renderMapIfLocationExists(story) {
    if (story.lat && story.lon) {
      return `<div id="map-${story.id}" class="story-map" aria-label="Location map for ${story.name}'s story"></div>`;
    }
    return "";
  }
}
