/**
 * Tests for Storage Adapters
 */

import { describe, it, expect, beforeEach } from "vitest";
import { LocalStorageAdapter, SessionStorageAdapter } from "../../../src/infrastructure/storage";

describe("LocalStorageAdapter", () => {
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    adapter = new LocalStorageAdapter();
    localStorage.clear();
  });

  it("should store and retrieve OAuth state", async () => {
    const state = {
      state: "test-state",
      userId: "user-123",
      timestamp: Date.now(),
      platform: "twitter" as const,
    };

    await adapter.setOAuthState("test-key", state);
    const retrieved = await adapter.getOAuthState("test-key");

    expect(retrieved).toEqual(state);
  });

  it("should remove OAuth state", async () => {
    const state = {
      state: "test-state",
      userId: "user-123",
      timestamp: Date.now(),
      platform: "twitter" as const,
    };

    await adapter.setOAuthState("test-key", state);
    await adapter.removeOAuthState("test-key");

    const retrieved = await adapter.getOAuthState("test-key");
    expect(retrieved).toBeNull();
  });

  it("should clear expired states", async () => {
    const oldState = {
      state: "old-state",
      userId: "user-123",
      timestamp: Date.now() - 700000, // 11+ minutes ago
      platform: "twitter" as const,
    };

    await adapter.setOAuthState("old-key", oldState);
    await adapter.clearExpired(600000); // 10 minutes max age

    const retrieved = await adapter.getOAuthState("old-key");
    expect(retrieved).toBeNull();
  });
});

describe("SessionStorageAdapter", () => {
  let adapter: SessionStorageAdapter;

  beforeEach(() => {
    adapter = new SessionStorageAdapter();
    sessionStorage.clear();
  });

  it("should store and retrieve session data", async () => {
    const sessionData = {
      oauth_state: {
        state: "test-state",
        userId: "user-123",
        timestamp: Date.now(),
        platform: "twitter" as const,
      },
      callbackData: { code: "test-code" },
    };

    await adapter.setSession("test-key", sessionData);
    const retrieved = await adapter.getSession("test-key");

    expect(retrieved).toEqual(sessionData);
  });
});
