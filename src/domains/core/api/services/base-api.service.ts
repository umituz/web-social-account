/**
 * Base API Service - Template Method Pattern
 *
 * Provides HTTP fetching, in-memory caching, and normalized error responses.
 * Subclasses override only the platform-specific endpoints and shapes.
 */

import type { SocialApiResponse, SocialApiError } from "../../../../domain/types";
import { HttpClient, HttpRequestOptions } from "../../../../infrastructure/http/http-client.util";

export interface CacheKeyContext {
  token?: string;
  userId?: string;
  [key: string]: string | number | undefined;
}

export interface RequestOptions extends HttpRequestOptions {
  /** Disable caching for this specific request */
  noCache?: boolean;
}

export abstract class BaseApiService {
  protected readonly http: HttpClient;

  protected constructor(http: HttpClient = new HttpClient()) {
    this.http = http;
  }

  /**
   * Build a stable, low-cardinality cache key (never embed raw tokens).
   * Default uses method + path + minimal context. Override for per-user keys.
   */
  protected buildCacheKey(method: string, path: string, context?: CacheKeyContext): string {
    const parts: string[] = [method.toUpperCase(), path];
    if (context) {
      for (const [k, v] of Object.entries(context)) {
        if (v !== undefined && k !== "token") {
          parts.push(`${k}=${v}`);
        }
      }
    }
    return parts.join("|");
  }

  /**
   * Map a network/HTTP failure to a normalized SocialApiError.
   * Subclasses may override for platform-specific error shapes.
   */
  protected toApiError(error: unknown, fallbackMessage: string): SocialApiError {
    if (error instanceof Error) {
      return {
        code: "NETWORK_ERROR",
        message: error.message || fallbackMessage,
        details: error,
      };
    }
    return {
      code: "NETWORK_ERROR",
      message: fallbackMessage,
      details: error,
    };
  }

  /**
   * Helper: re-shape a SocialApiResponse by transforming its `data` field
   * when the response is successful. Centralizes the `data` undefined check
   * that callers otherwise have to repeat.
   */
  protected mapData<T, R>(
    response: SocialApiResponse<T>,
    transform: (data: T) => R
  ): SocialApiResponse<R> {
    if (!response.success) {
      return { success: false, error: response.error };
    }
    // After `response.success` is true, `data` is guaranteed to be defined.
    // Cast through `unknown` to satisfy strict null checks without disabling
    // type safety on the response envelope.
    return { success: true, data: transform(response.data as T) };
  }

  /**
   * Make an authenticated GET request with optional caching.
   */
  protected async get<T>(
    path: string,
    accessToken: string,
    options: RequestOptions = {}
  ): Promise<SocialApiResponse<T>> {
    const cacheKey = options.noCache
      ? undefined
      : this.buildCacheKey("GET", path);

    try {
      const response = await this.http.fetch(this.url(path), {
        method: "GET",
        headers: this.authHeaders(accessToken),
        enableCache: cacheKey !== undefined,
        ...options,
      });

      if (!response.ok) {
        return {
          success: false,
          error: await this.parseError(response, "Request failed"),
        };
      }

      const data = (await response.json()) as T;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: this.toApiError(error, "Network error occurred") };
    }
  }

  /**
   * Make an authenticated POST request.
   */
  protected async post<T>(
    path: string,
    accessToken: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<SocialApiResponse<T>> {
    try {
      const response = await this.http.fetch(this.url(path), {
        method: "POST",
        headers: this.authHeaders(accessToken),
        body: body !== undefined ? JSON.stringify(body) : undefined,
        ...options,
      });

      if (!response.ok) {
        return {
          success: false,
          error: await this.parseError(response, "Request failed"),
        };
      }

      const data = (await response.json()) as T;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: this.toApiError(error, "Network error occurred") };
    }
  }

  /**
   * Make an authenticated POST with form-urlencoded body.
   */
  protected async postForm<T>(
    path: string,
    accessToken: string,
    body: Record<string, string>,
    options: RequestOptions = {}
  ): Promise<SocialApiResponse<T>> {
    try {
      const response = await this.http.fetch(this.url(path), {
        method: "POST",
        headers: {
          ...this.authHeaders(accessToken),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(body).toString(),
        ...options,
      });

      if (!response.ok) {
        return {
          success: false,
          error: await this.parseError(response, "Request failed"),
        };
      }

      const data = (await response.json()) as T;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: this.toApiError(error, "Network error occurred") };
    }
  }

  /**
   * Make an authenticated DELETE request.
   */
  protected async delete<T>(
    path: string,
    accessToken: string,
    options: RequestOptions = {}
  ): Promise<SocialApiResponse<T>> {
    try {
      const response = await this.http.fetch(this.url(path), {
        method: "DELETE",
        headers: this.authHeaders(accessToken),
        ...options,
      });

      if (!response.ok && response.status !== 204) {
        return {
          success: false,
          error: await this.parseError(response, "Request failed"),
        };
      }

      if (response.status === 204) {
        return { success: true, data: undefined as T };
      }

      const data = (await response.json()) as T;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: this.toApiError(error, "Network error occurred") };
    }
  }

  /**
   * Build the full URL for a given path. Override for instance-based platforms
   * (e.g., Mastodon) by combining baseUrl with the per-instance endpoint.
   */
  protected url(path: string): string {
    return `${this.baseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  }

  /**
   * Override to provide the platform's base URL.
   */
  protected abstract baseUrl(): string;

  /**
   * Build auth headers. Default uses Bearer. Override for bot-based platforms.
   */
  protected authHeaders(token: string): Record<string, string> {
    return { Authorization: `Bearer ${token}` };
  }

  /**
   * Parse an error response body into a SocialApiError.
   * Default uses HTTP status as code and parses JSON if available.
   */
  protected async parseError(response: Response, fallback: string): Promise<SocialApiError> {
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      try {
        const errorBody = (await response.json()) as Record<string, unknown>;
        return {
          code: String(response.status),
          message: this.extractErrorMessage(errorBody) ?? response.statusText ?? fallback,
          details: errorBody,
        };
      } catch {
        // fall through
      }
    }
    return {
      code: String(response.status),
      message: response.statusText || fallback,
    };
  }

  protected extractErrorMessage(body: Record<string, unknown>): string | undefined {
    const candidate = body.message ?? body.detail ?? body.error;
    if (typeof candidate === "string") return candidate;
    if (candidate && typeof candidate === "object" && "message" in candidate) {
      const message = (candidate as { message: unknown }).message;
      if (typeof message === "string") return message;
    }
    return undefined;
  }
}
