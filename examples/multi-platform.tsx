/**
 * Multi-Platform Example
 *
 * This example shows how to manage multiple social media platforms.
 */

import React, { useState } from "react";
import { useSocialAccount } from "@umituz/web-social-account/providers";
import type { SocialPlatform } from "@umituz/web-social-account/types";

const platforms: SocialPlatform[] = [
  "twitter",
  "linkedin",
  "instagram",
  "facebook",
  "threads",
  "tiktok",
  "pinterest",
  "reddit",
  "youtube",
  "discord",
  "telegram",
  "mastodon",
  "medium",
];

function MultiPlatformDashboard() {
  const { accounts, getAccount, removeAccount } = useSocialAccount();
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>("twitter");

  const connectedPlatforms = accounts.map((acc) => acc.platform);
  const availablePlatforms = platforms.filter((p) => !connectedPlatforms.includes(p));

  return (
    <div>
      <h1>Social Media Dashboard</h1>

      <div>
        <h2>Connected Accounts ({accounts.length})</h2>
        {accounts.map((account) => (
          <div key={account.id}>
            <span>{account.platform}</span>
            <span>@{account.profile.username}</span>
            <button onClick={() => removeAccount(account.id)}>Disconnect</button>
          </div>
        ))}
      </div>

      <div>
        <h2>Connect New Account</h2>
        <select
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value as SocialPlatform)}
        >
          {availablePlatforms.map((platform) => (
            <option key={platform} value={platform}>
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </option>
          ))}
        </select>
        <button>Connect {selectedPlatform}</button>
      </div>
    </div>
  );
}

export default MultiPlatformDashboard;
