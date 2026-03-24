/**
 * LinkedIn API Service
 * Performance optimized with request caching and improved error handling
 */

import type { SocialPostContent, SocialApiResponse } from "../../../domain/types";
import type { LinkedInPost, LinkedInProfile } from "../types/linkedin.types";

export class LinkedInApiService {
  private baseUrl: string;
  private cache: Map<string, { data: unknown; timestamp: number; expiresAt: number }>;
  private pendingRequests: Map<string, Promise<unknown>>;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 50;

  constructor() {
    this.baseUrl = "https://api.linkedin.com/v2";
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
  async getUserProfile(accessToken: string): Promise<SocialApiResponse<LinkedInProfile>> {
    const cacheKey = `user_profile_${accessToken}`;

    return this.fetchWithCache(cacheKey, async () => {
      try {
        const response = await fetch(
          `${this.baseUrl}/userinfo?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))`,
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
              message: `Failed to fetch user profile: ${response.statusText}`,
            },
          };
        }

        const data = (await response.json()) as LinkedInProfile;

        return {
          success: true,
          data,
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
   * Create a LinkedIn post
   */
  async createPost(
    accessToken: string,
    userId: string,
    content: SocialPostContent
  ): Promise<SocialApiResponse<{ id: string }>> {
    try {
      const postBody = {
        author: `urn:li:person:${userId}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: content.text,
            },
            shareMediaCategory: content.media && content.media.length > 0 ? "IMAGE" : "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      };

      const response = await fetch(`${this.baseUrl}/ugcPosts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify(postBody),
      });

      if (!response.ok) {
        let errorMessage = "Failed to create post";
        const contentType = response.headers.get("content-type");

        if (contentType?.includes("application/json")) {
          try {
            const error = (await response.json()) as { message?: string };
            errorMessage = error.message ?? errorMessage;
          } catch {
            // Use default message
          }
        }

        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: errorMessage,
            details: response.statusText,
          },
        };
      }

      const data = (await response.json()) as { id: string };

      return {
        success: true,
        data,
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
   * Get user's posts
   */
  async getUserPosts(
    accessToken: string,
    userId: string,
    count: number = 10
  ): Promise<SocialApiResponse<LinkedInPost[]>> {
    const cacheKey = `user_posts_${userId}_${count}`;

    return this.fetchWithCache(cacheKey, async () => {
      try {
        const response = await fetch(
          `${this.baseUrl}/ugcPosts?q=authors&authors=List(urn:li:person:${userId})&count=${count}`,
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
              message: `Failed to fetch posts: ${response.statusText}`,
            },
          };
        }

        const data = (await response.json()) as { elements?: LinkedInPost[] };

        return {
          success: true,
          data: data.elements ?? [],
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
