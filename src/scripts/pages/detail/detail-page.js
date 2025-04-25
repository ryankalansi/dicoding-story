import StoriesAPI from "../../data/api";
import { showFormattedDate } from "../../utils/index";
import { parseActivePathname } from "../../routes/url-parser";
import MapUtils from "../../utils/map";

export default class DetailPage {
  async render() {
    return `
      <section class="container">
        <div class="skip-link">
          <a href="#content" class="skip-to-content">Skip to content</a>
        </div>
        <div id="story-detail" class="story-detail">
          <div class="loading">Loading story...</div>
        </div>
        <div class="story-actions">
          <a href="#/" class="back-button">Back to Stories</a>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const storyDetail = document.getElementById("story-detail");
    const { id } = parseActivePathname();

    if (!id) {
      storyDetail.innerHTML =
        '<div class="error-message">Story ID not found</div>';
      return;
    }

    try {
      const response = await StoriesAPI.getStoryDetail(id);

      if (response.error) {
        storyDetail.innerHTML = `<div class="error-message">${response.message}</div>`;
        return;
      }

      this._renderStoryDetail(response.story);
    } catch (error) {
      console.error("Error fetching story detail:", error);
      storyDetail.innerHTML =
        '<div class="error-message">Failed to load story detail</div>';
    }
  }

  _renderStoryDetail(story) {
    const storyDetail = document.getElementById("story-detail");

    const storyHTML = `
      <article>
        <h1 id="content" tabindex="0" class="story-title">${
          story.name
        }'s Story</h1>
        <p class="story-date">${showFormattedDate(story.createdAt)}</p>
        <img src="${story.photoUrl}" alt="Story image from ${
      story.name
    }" class="story-image detail-image">
        <p class="story-description detail-description">${story.description}</p>
        ${this._renderMapIfLocationExists(story)}
      </article>
    `;

    storyDetail.innerHTML = storyHTML;

    // inisialisasi map
    if (story.lat && story.lon) {
      const mapContainer = document.getElementById("detail-map");
      if (mapContainer) {
        const map = MapUtils.initMap({
          container: mapContainer,
          center: [story.lon, story.lat],
          zoom: 12,
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
  }

  _renderMapIfLocationExists(story) {
    if (story.lat && story.lon) {
      return `<div id="detail-map" class="story-map detail-map" aria-label="Location map for ${story.name}'s story"></div>`;
    }
    return "";
  }
}
