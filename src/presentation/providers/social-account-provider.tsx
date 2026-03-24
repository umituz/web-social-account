/**
 * Social Account Context Provider
 * Performance optimized with React.memo, useCallback, and useMemo
 */

import React, { createContext, useContext, ReactNode, useMemo, useCallback, useRef } from "react";
import type {
  SocialPlatform,
  PlatformConfig,
  SocialAccount,
} from "../../domain/types";

interface SocialAccountContextValue {
  config: PlatformConfig;
  accounts: SocialAccount[];
  getAccount: (platform: SocialPlatform) => SocialAccount | null;
  addAccount: (account: SocialAccount) => void;
  removeAccount: (accountId: string) => void;
  updateAccount: (accountId: string, updates: Partial<SocialAccount>) => void;
}

const SocialAccountContext = createContext<SocialAccountContextValue | undefined>(
  undefined
);

interface SocialAccountProviderProps {
  children: ReactNode;
  config: PlatformConfig;
  initialAccounts?: SocialAccount[];
}

export function SocialAccountProvider({
  children,
  config,
  initialAccounts = [],
}: SocialAccountProviderProps) {
  const [accounts, setAccounts] = React.useState<SocialAccount[]>(initialAccounts);

  // Use ref to track accounts without triggering re-renders for getAccount
  const accountsRef = useRef(accounts);
  React.useEffect(() => {
    accountsRef.current = accounts;
  }, [accounts]);

  // Memoize config to prevent unnecessary re-renders
  const memoizedConfig = useMemo(() => config, [config]);

  // Optimized getAccount using ref to avoid subscription to accounts state
  const getAccount = useCallback((platform: SocialPlatform): SocialAccount | null => {
    return accountsRef.current.find((acc) => acc.platform === platform) ?? null;
  }, []);

  // Memoized callbacks to prevent child re-renders
  const addAccount = useCallback((account: SocialAccount) => {
    setAccounts((prev) => [...prev, account]);
  }, []);

  const removeAccount = useCallback((accountId: string) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
  }, []);

  const updateAccount = useCallback((accountId: string, updates: Partial<SocialAccount>) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId ? { ...acc, ...updates } : acc
      )
    );
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value: SocialAccountContextValue = useMemo(
    () => ({
      config: memoizedConfig,
      accounts,
      getAccount,
      addAccount,
      removeAccount,
      updateAccount,
    }),
    [memoizedConfig, accounts, getAccount, addAccount, removeAccount, updateAccount]
  );

  return (
    <SocialAccountContext.Provider value={value}>
      {children}
    </SocialAccountContext.Provider>
  );
}

export function useSocialAccount(): SocialAccountContextValue {
  const context = useContext(SocialAccountContext);
  if (!context) {
    throw new Error("useSocialAccount must be used within SocialAccountProvider");
  }
  return context;
}
