/**
 * React hook for social media authentication
 *
 * Uses the PlatformRegistry to resolve the right OAuth service for any
 * platform and exposes a stable connect/disconnect API.
 */

import { useCallback, useMemo, useRef, useState } from "react";
import type { SocialPlatform, PlatformConfig, SocialAccount } from "../../domain/types";
import { OAuthError, ConfigurationError } from "../../domain/errors";
import { PlatformRegistry } from "../../domains/core/platform/registry/platform-registry";
import type { ISessionStorage } from "../../domains/core/session/repositories/session-storage.interface";
import type { IOAuthService } from "../../domains/core/oauth/services/oauth-service.interface";

export interface UseSocialAuthState {
  isLoading: boolean;
  error: string | null;
  account: SocialAccount | null;
}

export interface UseSocialAuthResult extends UseSocialAuthState {
  connect: (platform: SocialPlatform) => Promise<void>;
  disconnect: (account: SocialAccount) => Promise<void>;
  clearError: () => void;
}

export interface UseSocialAuthOptions {
  storage?: ISessionStorage | null;
  registry?: PlatformRegistry;
  onAuthorizeUrl?: (platform: SocialPlatform, url: string, state: string) => void;
  onConnected?: (platform: SocialPlatform, account: SocialAccount) => void;
  onDisconnected?: (accountId: string) => void;
}

export function useSocialAuth(
  config: PlatformConfig,
  userId?: string,
  options: UseSocialAuthOptions = {}
): UseSocialAuthResult {
  const [state, setState] = useState<UseSocialAuthState>({
    isLoading: false,
    error: null,
    account: null,
  });

  const registry = useMemo(
    () => options.registry ?? new PlatformRegistry({ storage: options.storage ?? null }),
    [options.registry, options.storage]
  );

  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  const onAuthorizeRef = useRef(options.onAuthorizeUrl);
  onAuthorizeRef.current = options.onAuthorizeUrl;

  const onConnectedRef = useRef(options.onConnected);
  onConnectedRef.current = options.onConnected;

  const onDisconnectedRef = useRef(options.onDisconnected);
  onDisconnectedRef.current = options.onDisconnected;

  const getService = useCallback(
    (platform: SocialPlatform): IOAuthService =>
      registry.createOAuthService(platform, config) as unknown as IOAuthService,
    [registry, config]
  );

  const connect = useCallback(
    async (platform: SocialPlatform) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const service = getService(platform);
        const { url, state: oauthState } = await service.generateAuthorizationUrl(
          platform,
          userIdRef.current
        );

        onAuthorizeRef.current?.(platform, url, oauthState);

        if (typeof window !== "undefined" && !onAuthorizeRef.current) {
          window.location.href = url;
        }
      } catch (error) {
        const message =
          error instanceof OAuthError ||
          error instanceof ConfigurationError ||
          error instanceof Error
            ? error.message
            : "Failed to connect account";
        setState((prev) => ({ ...prev, isLoading: false, error: message }));
      }
    },
    [getService]
  );

  const disconnect = useCallback(
    async (account: SocialAccount) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const service = getService(account.platform);
        await service.revokeToken(account.platform, account.tokens.token);

        if (state.account?.id === account.id) {
          setState({ isLoading: false, error: null, account: null });
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }

        onDisconnectedRef.current?.(account.id);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to disconnect account";
        setState((prev) => ({ ...prev, isLoading: false, error: message }));
      }
    },
    [getService, state.account?.id]
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return { ...state, connect, disconnect, clearError };
}
