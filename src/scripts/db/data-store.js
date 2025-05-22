import IDBHelper from "./idb";

const DataStore = {
  async cacheStories(stories = []) {
    for (const story of stories) {
      await IDBHelper.saveStory(story);

      // Cache gambar story ke IndexedDB jika online
      if (story.photoUrl && navigator.onLine) {
        await this.cacheImage(story.photoUrl, story.id);
      }
    }
  },

  async getofflineStories() {
    const stories = await IDBHelper.getAllStories();

    // Ambil gambar dari cache untuk setiap story jika offline
    if (!navigator.onLine) {
      for (const story of stories) {
        const cachedImage = await this.getCachedImage(story.id);
        if (cachedImage) {
          story.photoUrl = cachedImage;
        }
      }
    }

    return stories;
  },

  async deleteOfflineStory(id) {
    // Hapus story dan gambar terkait
    await this.deleteCachedImage(id);
    return await IDBHelper.deleteStory(id);
  },

  async cacheImage(imageUrl, storyId) {
    try {
      const response = await fetch(imageUrl);
      if (response.ok) {
        const blob = await response.blob();
        await IDBHelper.saveImage(storyId, blob);
      }
    } catch (error) {
      console.error("Failed to cache image:", error);
    }
  },

  async getCachedImage(storyId) {
    try {
      const blob = await IDBHelper.getImage(storyId);
      if (blob) {
        return URL.createObjectURL(blob);
      }
    } catch (error) {
      console.error("Failed to get cached image:", error);
    }
    return null;
  },

  async deleteCachedImage(storyId) {
    try {
      await IDBHelper.deleteImage(storyId);
    } catch (error) {
      console.error("Failed to delete cached image:", error);
    }
  },
};

export default DataStore;
