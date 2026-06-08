/**
 * HTTP Client — retry, timeout, caching, and request deduplication.
 *
 * Numeric defaults and math are sourced from `shared/limits` and
 * `shared/calculations` so this file contains no magic numbers.
 */

import { HTTP_DEFAULTS } from "../../shared/limits/http-defaults";
import {
  calculateCacheExpiresAt,
  calculateEvictionCount,
  calculateRetryDelay,
} from "../../shared/calculations";
import { isCacheEntryStale, isClientError, isServerError } from "../../shared/predicates";

export interface HttpRequestOptions {
  timeout?: number;
  maxRetries?: number;
  headers?: Record<string, string>;
  enableCache?: boolean;
  cacheTTL?: number;
}

interface CacheEntry {
  data: unknown;
  timestamp: number;
  expiresAt: number;
}

export class HttpClient {
  private defaultTimeout: number;
  private defaultMaxRetries: number;
  private cache: Map<string, CacheEntry>;
  private pendingRequests: Map<string, Promise<Response>>;

  constructor(
    timeout: number = HTTP_DEFAULTS.TIMEOUT_MS,
    maxRetries: number = HTTP_DEFAULTS.MAX_RETRIES
  ) {
    this.defaultTimeout = timeout;
    this.defaultMaxRetries = maxRetries;
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  private evictStaleEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (isCacheEntryStale(entry.expiresAt, now)) {
        this.cache.delete(key);
      }
    }

    if (this.cache.size > HTTP_DEFAULTS.MAX_CACHE_ENTRIES) {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);

      const toRemove = calculateEvictionCount({
        currentSize: this.cache.size,
        maxSize: HTTP_DEFAULTS.MAX_CACHE_ENTRIES,
        evictionRatio: HTTP_DEFAULTS.CACHE_EVICTION_RATIO,
      });

      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }

  private getCacheKey(url: string, options: RequestInit): string {
    const method = options.method || "GET";
    const body = options.body ? JSON.stringify(options.body) : "";
    return `${method}:${url}:${body}`;
  }

  private getCached<T>(key: string): T | null {
    this.evictStaleEntries();

    const entry = this.cache.get(key);
    if (!entry) return null;
    if (isCacheEntryStale(entry.expiresAt)) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private setCache(key: string, data: unknown, ttl: number): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: calculateCacheExpiresAt(ttl, now),
    });
  }

  clearCache(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  async fetch(
    url: string,
    options: RequestInit & HttpRequestOptions = {}
  ): Promise<Response> {
    const {
      timeout = this.defaultTimeout,
      maxRetries = this.defaultMaxRetries,
      headers = {},
      enableCache = false,
      cacheTTL = HTTP_DEFAULTS.CACHE_TTL_MS,
      ...fetchOptions
    } = options;

    const method = (fetchOptions.method || "GET").toUpperCase();
    const cacheKey = this.getCacheKey(url, fetchOptions);

    if (enableCache && method === "GET") {
      const cached = this.getCached<Response>(cacheKey);
      if (cached) return cached;
    }

    const pending = this.pendingRequests.get(cacheKey);
    if (pending) {
      return pending;
    }

    const requestPromise = this.executeFetch(url, {
      ...fetchOptions,
      timeout,
      maxRetries,
      headers,
    });

    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const response = await requestPromise;

      if (enableCache && method === "GET" && response.ok) {
        this.setCache(cacheKey, response.clone(), cacheTTL);
      }

      return response;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  private async executeFetch(
    url: string,
    options: RequestInit & HttpRequestOptions
  ): Promise<Response> {
    const { timeout, maxRetries = HTTP_DEFAULTS.MAX_RETRIES, headers, ...fetchOptions } = options;
    let lastError: Error | null = null;
    let controller: AbortController | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        controller = new AbortController();
        timeoutId = setTimeout(() => controller?.abort(), timeout);

        const response = await fetch(url, {
          ...fetchOptions,
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          signal: controller.signal,
        });

        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        if (isClientError(response.status) || response.ok) {
          return response;
        }

        if (isServerError(response.status)) {
          lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
        } else {
          lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        if (attempt < maxRetries) {
          const delay = calculateRetryDelay({
            attempt,
            baseDelayMs: HTTP_DEFAULTS.RETRY_BASE_DELAY_MS,
            maxDelayMs: HTTP_DEFAULTS.RETRY_MAX_DELAY_MS,
          });
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } catch (error) {
        lastError = error as Error;

        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        if (error instanceof Error && error.name === "AbortError") {
          throw new Error(`Request timeout after ${timeout}ms`);
        }

        if (attempt < maxRetries) {
          const delay = calculateRetryDelay({
            attempt,
            baseDelayMs: HTTP_DEFAULTS.RETRY_BASE_DELAY_MS,
            maxDelayMs: HTTP_DEFAULTS.RETRY_MAX_DELAY_MS,
          });
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } finally {
        controller = null;
      }
    }

    throw lastError || new Error("Request failed");
  }

  async get<T>(url: string, options: Omit<HttpRequestOptions, "body"> = {}): Promise<T> {
    const response = await this.fetch(url, { ...options, method: "GET" });
    return this.parseResponse<T>(response);
  }

  async post<T>(url: string, body: unknown, options: HttpRequestOptions = {}): Promise<T> {
    const response = await this.fetch(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
    return this.parseResponse<T>(response);
  }

  async put<T>(url: string, body: unknown, options: HttpRequestOptions = {}): Promise<T> {
    const response = await this.fetch(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
    return this.parseResponse<T>(response);
  }

  async delete<T>(url: string, options: Omit<HttpRequestOptions, "body"> = {}): Promise<T> {
    const response = await this.fetch(url, { ...options, method: "DELETE" });
    return this.parseResponse<T>(response);
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = response.statusText;
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        try {
          const error = await response.json();
          errorMessage = error.message || error.detail || JSON.stringify(error);
        } catch {
          // Use status text if JSON parsing fails
        }
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return (await response.json()) as T;
    }
    return (await response.text()) as unknown as T;
  }

  destroy(): void {
    this.clearCache();
  }
}
