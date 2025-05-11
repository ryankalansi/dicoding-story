import { openDB } from "idb";

const DB_NAME = "dicoding-stories-db";
const DB_VERSION = 1;
const STORE_NAME = "stories";

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: "id" });
    }
  },
});

const IDBHelper = {
  async getAllStories() {
    return (await dbPromise).getAll(STORE_NAME);
  },
  async saveStory(story) {
    return (await dbPromise).put(STORE_NAME, story);
  },
  async deleteStory(id) {
    return (await dbPromise).delete(STORE_NAME, id);
  },

  async getStory(id) {
    return (await dbPromise).get(STORE_NAME, id);
  },
};

export default IDBHelper;
