
import type { SessionData, OAuthState } from "../../../../domain/types";

export interface ISessionStorage {
  setOAuthState(key: string, state: OAuthState): Promise<void>;

  getOAuthState(key: string): Promise<OAuthState | null>;

  removeOAuthState(key: string): Promise<void>;

  setSession(key: string, data: SessionData): Promise<void>;

  getSession(key: string): Promise<SessionData | null>;

  removeSession(key: string): Promise<void>;

  clearExpired(maxAge: number): Promise<void>;
}
