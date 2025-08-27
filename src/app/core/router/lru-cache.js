export class LRUCache {
  constructor(limit = 50) {
    this.cache = new Map();
    this.limit = limit;
  }

  get(key) {
    const item = this.cache.get(key);
    if (item) {
      this.cache.delete(key);
      this.cache.set(key, item);
    }
    return item;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.limit) {
      // supprime l’élément le plus ancien
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  keys() {
    return this.cache.keys();
  }

  values() {
    return this.cache.values(); // ✅ corrige ton problème
  }

  entries() {
    return this.cache.entries();
  }
}
