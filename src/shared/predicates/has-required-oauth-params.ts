/**
 * Whether a `PlatformOAuthConfig` carries the minimum parameters required
 * to begin the authorization-code flow.
 *
 * Centralized so every entry-point (entity validator, runtime guard,
 * config-from-platform factory) checks the same invariants.
 */

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
