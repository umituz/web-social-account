/**
 * Cryptographic utilities for PKCE and security
 */

const PKCE_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export class CryptoUtils {
  /**
   * Generate cryptographically-secure random string (PKCE-safe alphabet)
   * Length 43-128 per RFC 7636.
   */
  static generateRandomString(length: number): string {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => PKCE_ALPHABET[b % PKCE_ALPHABET.length]).join("");
  }

  /**
   * Generate PKCE code challenge from verifier (S256 method)
   */
  static async generateCodeChallenge(verifier: string): Promise<string> {
    const data = new TextEncoder().encode(verifier);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return this.base64UrlEncodeBytes(new Uint8Array(hash));
  }

  /**
   * Generate random state for OAuth
   */
  static generateState(): string {
    return crypto.randomUUID();
  }

  /**
   * Generate SHA-256 hash (hex encoded)
   */
  static async sha256(message: string): Promise<string> {
    const data = new TextEncoder().encode(message);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  /**
   * Base64 URL encode (string input)
   */
  static base64UrlEncode(data: string): string {
    return this.base64UrlEncodeBytes(new TextEncoder().encode(data));
  }

  /**
   * Base64 URL encode (bytes input)
   */
  static base64UrlEncodeBytes(bytes: Uint8Array): string {
    let binary = "";
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return btoa(binary)
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
