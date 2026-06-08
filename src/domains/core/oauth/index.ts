/**
 * OAuth domain exports
 */

export * from "./entities/oauth-state.entity";
export * from "./services/oauth-service.interface";
export * from "./services/base-oauth.service";

export type { IOAuthService, OAuthTokenResponse } from "./services/oauth-service.interface";
export type {
  AuthorizationUrlParams,
  TokenRequestBody,
} from "./services/base-oauth.service";
