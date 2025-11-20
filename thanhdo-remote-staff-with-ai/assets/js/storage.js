// assets/js/storage.js

const Storage = {
  get(key) {
    return window.localStorage.getItem(key);
  },

  set(key, value) {
    window.localStorage.setItem(key, value);
  },

  remove(key) {
    window.localStorage.removeItem(key);
  },

  loadJSON(key, def) {
    const raw = this.get(key);
    if (!raw) return def;
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Storage.loadJSON parse error:', key, e);
      return def;
    }
  },

  saveJSON(key, value) {
    try {
      this.set(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage.saveJSON error:', key, e);
    }
  }
};
