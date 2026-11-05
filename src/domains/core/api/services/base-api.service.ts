
import type { SocialApiResponse, SocialApiError } from "../../../../domain/types";
import { HttpClient, HttpRequestOptions } from "../../../../infrastructure/http/http-client.util";

export interface CacheKeyContext {
  token?: string;
  userId?: string;
  [key: string]: string | number | undefined;
}

export interface RequestOptions extends HttpRequestOptions {
  noCache?: boolean;
}

export abstract class BaseApiService {
  protected readonly http: HttpClient;

  protected constructor(http: HttpClient = new HttpClient()) {
    this.http = http;
  }

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

  protected mapData<T, R>(
    response: SocialApiResponse<T>,
    transform: (data: T) => R
  ): SocialApiResponse<R> {
    if (!response.success) {
      return { success: false, error: response.error };
    }
    return { success: true, data: transform(response.data as T) };
  }

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

  protected url(path: string): string {
    return `${this.baseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  }

  protected abstract baseUrl(): string;

  protected authHeaders(token: string): Record<string, string> {
    return { Authorization: `Bearer ${token}` };
  }

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
