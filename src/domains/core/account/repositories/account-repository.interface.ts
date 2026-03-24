/**
 * Account Repository Interface
 */

import type { SocialAccount } from "../../../../domain/types";

export interface IAccountRepository {
  /**
   * Save account to storage
   */
  save(account: SocialAccount): Promise<void>;

  /**
   * Find account by ID
   */
  findById(accountId: string): Promise<SocialAccount | null>;

  /**
   * Find accounts by user ID
   */
  findByUserId(userId: string): Promise<SocialAccount[]>;

  /**
   * Find accounts by user ID and platform
   */
  findByUserIdAndPlatform(userId: string, platform: string): Promise<SocialAccount[]>;

  /**
   * Update account
   */
  update(account: SocialAccount): Promise<void>;

  /**
   * Delete account
   */
  delete(accountId: string): Promise<void>;

  /**
   * Find expired accounts
   */
  findExpired(): Promise<SocialAccount[]>;

  /**
   * Find accounts expiring soon
   */
  findExpiringSoon(thresholdMs: number): Promise<SocialAccount[]>;
}
