/**
 * Platform-config shape validator.
 *
 * Ensures the `clientId`, `clientSecret`, and `redirectUri` are present
 * and that `redirectUri` is a syntactically valid URL.
 */

import { hasValidUrlShape } from "./url-shape.validator";

export interface PlatformConfigShape {
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
}

export const hasValidPlatformConfigShape = (config: PlatformConfigShape): boolean =>
  Boolean(
    config.clientId &&
      config.clientSecret &&
      config.redirectUri &&
      hasValidUrlShape(config.redirectUri)
  );
