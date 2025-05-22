// src/scripts/db/idb.js
import { openDB } from "idb";

const DB_NAME = "dicoding-stories-db";
const DB_VERSION = 6; // Increment version untuk update schema
const STORE_NAME = "stories";
const FAVORITES_STORE_NAME = "favorite-stories"; // Store baru untuk saved stories

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db, oldVersion) {
    // Store untuk cache stories (offline fallback)
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: "id" });
    }

    // Store baru untuk saved/favorite stories
    if (!db.objectStoreNames.contains(FAVORITES_STORE_NAME)) {
      const favStore = db.createObjectStore(FAVORITES_STORE_NAME, {
        keyPath: "id",
      });
      // Tambah index untuk pencarian berdasarkan tanggal disimpan
      favStore.createIndex("savedAt", "savedAt", { unique: false });
    }
  },
});

const IDBHelper = {
  // ===== METHODS UNTUK CACHE STORIES (offline fallback) =====
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

  // ===== METHODS UNTUK SAVED/FAVORITE STORIES =====

  // Simpan story ke favorites dengan timestamp
  async saveFavoriteStory(story) {
    const favoriteStory = {
      ...story,
      savedAt: new Date().toISOString(), // Tambah timestamp kapan disimpan
    };
    return (await dbPromise).put(FAVORITES_STORE_NAME, favoriteStory);
  },

  // Ambil semua favorite stories, urutkan berdasarkan yang terbaru disimpan
  async getAllFavoriteStories() {
    const db = await dbPromise;
    const tx = db.transaction(FAVORITES_STORE_NAME, "readonly");
    const store = tx.objectStore(FAVORITES_STORE_NAME);
    const index = store.index("savedAt");

    // Ambil semua dan urutkan dari yang terbaru
    const stories = await index.getAll();
    return stories.reverse(); // Reverse untuk yang terbaru di atas
  },

  // Hapus story dari favorites
  async deleteFavoriteStory(id) {
    return (await dbPromise).delete(FAVORITES_STORE_NAME, id);
  },

  // Ambil satu favorite story
  async getFavoriteStory(id) {
    return (await dbPromise).get(FAVORITES_STORE_NAME, id);
  },

  // Hitung jumlah saved stories
  async getFavoriteStoriesCount() {
    return (await dbPromise).count(FAVORITES_STORE_NAME);
  },
};

export default IDBHelper;
