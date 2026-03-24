/**
 * React hook for social media authentication
 */

import { useState, useCallback } from "react";
import type {
  SocialPlatform,
  PlatformConfig,
  SocialAccount,
} from "../../domain/types";
import {
  TwitterOAuthService,
  LinkedInOAuthService,
} from "../../domains";
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

export function useSocialAuth(
  config: PlatformConfig,
  userId?: string
): UseSocialAuthResult {
  const [state, setState] = useState<UseSocialAuthState>({
    isLoading: false,
    error: null,
    account: null,
  });

  const connect = useCallback(
    async (platform: SocialPlatform) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        let authService: TwitterOAuthService | LinkedInOAuthService;

        switch (platform) {
          case "twitter":
            authService = new TwitterOAuthService(config);
            break;
          case "linkedin":
            authService = new LinkedInOAuthService(config);
            break;
          default:
            throw new Error(`Platform ${platform} not implemented yet`);
        }

        const { url } = await authService.generateAuthorizationUrl(platform, userId);

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
    [config, userId]
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
