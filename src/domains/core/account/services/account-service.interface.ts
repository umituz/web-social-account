/**
 * Account Service Interface
 */

import type { SocialAccount, SocialPlatform, SocialPostContent } from "../../../../domain/types";

export interface IAccountService {
  /**
   * Connect a social media account
   */
  connectAccount(
    platform: SocialPlatform,
    userId: string,
    accessToken: string,
    refreshToken?: string,
    expiresIn?: number
  ): Promise<SocialAccount>;

  /**
   * Disconnect a social media account
   */
  disconnectAccount(accountId: string): Promise<void>;

  /**
   * Get user's accounts for a platform
   */
  getUserAccounts(userId: string, platform?: SocialPlatform): Promise<SocialAccount[]>;

  /**
   * Get account by ID
   */
  getAccount(accountId: string): Promise<SocialAccount | null>;

  /**
   * Refresh account tokens
   */
  refreshAccountTokens(accountId: string): Promise<SocialAccount>;

  /**
   * Post content to social media
   */
  postContent(
    accountId: string,
    content: SocialPostContent,
    scheduleFor?: Date
  ): Promise<{ success: boolean; postId?: string; error?: string }>;

  /**
   * Validate account status
   */
  validateAccount(accountId: string): Promise<boolean>;

  /**
   * Get account analytics
   */
  getAccountAnalytics(
    accountId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    followers: number;
    engagement: number;
    posts: number;
    impressions: number;
  }>;
}
