/**
 * Local Storage Adapter for OAuth State and Session Data
 * Performance optimized with in-memory caching and batch operations
 */

import type { ISessionStorage } from "../../domains/core/session/repositories/session-storage.interface";
import type { SessionData, OAuthState } from "../../domain/types";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class LocalStorageAdapter implements ISessionStorage {
  private statePrefix = "oauth_state_";
  private sessionPrefix = "session_";

  // In-memory cache to reduce localStorage access (improves performance)
  private stateCache: Map<string, CacheEntry<OAuthState>>;
  private sessionCache: Map<string, CacheEntry<SessionData>>;

  // Cache TTL in milliseconds (default: 5 minutes)
  private readonly CACHE_TTL = 5 * 60 * 1000;
  private readonly MAX_CACHE_SIZE = 50;

  constructor() {
    this.stateCache = new Map();
    this.sessionCache = new Map();

    // Initialize cache from localStorage if available
    if (typeof window !== "undefined") {
      this.initializeCache();
    }
  }

  /**
   * Initialize cache with existing data from localStorage
   */
  private initializeCache(): void {
    try {
      this.loadCacheFromStorage<OAuthState>(this.statePrefix, this.stateCache);
      this.loadCacheFromStorage<SessionData>(this.sessionPrefix, this.sessionCache);
    } catch (error) {
      console.warn("Failed to initialize cache from localStorage:", error);
    }
  }

  /**
   * Load cache from localStorage for a given prefix
   */
  private loadCacheFromStorage<T>(
    prefix: string,
    cache: Map<string, CacheEntry<T>>
  ): void {
    const keys = this.getStorageKeys(prefix);
    const now = Date.now();

    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (!value) continue;

      try {
        const data = JSON.parse(value) as T;
        const shortKey = key.replace(prefix, "");

        // Only cache if not expired
        cache.set(shortKey, {
          data,
          timestamp: now,
        });
      } catch {
        // Remove corrupted data
        localStorage.removeItem(key);
      }
    }
  }

  /**
   * Get all keys from localStorage with a prefix
   */
  private getStorageKeys(prefix: string): string[] {
    try {
      return Object.keys(localStorage).filter((key) => key.startsWith(prefix));
    } catch {
      return [];
    }
  }

  /**
   * Clean expired cache entries
   */
  private cleanCache<T>(cache: Map<string, CacheEntry<T>>): void {
    const now = Date.now();

    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > this.CACHE_TTL) {
        cache.delete(key);
      }
    }

    // Prevent cache from growing too large
    if (cache.size > this.MAX_CACHE_SIZE) {
      const entries = Array.from(cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);

      const toRemove = Math.ceil(this.MAX_CACHE_SIZE * 0.2);
      for (let i = 0; i < toRemove; i++) {
        cache.delete(entries[i][0]);
      }
    }
  }

  /**
   * Get cached entry if available and not expired
   */
  private getCached<T>(
    cache: Map<string, CacheEntry<T>>,
    key: string
  ): T | null {
    const entry = cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.CACHE_TTL) {
      cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cache entry
   */
  private setCached<T>(
    cache: Map<string, CacheEntry<T>>,
    key: string,
    data: T
  ): void {
    cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  async setOAuthState(key: string, state: OAuthState): Promise<void> {
    try {
      const fullKey = `${this.statePrefix}${key}`;
      const value = JSON.stringify(state);

      // Update localStorage
      localStorage.setItem(fullKey, value);

      // Update cache
      this.setCached(this.stateCache, key, state);
    } catch (error) {
      throw new Error(`Failed to set OAuth state: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async getOAuthState(key: string): Promise<OAuthState | null> {
    // Try cache first
    const cached = this.getCached(this.stateCache, key);
    if (cached) return cached;

    // Fallback to localStorage
    try {
      const value = localStorage.getItem(`${this.statePrefix}${key}`);
      if (!value) return null;

      const state = JSON.parse(value) as OAuthState;

      // Update cache
      this.setCached(this.stateCache, key, state);

      return state;
    } catch {
      return null;
    }
  }

  async removeOAuthState(key: string): Promise<void> {
    try {
      localStorage.removeItem(`${this.statePrefix}${key}`);
      this.stateCache.delete(key);
    } catch {
      // Ignore removal errors
    }
  }

  async setSession(key: string, data: SessionData): Promise<void> {
    try {
      const fullKey = `${this.sessionPrefix}${key}`;
      const value = JSON.stringify(data);

      // Update localStorage
      localStorage.setItem(fullKey, value);

      // Update cache
      this.setCached(this.sessionCache, key, data);
    } catch (error) {
      throw new Error(`Failed to set session: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async getSession(key: string): Promise<SessionData | null> {
    // Try cache first
    const cached = this.getCached(this.sessionCache, key);
    if (cached) return cached;

    // Fallback to localStorage
    try {
      const value = localStorage.getItem(`${this.sessionPrefix}${key}`);
      if (!value) return null;

      const session = JSON.parse(value) as SessionData;

      // Update cache
      this.setCached(this.sessionCache, key, session);

      return session;
    } catch {
      return null;
    }
  }

  async removeSession(key: string): Promise<void> {
    try {
      localStorage.removeItem(`${this.sessionPrefix}${key}`);
      this.sessionCache.delete(key);
    } catch {
      // Ignore removal errors
    }
  }

  async clearExpired(maxAge: number): Promise<void> {
    const now = Date.now();

    // Process in batch to reduce I/O operations
    await this.clearExpiredByPrefix(this.statePrefix, maxAge, (value) => {
      try {
        const state = JSON.parse(value) as OAuthState;
        return now - state.timestamp > maxAge;
      } catch {
        return true; // Remove corrupted data
      }
    });

    await this.clearExpiredByPrefix(this.sessionPrefix, maxAge, (value) => {
      try {
        const session = JSON.parse(value) as SessionData;
        return now - session.oauthState.timestamp > maxAge;
      } catch {
        return true; // Remove corrupted data
      }
    });

    // Also clean cache
    this.cleanCache(this.stateCache);
    this.cleanCache(this.sessionCache);
  }

  /**
   * Clear expired entries by prefix with batch processing
   */
  private async clearExpiredByPrefix(
    prefix: string,
    maxAge: number,
    shouldRemove: (value: string) => boolean
  ): Promise<void> {
    const keys = this.getStorageKeys(prefix);
    const keysToRemove: string[] = [];

    // Batch read operations
    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (!value) {
        keysToRemove.push(key);
        continue;
      }

      if (shouldRemove(value)) {
        keysToRemove.push(key);
      }
    }

    // Batch remove operations
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  }

  /**
   * Clear all cached data (useful for logout/memory cleanup)
   */
  clearCache(): void {
    this.stateCache.clear();
    this.sessionCache.clear();
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats(): { stateCacheSize: number; sessionCacheSize: number } {
    return {
      stateCacheSize: this.stateCache.size,
      sessionCacheSize: this.sessionCache.size,
    };
  }
}
