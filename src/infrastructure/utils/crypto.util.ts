/**
 * Cryptographic utilities for PKCE and security
 */

export class CryptoUtils {
  /**
   * Generate random string for PKCE code verifier
   */
  static generateRandomString(length: number): string {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from(bytes, (b) => chars[b % chars.length]).join("");
  }

  /**
   * Generate PKCE code challenge from verifier
   */
  static async generateCodeChallenge(verifier: string): Promise<string> {
    const data = new TextEncoder().encode(verifier);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  /**
   * Generate random state for OAuth
   */
  static generateState(): string {
    return crypto.randomUUID();
  }

  /**
   * Generate SHA-256 hash
   */
  static async sha256(message: string): Promise<string> {
    const data = new TextEncoder().encode(message);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  /**
   * Base64 URL encode
   */
  static base64UrlEncode(data: string): string {
    return btoa(data)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  /**
   * Base64 URL decode
   */
  static base64UrlDecode(data: string): string {
    let base64 = data.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    return atob(base64);
  }
}
