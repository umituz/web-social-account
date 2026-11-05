
import type { SocialAccount } from "../../../../domain/types";

export interface IAccountRepository {
  save(account: SocialAccount): Promise<void>;

  findById(accountId: string): Promise<SocialAccount | null>;

  findByUserId(userId: string): Promise<SocialAccount[]>;

  findByUserIdAndPlatform(userId: string, platform: string): Promise<SocialAccount[]>;

  update(account: SocialAccount): Promise<void>;

  delete(accountId: string): Promise<void>;

  findExpired(): Promise<SocialAccount[]>;

  findExpiringSoon(thresholdMs: number): Promise<SocialAccount[]>;
}
