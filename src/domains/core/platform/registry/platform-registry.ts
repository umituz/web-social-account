/**
 * Platform Registry - Registry + Factory Pattern
 *
 * Single source of truth for OAuth and API service instantiation per platform.
 * Adding a new platform only requires registering it here.
 */

import type { SocialPlatform, PlatformConfig } from "../../../../domain/types";
import { HttpClient } from "../../../../infrastructure/http/http-client.util";
import type { ISessionStorage } from "../../session/repositories/session-storage.interface";
import { PlatformConfigEntity } from "../../config/entities/platform-config.entity";
import { TwitterOAuthService } from "../../../twitter/services/twitter-oauth.service";
import { LinkedInOAuthService } from "../../../linkedin/services/linkedin-oauth.service";
import { InstagramOAuthService } from "../../../instagram/services/instagram-oauth.service";
import { FacebookOAuthService } from "../../../facebook/services/facebook-oauth.service";
import { ThreadsOAuthService } from "../../../threads/services/threads-oauth.service";
import { TikTokOAuthService } from "../../../tiktok/services/tiktok-oauth.service";
import { PinterestOAuthService } from "../../../pinterest/services/pinterest-oauth.service";
import { RedditOAuthService } from "../../../reddit/services/reddit-oauth.service";
import { YouTubeOAuthService } from "../../../youtube/services/youtube-oauth.service";
import { DiscordOAuthService } from "../../../discord/services/discord-oauth.service";
import { TelegramOAuthService } from "../../../telegram/services/telegram-oauth.service";
import { MastodonOAuthService } from "../../../mastodon/services/mastodon-oauth.service";
import { MediumOAuthService } from "../../../medium/services/medium-oauth.service";

export type OAuthServiceInstance =
  | TwitterOAuthService
  | LinkedInOAuthService
  | InstagramOAuthService
  | FacebookOAuthService
  | ThreadsOAuthService
  | TikTokOAuthService
  | PinterestOAuthService
  | RedditOAuthService
  | YouTubeOAuthService
  | DiscordOAuthService
  | TelegramOAuthService
  | MastodonOAuthService
  | MediumOAuthService;

export interface OAuthServiceCtor {
  new (
    config: PlatformConfig,
    http: HttpClient,
    storage: ISessionStorage | null
  ): OAuthServiceInstance;
}

const OAUTH_REGISTRY: Record<SocialPlatform, OAuthServiceCtor> = {
  twitter: TwitterOAuthService as unknown as OAuthServiceCtor,
  linkedin: LinkedInOAuthService as unknown as OAuthServiceCtor,
  instagram: InstagramOAuthService as unknown as OAuthServiceCtor,
  facebook: FacebookOAuthService as unknown as OAuthServiceCtor,
  threads: ThreadsOAuthService as unknown as OAuthServiceCtor,
  tiktok: TikTokOAuthService as unknown as OAuthServiceCtor,
  pinterest: PinterestOAuthService as unknown as OAuthServiceCtor,
  reddit: RedditOAuthService as unknown as OAuthServiceCtor,
  youtube: YouTubeOAuthService as unknown as OAuthServiceCtor,
  discord: DiscordOAuthService as unknown as OAuthServiceCtor,
  telegram: TelegramOAuthService as unknown as OAuthServiceCtor,
  mastodon: MastodonOAuthService as unknown as OAuthServiceCtor,
  medium: MediumOAuthService as unknown as OAuthServiceCtor,
};

export interface RegistryOptions {
  http?: HttpClient;
  storage?: ISessionStorage | null;
}

export class PlatformRegistry {
  private readonly http: HttpClient;
  private readonly storage: ISessionStorage | null;

  constructor(options: RegistryOptions = {}) {
    this.http = options.http ?? new HttpClient();
    this.storage = options.storage ?? null;
  }

  createOAuthService(platform: SocialPlatform, config: PlatformConfig): OAuthServiceInstance {
    const Ctor = OAUTH_REGISTRY[platform];
    if (!Ctor) {
      throw new Error(`No OAuth service registered for platform: ${platform}`);
    }
    const normalized = config instanceof PlatformConfigEntity
      ? config
      : new PlatformConfigEntity(config);
    return new Ctor(normalized, this.http, this.storage);
  }

  static supportedPlatforms(): SocialPlatform[] {
    return Object.keys(OAUTH_REGISTRY) as SocialPlatform[];
  }
}
