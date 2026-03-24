/**
 * Session Storage Interface
 */

import type { SessionData, OAuthState } from "../../../../domain/types";

export interface ISessionStorage {
  /**
   * Store OAuth state
   */
  setOAuthState(key: string, state: OAuthState): Promise<void>;

  /**
   * Get OAuth state
   */
  getOAuthState(key: string): Promise<OAuthState | null>;

  /**
   * Remove OAuth state
   */
  removeOAuthState(key: string): Promise<void>;

  /**
   * Store session data
   */
  setSession(key: string, data: SessionData): Promise<void>;

  /**
   * Get session data
   */
  getSession(key: string): Promise<SessionData | null>;

  /**
   * Remove session data
   */
  removeSession(key: string): Promise<void>;

  /**
   * Clear expired sessions
   */
  clearExpired(maxAge: number): Promise<void>;
}
