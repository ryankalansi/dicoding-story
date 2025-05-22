import IDBHelper from "./idb";

const DataStore = {
  // Cache stories (tetap untuk fallback offline)
  async cacheStories(stories = []) {
    for (const story of stories) {
      await IDBHelper.saveStory(story);
    }
  },

  async getOfflineStories() {
    return await IDBHelper.getAllStories();
  },

  async deleteOfflineStory(id) {
    return await IDBHelper.deleteStory(id);
  },

  // ===== FITUR SAVED STORIES BARU =====

  // Simpan story ke saved stories
  async saveStoryToFavorites(story) {
    return await IDBHelper.saveFavoriteStory(story);
  },

  // Ambil semua saved stories
  async getSavedStories() {
    return await IDBHelper.getAllFavoriteStories();
  },

  // Hapus story dari saved stories
  async removeSavedStory(id) {
    return await IDBHelper.deleteFavoriteStory(id);
  },

  // Cek apakah story sudah disave
  async isStorySaved(id) {
    const story = await IDBHelper.getFavoriteStory(id);
    return !!story;
  },

  // Toggle save/unsave story
  async toggleSaveStory(story) {
    const isSaved = await this.isStorySaved(story.id);

    if (isSaved) {
      await this.removeSavedStory(story.id);
      return false; // unsaved
    } else {
      await this.saveStoryToFavorites(story);
      return true; // saved
    }
  },
};

export default DataStore;
