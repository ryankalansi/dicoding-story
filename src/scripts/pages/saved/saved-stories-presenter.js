import DataStore from "../../db/data-store";

class SavedStoriesPresenter {
  constructor({ view }) {
    this.view = view;
  }

  async loadSavedStories() {
    try {
      const savedStories = await DataStore.getSavedStories();
      this.view.showSavedStories(savedStories);
    } catch (error) {
      console.error("Error loading saved stories:", error);
      this.view.showError(
        "Gagal memuat story yang disimpan. Silakan coba lagi."
      );
    }
  }

  async getStoriesCount() {
    try {
      return await DataStore.getSavedStories().then(
        (stories) => stories.length
      );
    } catch (error) {
      console.error("Error getting saved stories count:", error);
      return 0;
    }
  }
}

export default SavedStoriesPresenter;
