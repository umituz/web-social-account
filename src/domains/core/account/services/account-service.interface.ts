
import type { SocialAccount, SocialPlatform, SocialPostContent } from "../../../../domain/types";

export interface IAccountService {
  connectAccount(
    platform: SocialPlatform,
    userId: string,
    accessToken: string,
    refreshToken?: string,
    expiresIn?: number
  ): Promise<SocialAccount>;

  disconnectAccount(accountId: string): Promise<void>;

  getUserAccounts(userId: string, platform?: SocialPlatform): Promise<SocialAccount[]>;

  getAccount(accountId: string): Promise<SocialAccount | null>;

  refreshAccountTokens(accountId: string): Promise<SocialAccount>;

  postContent(
    accountId: string,
    content: SocialPostContent,
    scheduleFor?: Date
  ): Promise<{ success: boolean; postId?: string; error?: string }>;

  validateAccount(accountId: string): Promise<boolean>;

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
