
import type { PlatformOAuthConfig } from "../../domain/types";

export const hasRequiredOAuthParams = (config: PlatformOAuthConfig): boolean =>
  Boolean(
    config.clientId &&
      config.clientSecret &&
      config.redirectUri &&
      config.authorizationUrl &&
      config.tokenUrl &&
      Array.isArray(config.scope) &&
      config.scope.length > 0
  );
