interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class MemoryCache {
  private store: Map<string, CacheEntry<unknown>> = new Map();

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) {
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

// Global cache instance shared across server routes in runtime
const globalForCache = globalThis as unknown as { appCache?: MemoryCache };

export const cache = globalForCache.appCache ?? new MemoryCache();

if (process.env.NODE_ENV !== 'production') {
  globalForCache.appCache = cache;
}
