/**
 * HTTP Client Utility with retry logic, timeout, caching, and memory management
 */

export interface HttpRequestOptions {
  timeout?: number;
  maxRetries?: number;
  headers?: Record<string, string>;
  enableCache?: boolean; // Enable response caching
  cacheTTL?: number; // Cache time-to-live in milliseconds (default: 5 minutes)
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
  private readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 100;

  constructor(timeout: number = 30000, maxRetries: number = 3) {
    this.defaultTimeout = timeout;
    this.defaultMaxRetries = maxRetries;
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  /**
   * Clear expired cache entries to prevent memory leaks
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }

    // Prevent cache from growing too large (LRU eviction)
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);

      // Remove oldest 20% of entries
      const toRemove = Math.ceil(this.MAX_CACHE_SIZE * 0.2);
      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }

  /**
   * Generate cache key from URL and options
   */
  private getCacheKey(url: string, options: RequestInit): string {
    const method = options.method || "GET";
    const body = options.body ? JSON.stringify(options.body) : "";
    return `${method}:${url}:${body}`;
  }

  /**
   * Get cached response if available and not expired
   */
  private getCached<T>(key: string): T | null {
    this.cleanExpiredCache();

    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cache entry with TTL
   */
  private setCache(key: string, data: unknown, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    });
  }

  /**
   * Clear all cache (useful for logout/memory cleanup)
   */
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
      cacheTTL = this.DEFAULT_CACHE_TTL,
      ...fetchOptions
    } = options;

    const method = (fetchOptions.method || "GET").toUpperCase();
    const cacheKey = this.getCacheKey(url, fetchOptions);

    // Return cached response for GET requests if caching is enabled
    if (enableCache && method === "GET") {
      const cached = this.getCached<Response>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Request deduplication: return existing pending request for same key
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
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

      // Cache successful GET responses
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
    const { timeout, maxRetries, headers, ...fetchOptions } = options;
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

        // Clean up timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        // Don't retry on 4xx errors (except 429 Too Many Requests)
        if (!response.ok && response.status >= 400 && response.status < 500 && response.status !== 429) {
          return response;
        }

        if (response.ok) {
          return response;
        }

        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);

        // Wait before retry with exponential backoff (max 10 seconds)
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } catch (error) {
        lastError = error as Error;

        // Clean up timeout on error
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        // Don't retry on AbortError (timeout)
        if (error instanceof Error && error.name === "AbortError") {
          throw new Error(`Request timeout after ${timeout}ms`);
        }

        // Wait before retry with exponential backoff
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } finally {
        // Ensure controller is cleaned up
        if (controller) {
          controller = null;
        }
      }
    }

    throw lastError || new Error("Request failed");
  }

  async get<T>(
    url: string,
    options: Omit<HttpRequestOptions, "body"> = {}
  ): Promise<T> {
    const response = await this.fetch(url, { ...options, method: "GET" });
    return this.parseResponse<T>(response);
  }

  async post<T>(
    url: string,
    body: unknown,
    options: HttpRequestOptions = {}
  ): Promise<T> {
    const response = await this.fetch(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
    return this.parseResponse<T>(response);
  }

  async put<T>(
    url: string,
    body: unknown,
    options: HttpRequestOptions = {}
  ): Promise<T> {
    const response = await this.fetch(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
    return this.parseResponse<T>(response);
  }

  async delete<T>(
    url: string,
    options: Omit<HttpRequestOptions, "body"> = {}
  ): Promise<T> {
    const response = await this.fetch(url, { ...options, method: "DELETE" });
    return this.parseResponse<T>(response);
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = response.statusText;

      // Only try to parse error response for JSON content types
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

  /**
   * Cleanup method to clear all resources (call when component unmounts or user logs out)
   */
  destroy(): void {
    this.clearCache();
  }
}
