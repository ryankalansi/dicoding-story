import HomePresenter from "./home-presenter";
import { showFormattedDate } from "../../utils/index";
import MapUtils from "../../utils/map";

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
        <div class="connection-status" id="connection-status"></div>
        <div id="stories-container" class="stories-container">
          <div class="loading">Loading stories...</div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.storiesContainer = document.getElementById("stories-container");
    this.connectionStatus = document.getElementById("connection-status");
    this._updateConnectionStatus();
    this.presenter.loadStories(); // Load data via the Presenter

    // Listen for online/offline events
    window.addEventListener("online", () => {
      this._updateConnectionStatus();
      this.presenter.loadStories(); // Reload when back online
    });

    window.addEventListener("offline", () => {
      this._updateConnectionStatus();
    });
  }

  _updateConnectionStatus() {
    if (!navigator.onLine) {
      this.connectionStatus.innerHTML = `
        <div class="offline-indicator">
          📡 You're offline - showing cached stories
        </div>
      `;
      this.connectionStatus.style.display = "block";
    } else {
      this.connectionStatus.style.display = "none";
    }
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

  _renderStories(stories) {
    const storiesContainer = document.getElementById("stories-container");

    const storiesHTML = stories
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
        </div>
        <div class="story-image-container">
          <img src="${story.photoUrl}" 
               alt="Story image from ${story.name}" 
               class="story-image"
               onerror="this.src='/api/placeholder/400/300'; this.alt='Image not available offline';">
        </div>
        <p class="story-description">${story.description}</p>
        ${this._renderMapIfLocationExists(story)}
        <a href="#/detail/${story.id}" class="read-more">Read more</a>
      </article>
    `
      )
      .join("");

    storiesContainer.innerHTML = storiesHTML;

    // Initialize maps for stories with location
    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const mapContainer = document.getElementById(`map-${story.id}`);
        if (mapContainer) {
          try {
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
          } catch (error) {
            console.error("Failed to initialize map:", error);
            // Hide map container if failed
            mapContainer.style.display = "none";
          }
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
