/**
 * Session Storage Adapter for OAuth State and Session Data
 */

import type { ISessionStorage } from "../../domains/core/session/repositories/session-storage.interface";
import type { SessionData, OAuthState } from "../../domain/types";

export class SessionStorageAdapter implements ISessionStorage {
  private statePrefix = "oauth_state_";
  private sessionPrefix = "session_";

  async setOAuthState(key: string, state: OAuthState): Promise<void> {
    const value = JSON.stringify(state);
    sessionStorage.setItem(`${this.statePrefix}${key}`, value);
  }

  async getOAuthState(key: string): Promise<OAuthState | null> {
    const value = sessionStorage.getItem(`${this.statePrefix}${key}`);
    if (!value) return null;
    try {
      return JSON.parse(value) as OAuthState;
    } catch {
      return null;
    }
  }

  async removeOAuthState(key: string): Promise<void> {
    sessionStorage.removeItem(`${this.statePrefix}${key}`);
  }

  async setSession(key: string, data: SessionData): Promise<void> {
    const value = JSON.stringify(data);
    sessionStorage.setItem(`${this.sessionPrefix}${key}`, value);
  }

  async getSession(key: string): Promise<SessionData | null> {
    const value = sessionStorage.getItem(`${this.sessionPrefix}${key}`);
    if (!value) return null;
    try {
      return JSON.parse(value) as SessionData;
    } catch {
      return null;
    }
  }

  async removeSession(key: string): Promise<void> {
    sessionStorage.removeItem(`${this.sessionPrefix}${key}`);
  }

  async clearExpired(maxAge: number): Promise<void> {
    const now = Date.now();
    const stateKeys = Object.keys(sessionStorage)
      .filter((key) => key.startsWith(this.statePrefix));

    for (const key of stateKeys) {
      const value = sessionStorage.getItem(key);
      if (!value) continue;

      try {
        const state = JSON.parse(value) as OAuthState;
        if (now - state.timestamp > maxAge) {
          sessionStorage.removeItem(key);
        }
      } catch {
        sessionStorage.removeItem(key);
      }
    }

    const sessionKeys = Object.keys(sessionStorage)
      .filter((key) => key.startsWith(this.sessionPrefix));

    for (const key of sessionKeys) {
      const value = sessionStorage.getItem(key);
      if (!value) continue;

      try {
        const session = JSON.parse(value) as SessionData;
        if (now - session.oauth_state.timestamp > maxAge) {
          sessionStorage.removeItem(key);
        }
      } catch {
        sessionStorage.removeItem(key);
      }
    }
  }
}
