/**
 * Custom Storage Example
 *
 * This example shows how to implement custom storage for OAuth state.
 */

import { LocalStorageAdapter, SessionStorageAdapter } from "@umituz/web-social-account/infrastructure";
import type { ISessionStorage } from "@umituz/web-social-account/core/session";

// Use localStorage
const localStorageAdapter = new LocalStorageAdapter();

// Use sessionStorage
const sessionStorageAdapter = new SessionStorageAdapter();

// Custom implementation (e.g., for server-side)
class CustomStorageAdapter implements ISessionStorage {
  async setOAuthState(key: string, state: any): Promise<void> {
    // Store in Redis, database, etc.
    await redis.set(`oauth:${key}`, JSON.stringify(state), "EX", 600);
  }

  async getOAuthState(key: string): Promise<any | null> {
    const data = await redis.get(`oauth:${key}`);
    return data ? JSON.parse(data) : null;
  }

  async removeOAuthState(key: string): Promise<void> {
    await redis.del(`oauth:${key}`);
  }

  async setSession(key: string, data: any): Promise<void> {
    await redis.set(`session:${key}`, JSON.stringify(data), "EX", 3600);
  }

  async getSession(key: string): Promise<any | null> {
    const data = await redis.get(`session:${key}`);
    return data ? JSON.parse(data) : null;
  }

  async removeSession(key: string): Promise<void> {
    await redis.del(`session:${key}`);
  }

  async clearExpired(maxAge: number): Promise<void> {
    // Scan and delete expired keys
    const keys = await redis.keys("oauth:*");
    for (const key of keys) {
      const ttl = await redis.ttl(key);
      if (ttl === -1 || ttl > maxAge / 1000) {
        await redis.del(key);
      }
    }
  }
}
