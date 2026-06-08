/**
 * Base Web Storage Adapter - Template Method Pattern
 *
 * Provides in-memory cache + storage I/O. Subclasses bind to a specific
 * Storage implementation (localStorage, sessionStorage, or custom).
 */

import type { ISessionStorage } from "../../domains/core/session/repositories/session-storage.interface";
import type { SessionData, OAuthState } from "../../domain/types";
import { STORAGE_DEFAULTS } from "../../shared/limits/storage-defaults";
import { calculateEvictionCount } from "../../shared/calculations";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  key(index: number): string | null;
  readonly length: number;
}

export abstract class BaseStorageAdapter implements ISessionStorage {
  protected readonly statePrefix = "oauth_state_";
  protected readonly sessionPrefix = "session_";
  protected readonly cacheTtlMs = STORAGE_DEFAULTS.CACHE_TTL_MS;
  protected readonly maxCacheSize = STORAGE_DEFAULTS.MAX_CACHE_ENTRIES;

  private readonly stateCache = new Map<string, CacheEntry<OAuthState>>();
  private readonly sessionCache = new Map<string, CacheEntry<SessionData>>();

  protected constructor() {
    if (this.isAvailable()) {
      this.warmCache();
    }
  }

  /**
   * Provide the underlying storage. Throws if not available.
   */
  protected abstract storage(): StorageLike;

  /**
   * Whether the storage backend is available in this environment.
   */
  protected isAvailable(): boolean {
    try {
      return typeof this.storage() !== "undefined";
    } catch {
      return false;
    }
  }

  private warmCache(): void {
    try {
      this.loadIntoCache<OAuthState>(this.statePrefix, this.stateCache);
      this.loadIntoCache<SessionData>(this.sessionPrefix, this.sessionCache);
    } catch (error) {
      console.warn("Failed to warm storage cache:", error);
    }
  }

  private loadIntoCache<T>(prefix: string, cache: Map<string, CacheEntry<T>>): void {
    const keys = this.keysWithPrefix(prefix);
    const now = Date.now();

    for (const fullKey of keys) {
      const value = this.storage().getItem(fullKey);
      if (!value) continue;

      try {
        const data = JSON.parse(value) as T;
        cache.set(fullKey.replace(prefix, ""), { data, timestamp: now });
      } catch {
        this.storage().removeItem(fullKey);
      }
    }
  }

  private keysWithPrefix(prefix: string): string[] {
    try {
      const store = this.storage();
      const result: string[] = [];
      for (let i = 0; i < store.length; i++) {
        const key = store.key(i);
        if (key && key.startsWith(prefix)) result.push(key);
      }
      return result;
    } catch {
      return [];
    }
  }

  private pruneCache<T>(cache: Map<string, CacheEntry<T>>): void {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > this.cacheTtlMs) {
        cache.delete(key);
      }
    }
    if (cache.size > this.maxCacheSize) {
      const sorted = Array.from(cache.entries()).sort(
        (a, b) => a[1].timestamp - b[1].timestamp
      );
      const toRemove = calculateEvictionCount({
        currentSize: cache.size,
        maxSize: this.maxCacheSize,
        evictionRatio: STORAGE_DEFAULTS.CACHE_EVICTION_RATIO,
      });
      for (let i = 0; i < toRemove; i++) {
        cache.delete(sorted[i][0]);
      }
    }
  }

  private readCache<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.cacheTtlMs) {
      cache.delete(key);
      return null;
    }
    return entry.data;
  }

  private writeCache<T>(cache: Map<string, CacheEntry<T>>, key: string, data: T): void {
    cache.set(key, { data, timestamp: Date.now() });
  }

  async setOAuthState(key: string, state: OAuthState): Promise<void> {
    const fullKey = `${this.statePrefix}${key}`;
    this.storage().setItem(fullKey, JSON.stringify(state));
    this.writeCache(this.stateCache, key, state);
  }

  async getOAuthState(key: string): Promise<OAuthState | null> {
    const cached = this.readCache(this.stateCache, key);
    if (cached) return cached;

    const raw = this.storage().getItem(`${this.statePrefix}${key}`);
    if (!raw) return null;

    try {
      const state = JSON.parse(raw) as OAuthState;
      this.writeCache(this.stateCache, key, state);
      return state;
    } catch {
      return null;
    }
  }

  async removeOAuthState(key: string): Promise<void> {
    this.storage().removeItem(`${this.statePrefix}${key}`);
    this.stateCache.delete(key);
  }

  async setSession(key: string, data: SessionData): Promise<void> {
    const fullKey = `${this.sessionPrefix}${key}`;
    this.storage().setItem(fullKey, JSON.stringify(data));
    this.writeCache(this.sessionCache, key, data);
  }

  async getSession(key: string): Promise<SessionData | null> {
    const cached = this.readCache(this.sessionCache, key);
    if (cached) return cached;

    const raw = this.storage().getItem(`${this.sessionPrefix}${key}`);
    if (!raw) return null;

    try {
      const session = JSON.parse(raw) as SessionData;
      this.writeCache(this.sessionCache, key, session);
      return session;
    } catch {
      return null;
    }
  }

  async removeSession(key: string): Promise<void> {
    this.storage().removeItem(`${this.sessionPrefix}${key}`);
    this.sessionCache.delete(key);
  }

  async clearExpired(maxAge: number): Promise<void> {
    const now = Date.now();
    this.clearExpiredByPrefix(this.statePrefix, maxAge, (raw) => {
      try {
        const state = JSON.parse(raw) as OAuthState;
        return now - state.timestamp > maxAge;
      } catch {
        return true;
      }
    });
    this.clearExpiredByPrefix(this.sessionPrefix, maxAge, (raw) => {
      try {
        const session = JSON.parse(raw) as SessionData;
        return now - session.oauthState.timestamp > maxAge;
      } catch {
        return true;
      }
    });
    this.pruneCache(this.stateCache);
    this.pruneCache(this.sessionCache);
  }

  private clearExpiredByPrefix(
    prefix: string,
    _maxAge: number,
    shouldRemove: (raw: string) => boolean
  ): void {
    const store = this.storage();
    for (const key of this.keysWithPrefix(prefix)) {
      const value = store.getItem(key);
      if (!value || shouldRemove(value)) {
        store.removeItem(key);
      }
    }
  }

  clearCache(): void {
    this.stateCache.clear();
    this.sessionCache.clear();
  }
}
