/**
 * React hook for social media authentication
 * Performance optimized with stable callbacks and memoized services
 */

import { useState, useCallback, useRef, useMemo } from "react";
import type {
  SocialPlatform,
  PlatformConfig,
  SocialAccount,
} from "../../domain/types";
import { TwitterOAuthService } from "../../domains/twitter";
import { LinkedInOAuthService } from "../../domains/linkedin";
import {
  OAuthError,
  ConfigurationError,
} from "../../domain/errors";

interface UseSocialAuthState {
  isLoading: boolean;
  error: string | null;
  account: SocialAccount | null;
}

interface UseSocialAuthResult extends UseSocialAuthState {
  connect: (platform: SocialPlatform) => Promise<void>;
  disconnect: (accountId: string) => Promise<void>;
  clearError: () => void;
}

/**
 * Deep compare two objects for equality (optimized for config comparison)
 */
function isDeepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object" || a === null || b === null) return false;

  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!isDeepEqual(objA[key], objB[key])) return false;
  }

  return true;
}

export function useSocialAuth(
  config: PlatformConfig,
  userId?: string
): UseSocialAuthResult {
  const [state, setState] = useState<UseSocialAuthState>({
    isLoading: false,
    error: null,
    account: null,
  });

  // Use ref to track config changes without triggering re-renders
  const configRef = useRef(config);
  const userIdRef = useRef(userId);

  // Update refs only when values actually change
  if (!isDeepEqual(configRef.current, config)) {
    configRef.current = config;
  }
  if (userIdRef.current !== userId) {
    userIdRef.current = userId;
  }

  // Memoize service instances to prevent recreation on every render
  const services = useMemo(() => {
    const twitterService = new TwitterOAuthService(configRef.current);
    const linkedinService = new LinkedInOAuthService(configRef.current);

    return {
      twitter: twitterService,
      linkedin: linkedinService,
    };
  }, []); // Empty deps - services are created once and reused

  const connect = useCallback(
    async (platform: SocialPlatform) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        let authService: TwitterOAuthService | LinkedInOAuthService;

        switch (platform) {
          case "twitter":
            authService = services.twitter;
            break;
          case "linkedin":
            authService = services.linkedin;
            break;
          default:
            throw new Error(`Platform ${platform} not implemented yet`);
        }

        const { url } = await authService.generateAuthorizationUrl(platform, userIdRef.current);

        // Redirect to authorization URL
        if (typeof window !== "undefined") {
          window.location.href = url;
        }
      } catch (error) {
        let errorMessage = "Failed to connect account";

        if (error instanceof OAuthError || error instanceof ConfigurationError) {
          errorMessage = error.message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
      }
    },
    [services]
  );

  const disconnect = useCallback(
    async (accountId: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Implementation depends on storage
        setState((prev) => ({ ...prev, isLoading: false, account: null }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to disconnect account";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    clearError,
  };
}

export type { UseSocialAuthResult, UseSocialAuthState };
