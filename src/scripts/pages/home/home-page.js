import StoriesAPI from "../../data/api";
import { showFormattedDate } from "../../utils/index";
import MapUtils from "../../utils/map";

export default class HomePage {
  async render() {
    return `
      <section class="container">
        <div class="skip-link">
          <a href="#content" class="skip-to-content">Skip to content</a>
        </div>
        <h1 id="content" tabindex="0">Dicoding Story</h1>
        <div id="stories-container" class="stories-container">
          <div class="loading">Loading stories...</div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const storiesContainer = document.getElementById("stories-container");

    try {
      const response = await StoriesAPI.getStories(1, 10, 1);

      if (response.error) {
        storiesContainer.innerHTML = `<div class="error-message">${response.message}</div>`;
        return;
      }

      if (!response.listStory || response.listStory.length === 0) {
        storiesContainer.innerHTML =
          '<div class="empty-message">No stories available</div>';
        return;
      }

      this._renderStories(response.listStory);
    } catch (error) {
      console.error("Error fetching stories:", error);
      storiesContainer.innerHTML =
        '<div class="error-message">Failed to load stories</div>';
    }
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

    // inisialisasi map untuk cerita dengan lokasi
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
