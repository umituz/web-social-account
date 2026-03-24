/**
 * Twitter API Service
 * Performance optimized with request caching and parallel media uploads
 */

import type { SocialPostContent, SocialApiResponse } from "../../../domain/types";
import type { TwitterTweet, TwitterResponse, TwitterUser } from "../types/twitter.types";

export class TwitterApiService {
  private baseUrl: string;
  private cache: Map<string, { data: unknown; timestamp: number; expiresAt: number }>;
  private pendingRequests: Map<string, Promise<unknown>>;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 50;
  private readonly MAX_PARALLEL_UPLOADS = 3;

  constructor() {
    this.baseUrl = "https://api.twitter.com/2";
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  /**
   * Clean expired cache entries to prevent memory leaks
   */
  private cleanCache(): void {
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
   * Get cached response if available and not expired
   */
  private getCached<T>(key: string): T | null {
    this.cleanCache();

    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cache entry with TTL
   */
  private setCache(key: string, data: unknown, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    });
  }

  /**
   * Fetch with caching and request deduplication
   */
  private async fetchWithCache<T>(
    cacheKey: string,
    fetcher: () => Promise<T>,
    useCache: boolean = true
  ): Promise<T> {
    // Check cache first
    if (useCache) {
      const cached = this.getCached<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Check for pending request (deduplication)
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey) as Promise<T>;
    }

    // Create new request
    const promise = fetcher().then((result) => {
      if (useCache) {
        this.setCache(cacheKey, result);
      }
      return result;
    }).finally(() => {
      this.pendingRequests.delete(cacheKey);
    });

    this.pendingRequests.set(cacheKey, promise);
    return promise;
  }

  /**
   * Get user profile
   */
  async getUserProfile(accessToken: string): Promise<SocialApiResponse<TwitterUser>> {
    const cacheKey = `user_profile_${accessToken}`;

    return this.fetchWithCache(cacheKey, async () => {
      try {
        const response = await fetch(`${this.baseUrl}/users/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          return {
            success: false,
            error: {
              code: response.status.toString(),
              message: `Failed to fetch user profile: ${response.statusText}`,
            },
          };
        }

        const data = (await response.json()) as TwitterResponse<TwitterUser>;

        return {
          success: true,
          data: data.data,
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "NETWORK_ERROR",
            message: error instanceof Error ? error.message : "Network error occurred",
            details: error,
          },
        };
      }
    }, false); // Don't cache error responses
  }

  /**
   * Create a tweet
   */
  async createTweet(
    accessToken: string,
    content: SocialPostContent
  ): Promise<SocialApiResponse<{ id: string }>> {
    try {
      const body: { text: string; media?: { media_ids: string[] } } = {
        text: content.text,
      };

      if (content.media && content.media.length > 0) {
        // Upload media in parallel for better performance
        const mediaIds = await this.uploadMediaParallel(accessToken, content.media);
        if (mediaIds.length > 0) {
          body.media = { media_ids: mediaIds };
        }
      }

      const response = await fetch(`${this.baseUrl}/tweets`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as { detail?: string; title?: string };
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: error?.detail ?? error?.title ?? "Failed to create tweet",
            details: error,
          },
        };
      }

      const data = (await response.json()) as { data: { id: string } };

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Network error occurred",
          details: error,
        },
      };
    }
  }

  /**
   * Upload media to Twitter in parallel batches
   */
  private async uploadMedia(
    accessToken: string,
    media: SocialPostContent["media"] = []
  ): Promise<string[]> {
    return this.uploadMediaParallel(accessToken, media);
  }

  /**
   * Upload media in parallel batches with concurrency control
   */
  private async uploadMediaParallel(
    accessToken: string,
    media: SocialPostContent["media"] = []
  ): Promise<string[]> {
    const mediaItems = media.slice(0, 4); // Twitter allows max 4 media
    const mediaIds: string[] = [];

    // Process in batches to control concurrency
    for (let i = 0; i < mediaItems.length; i += this.MAX_PARALLEL_UPLOADS) {
      const batch = mediaItems.slice(i, i + this.MAX_PARALLEL_UPLOADS);

      const batchResults = await Promise.allSettled(
        batch.map((item) => this.uploadSingleMedia(accessToken, item))
      );

      for (const result of batchResults) {
        if (result.status === "fulfilled" && result.value) {
          mediaIds.push(result.value);
        }
      }
    }

    return mediaIds;
  }

  /**
   * Upload a single media item
   */
  private async uploadSingleMedia(
    accessToken: string,
    item: NonNullable<SocialPostContent["media"]>[0]
  ): Promise<string | null> {
    try {
      const response = await fetch("https://upload.twitter.com/1.1/media/upload.json", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: this.createFormData(item),
      });

      if (response.ok) {
        const data = (await response.json()) as { media_id_string: string };
        return data.media_id_string;
      }

      return null;
    } catch (error) {
      console.error("Failed to upload media:", error);
      return null;
    }
  }

  private createFormData(item: NonNullable<SocialPostContent["media"]>[0]): FormData {
    const form = new FormData();
    // Implementation depends on media type
    // This is a placeholder for the actual media upload logic
    return form;
  }

  /**
   * Get user's tweets
   */
  async getUserTweets(
    accessToken: string,
    maxResults: number = 10
  ): Promise<SocialApiResponse<TwitterTweet[]>> {
    const cacheKey = `user_tweets_${accessToken}_${maxResults}`;

    return this.fetchWithCache(cacheKey, async () => {
      try {
        const response = await fetch(
          `${this.baseUrl}/users/me/tweets?max_results=${maxResults}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          return {
            success: false,
            error: {
              code: response.status.toString(),
              message: `Failed to fetch tweets: ${response.statusText}`,
            },
          };
        }

        const data = (await response.json()) as { data?: TwitterTweet[] };

        return {
          success: true,
          data: data.data ?? [],
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "NETWORK_ERROR",
            message: error instanceof Error ? error.message : "Network error occurred",
            details: error,
          },
        };
      }
    });
  }

  /**
   * Clear all cache (useful for logout/memory cleanup)
   */
  clearCache(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Cleanup method to clear all resources
   */
  destroy(): void {
    this.clearCache();
  }
}
