/**
 * OAuth State Entity
 */

import type { OAuthState, SocialPlatform } from "../../../../domain/types";
import { minutesToMs } from "../../../../shared/time/duration";
import { isStateExpired } from "../../../../shared/predicates";

export class OAuthStateEntity implements OAuthState {
  state: string;
  codeVerifier?: string;
  userId?: string;
  timestamp: number;
  platform: SocialPlatform;
  redirectUri?: string;

  constructor(data: OAuthState) {
    this.state = data.state;
    this.codeVerifier = data.codeVerifier;
    this.userId = data.userId;
    this.timestamp = data.timestamp;
    this.platform = data.platform;
    this.redirectUri = data.redirectUri;
  }

  isExpired(maxAge: number = minutesToMs(10)): boolean {
    return isStateExpired(this.timestamp, maxAge);
  }

  toJSON(): OAuthState {
    return {
      state: this.state,
      codeVerifier: this.codeVerifier,
      userId: this.userId,
      timestamp: this.timestamp,
      platform: this.platform,
      redirectUri: this.redirectUri,
    };
  }

  static fromJSON(json: string): OAuthStateEntity {
    const data = JSON.parse(json) as OAuthState;
    return new OAuthStateEntity(data);
  }
}
