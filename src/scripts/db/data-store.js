import IDBHelper from "./idb";

const DataStore = {
  async cacheStories(stories = []) {
    for (const story of stories) {
      await IDBHelper.saveStory(story);
    }
  },

  async getofflineStories() {
    return await IDBHelper.getAllStories();
  },

  async deleteOfflineStory(id) {
    return await IDBHelper.deleteStory(id);
  },
};

export default DataStore;
