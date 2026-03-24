/**
 * Validation utilities
 */

export class ValidationUtils {
  /**
   * Validate URL
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate OAuth state format
   */
  static isValidState(state: string): boolean {
    // State should be a valid UUID or at least 8 characters
    return /^[a-f0-9-]{8,}$/i.test(state) || state.length >= 8;
  }

  /**
   * Sanitize user input
   */
  static sanitizeInput(input: string): string {
    return input.replace(/[<>]/g, "");
  }

  /**
   * Validate required fields
   */
  static validateRequired(obj: Record<string, unknown>, fields: string[]): boolean {
    return fields.every((field) => obj[field] !== undefined && obj[field] !== null && obj[field] !== "");
  }

  /**
   * Validate platform config
   */
  static validatePlatformConfig(config: {
    clientId?: string;
    clientSecret?: string;
    redirectUri?: string;
  }): boolean {
    return !!(
      config.clientId &&
      config.clientSecret &&
      config.redirectUri &&
      this.isValidUrl(config.redirectUri)
    );
  }
}
