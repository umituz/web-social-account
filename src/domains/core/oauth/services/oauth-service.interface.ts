/**
 * OAuth Service Interface
 */

import type { SocialPlatform } from "../../../../domain/types";

export interface IOAuthService {
  /**
   * Generate authorization URL for OAuth flow
   */
  generateAuthorizationUrl(
    platform: SocialPlatform,
    userId?: string
  ): Promise<{ url: string; state: string }>;

  /**
   * Exchange authorization code for access tokens
   */
  exchangeCodeForToken(
    platform: SocialPlatform,
    code: string,
    state: string,
    redirectUri: string
  ): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number }>;

  /**
   * Refresh access token using refresh token
   */
  refreshToken(
    platform: SocialPlatform,
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number }>;

  /**
   * Revoke access token
   */
  revokeToken(platform: SocialPlatform, token: string): Promise<void>;

  /**
   * Validate OAuth state
   */
  validateState(state: string): boolean;

  /**
   * Generate PKCE code challenge
   */
  generatePKCEChallenge(): Promise<{
    codeVerifier: string;
    codeChallenge: string;
  }>;
}
