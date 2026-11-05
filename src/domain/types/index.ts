
export type SocialPlatform =
  | "twitter"
  | "linkedin"
  | "instagram"
  | "facebook"
  | "threads"
  | "tiktok"
  | "pinterest"
  | "reddit"
  | "youtube"
  | "discord"
  | "telegram"
  | "mastodon"
  | "medium";

export type OAuthResponseType = "code" | "token";

export type PKCECodeChallengeMethod = "plain" | "S256";

export type AccountStatus = "active" | "expired" | "revoked" | "error";

export type Scope = string;

export interface AccessToken {
  token: string;
  expiresAt: number | null;
  refreshToken?: string;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
  scope?: string;
}

export interface SocialAccountProfile {
  platform: SocialPlatform;
  accountId: string;
  username?: string;
  displayName?: string;
  email?: string;
  avatarUrl?: string;
  profileUrl?: string;
  followersCount?: number;
  bio?: string;
}

export interface PlatformOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: Scope[];
  responseType?: OAuthResponseType;
  pkce?: boolean;
  codeChallengeMethod?: PKCECodeChallengeMethod;
  authorizationUrl: string;
  tokenUrl: string;
  baseUrl?: string;
  apiVersion?: string;
}

export interface PlatformConfig {
  oAuth: PlatformOAuthConfig;
  apiTimeout?: number;
  maxRetries?: number;
}

export interface OAuthState {
  state: string;
  codeVerifier?: string;
  userId?: string;
  timestamp: number;
  platform: SocialPlatform;
  redirectUri?: string;
}

export interface SocialAccount {
  id: string;
  userId: string;
  platform: SocialPlatform;
  profile: SocialAccountProfile;
  tokens: AccessToken;
  status: AccountStatus;
  createdAt: number;
  updatedAt: number;
  lastUsedAt?: number;
}

export interface SessionData {
  oauthState: OAuthState;
  callbackData?: Record<string, unknown>;
}

export interface SocialApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: SocialApiError;
}

export interface SocialApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface MediaAttachment {
  type: "image" | "video" | "gif" | "document";
  url: string;
  altText?: string;
  metadata?: Record<string, unknown>;
}

export interface SocialPostContent {
  text: string;
  media?: MediaAttachment[];
  link?: string;
  hashtags?: string[];
  mentions?: string[];
}

export interface PlatformCapabilities {
  maxTextLength: number;
  maxMediaCount: number;
  supportedMediaTypes: MediaAttachment["type"][];
  supportsScheduledPosts: boolean;
  supportsBulkPosts: boolean;
  supportsAnalytics: boolean;
}

export interface UseSocialAccountConfig {
  platform: SocialPlatform;
  config: PlatformConfig;
  onSuccess?: (account: SocialAccount) => void;
  onError?: (error: SocialApiError) => void;
}
