/**
 * Social Account Entity
 */

import type {
  AccessToken,
  SocialAccount,
  SocialAccountProfile,
  SocialPlatform,
  AccountStatus,
} from "../../../../domain/types";

export class SocialAccountEntity implements SocialAccount {
  id: string;
  userId: string;
  platform: SocialPlatform;
  profile: SocialAccountProfile;
  tokens: AccessToken;
  status: AccountStatus;
  createdAt: number;
  updatedAt: number;
  lastUsedAt?: number;

  constructor(data: SocialAccount) {
    this.id = data.id;
    this.userId = data.userId;
    this.platform = data.platform;
    this.profile = data.profile;
    this.tokens = data.tokens;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.lastUsedAt = data.lastUsedAt;
  }

  isTokenExpired(): boolean {
    if (!this.tokens.expiresAt) return false;
    return Date.now() >= this.tokens.expiresAt;
  }

  isTokenExpiringSoon(thresholdMs: number = 300000): boolean {
    if (!this.tokens.expiresAt) return false;
    return Date.now() + thresholdMs >= this.tokens.expiresAt;
  }

  isActive(): boolean {
    return this.status === "active" && !this.isTokenExpired();
  }

  canRefreshToken(): boolean {
    return !!this.tokens.refreshToken && this.status === "active";
  }

  updateTokens(tokens: Partial<AccessToken>): void {
    if (tokens.token) this.tokens.token = tokens.token;
    if (tokens.expiresAt !== undefined) this.tokens.expiresAt = tokens.expiresAt;
    if (tokens.refreshToken !== undefined) this.tokens.refreshToken = tokens.refreshToken;
    this.updatedAt = Date.now();
  }

  updateStatus(status: AccountStatus): void {
    this.status = status;
    this.updatedAt = Date.now();
  }

  updateLastUsed(): void {
    this.lastUsedAt = Date.now();
    this.updatedAt = Date.now();
  }

  toJSON(): SocialAccount {
    return {
      id: this.id,
      userId: this.userId,
      platform: this.platform,
      profile: this.profile,
      tokens: this.tokens,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastUsedAt: this.lastUsedAt,
    };
  }
}
