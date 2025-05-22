// src/scripts/pages/saved/saved-stories-page.js
import SavedStoriesPresenter from "./saved-stories-presenter";
import { showFormattedDate } from "../../utils/index";
import MapUtils from "../../utils/map";
import DataStore from "../../db/data-store";

export default class SavedStoriesPage {
  constructor() {
    this.presenter = new SavedStoriesPresenter({ view: this });
  }

  async render() {
    return `
      <section class="container">
        <div class="skip-link">
          <a href="#main-content" class="skip-to-content">Skip to content</a>
        </div>
        <h1 id="main-content" tabindex="0">Saved Stories</h1>
        <p class="page-description">Stories yang telah Anda simpan untuk dibaca nanti</p>
        <div id="saved-stories-container" class="stories-container">
          <div class="loading">Loading saved stories...</div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.savedStoriesContainer = document.getElementById(
      "saved-stories-container"
    );
    this.presenter.loadSavedStories();
    this._setupEventListeners();
  }

  _setupEventListeners() {
    // Event delegation untuk tombol remove
    this.savedStoriesContainer.addEventListener("click", async (event) => {
      if (event.target.classList.contains("remove-saved-btn")) {
        event.preventDefault();
        await this._handleRemoveSavedStory(event);
      }
    });
  }

  async _handleRemoveSavedStory(event) {
    const button = event.target;
    const storyId = button.dataset.storyId;
    const storyItem = button.closest(".story-item");

    try {
      button.disabled = true;
      button.textContent = "...";

      await DataStore.removeSavedStory(storyId);

      // Animasi hapus
      storyItem.style.transition = "opacity 0.3s ease-out";
      storyItem.style.opacity = "0";

      setTimeout(() => {
        storyItem.remove();
        this._checkIfEmpty();
      }, 300);

      this._showNotification("Story dihapus dari simpanan");
    } catch (error) {
      console.error("Error removing saved story:", error);
      this._showNotification("Gagal menghapus story", "error");
      button.disabled = false;
      button.innerHTML = "🗑️ Remove";
    }
  }

  _checkIfEmpty() {
    const remainingStories =
      this.savedStoriesContainer.querySelectorAll(".story-item");
    if (remainingStories.length === 0) {
      this._renderEmpty();
    }
  }

  _showNotification(message, type = "success") {
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

  showSavedStories(stories) {
    if (!stories || stories.length === 0) {
      this._renderEmpty();
      return;
    }
    this._renderSavedStories(stories);
  }

  showError(message) {
    this._renderError(message);
  }

  _renderError(message) {
    this.savedStoriesContainer.innerHTML = `
      <div class="error-message">
        <h3>Oops! Something went wrong</h3>
        <p>${message}</p>
      </div>
    `;
  }

  _renderEmpty() {
    this.savedStoriesContainer.innerHTML = `
      <div class="empty-message">
        <h3>📖 Belum ada story yang disimpan</h3>
        <p>Simpan story favorit Anda dari halaman beranda untuk membacanya nanti.</p>
        <a href="#/" class="btn-primary">Jelajahi Stories</a>
      </div>
    `;
  }

  _renderSavedStories(stories) {
    const storiesHTML = stories
      .map(
        (story) => `
        <article class="story-item saved-story-item">
          <div class="story-header">
            <img class="profile-pic" src="https://ui-avatars.com/api/?name=${
              story.name
            }&background=random" alt="Profile picture of ${story.name}">
            <div class="story-meta">
              <h2><a href="#/detail/${story.id}" class="story-title">${
          story.name
        }</a></h2>
              <p class="story-date">Posted: ${showFormattedDate(
                story.createdAt
              )}</p>
              <p class="saved-date">Saved: ${showFormattedDate(
                story.savedAt
              )}</p>
            </div>
            <button 
              class="remove-saved-btn" 
              data-story-id="${story.id}"
              aria-label="Remove story from saved"
              title="Remove from saved stories"
            >
              🗑️ Remove
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

    this.savedStoriesContainer.innerHTML = storiesHTML;

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
