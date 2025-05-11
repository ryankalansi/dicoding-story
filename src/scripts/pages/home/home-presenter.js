import StoriesAPI from "../../data/api";
import DataStore from "../../db/data-store";

class HomePresenter {
  constructor({ view }) {
    // Menerima view
    this.view = view;
    this.storiesAPI = StoriesAPI;
  }

  async loadStories() {
    try {
      const response = await this.storiesAPI.getStories(1, 10, 1);
      const stories = response.listStory;

      this.view.showStories(stories);

      // Simpan ke indexedDB
      await DataStore.cacheStories(stories);
    } catch (error) {
      console.error("Online fetch failed, loading from IndexedDB...", error);
      const offlineStories = await DataStore.getofflineStories();
      this.view.showStories(offlineStories);
    }
  }
}

export default HomePresenter;
