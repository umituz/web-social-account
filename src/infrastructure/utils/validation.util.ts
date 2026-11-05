
export {
  hasValidEmailShape,
  hasValidUrlShape,
  hasValidOAuthStateShape,
  hasValidPlatformConfigShape,
  hasValidPkceVerifierShape,
  hasAllRequiredFields,
} from "../../shared/validators";

import { hasValidEmailShape } from "../../shared/validators/email-shape.validator";
import { hasValidUrlShape } from "../../shared/validators/url-shape.validator";
import { hasValidOAuthStateShape } from "../../shared/validators/oauth-state-shape.validator";
import { hasValidPlatformConfigShape } from "../../shared/validators/platform-config-shape.validator";
import { hasAllRequiredFields } from "../../shared/validators/required-fields.validator";

export const ValidationUtils = {
  isValidEmail: (email: string) => hasValidEmailShape(email),
  isValidUrl: (url: string) => hasValidUrlShape(url),
  isValidState: (state: string) => hasValidOAuthStateShape(state),
  validatePlatformConfig: (config: { clientId?: string; clientSecret?: string; redirectUri?: string }) =>
    hasValidPlatformConfigShape(config),
  validateRequired: (obj: Record<string, unknown>, fields: string[]) =>
    hasAllRequiredFields(obj, fields),
  sanitizeInput: (input: string) => input.replace(/[<>]/g, ""),
};
