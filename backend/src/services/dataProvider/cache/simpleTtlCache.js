/**
 * simpleTtlCache.js
 * Lightweight, zero-dependency in-memory TTL cache with statistics tracking.
 * Used to avoid redundant external network requests to Agmarknet and Open-Meteo.
 */

class SimpleTtlCache {
  constructor(defaultTtlSeconds = 900) { // 15 minutes default
    this.defaultTtlSeconds = defaultTtlSeconds;
    this.cache = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Generate standard cache key from prefix and object params.
   */
  static makeKey(prefix, params = {}) {
    const sortedQuery = Object.keys(params)
      .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== '')
      .sort()
      .map((k) => `${k}=${String(params[k]).trim().toLowerCase()}`)
      .join('&');
    return `${prefix}:${sortedQuery}`;
  }

  /**
   * Get value from cache if present and not expired.
   * @param {string} key
   * @returns {any|null}
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.value;
  }

  /**
   * Set value in cache with optional TTL.
   * @param {string} key
   * @param {any} value
   * @param {number} [ttlSeconds]
   */
  set(key, value, ttlSeconds = this.defaultTtlSeconds) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, {
      value,
      expiresAt,
      storedAt: new Date().toISOString(),
    });
  }

  /**
   * Check if valid unexpired entry exists.
   */
  has(key) {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  getStats() {
    const now = Date.now();
    for (const [k, v] of this.cache.entries()) {
      if (now > v.expiresAt) {
        this.cache.delete(k);
      }
    }

    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? Number(((this.hits / totalRequests) * 100).toFixed(1)) : 0;

    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRatePercent: hitRate,
      defaultTtlSeconds: this.defaultTtlSeconds,
    };
  }
}

module.exports = SimpleTtlCache;
