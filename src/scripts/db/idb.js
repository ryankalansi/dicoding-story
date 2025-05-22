import { openDB } from "idb";

const DB_NAME = "dicoding-stories-db";
const DB_VERSION = 5; // Update version untuk schema baru
const STORE_NAME = "stories";
const IMAGE_STORE_NAME = "story-images";

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db, oldVersion, newVersion, transaction) {
    console.log(
      `Upgrading database from version ${oldVersion} to ${newVersion}`
    );

    // Create stories store if it doesn't exist
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      console.log("Creating stories object store");
      db.createObjectStore(STORE_NAME, { keyPath: "id" });
    }

    // Create images store if it doesn't exist (new in version 4+)
    if (!db.objectStoreNames.contains(IMAGE_STORE_NAME)) {
      console.log("Creating story-images object store");
      db.createObjectStore(IMAGE_STORE_NAME, { keyPath: "storyId" });
    }

    // Force upgrade if needed
    if (oldVersion < 4) {
      console.log("Upgrading to version 4+ - ensuring image store exists");
      if (!db.objectStoreNames.contains(IMAGE_STORE_NAME)) {
        db.createObjectStore(IMAGE_STORE_NAME, { keyPath: "storyId" });
      }
    }
  },
});

const IDBHelper = {
  // Story methods
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

  // Image methods
  async saveImage(storyId, blob) {
    const imageData = {
      storyId: storyId,
      blob: blob,
      timestamp: Date.now(),
    };
    return (await dbPromise).put(IMAGE_STORE_NAME, imageData);
  },

  async getImage(storyId) {
    const imageData = await (await dbPromise).get(IMAGE_STORE_NAME, storyId);
    return imageData ? imageData.blob : null;
  },

  async deleteImage(storyId) {
    return (await dbPromise).delete(IMAGE_STORE_NAME, storyId);
  },

  async getAllImages() {
    return (await dbPromise).getAll(IMAGE_STORE_NAME);
  },
};

export default IDBHelper;
