/**
 * Social Account Context Provider
 */

import React, { createContext, useContext, ReactNode } from "react";
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

  const getAccount = (platform: SocialPlatform): SocialAccount | null => {
    return accounts.find((acc) => acc.platform === platform) ?? null;
  };

  const addAccount = (account: SocialAccount) => {
    setAccounts((prev) => [...prev, account]);
  };

  const removeAccount = (accountId: string) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
  };

  const updateAccount = (accountId: string, updates: Partial<SocialAccount>) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId ? { ...acc, ...updates } : acc
      )
    );
  };

  const value: SocialAccountContextValue = {
    config,
    accounts,
    getAccount,
    addAccount,
    removeAccount,
    updateAccount,
  };

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
