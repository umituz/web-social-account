/**
 * Basic Usage Example
 *
 * This example demonstrates how to use @umituz/web-social-account
 * in a React application.
 */

import React from "react";
import { SocialAccountProvider, useSocialAuth } from "@umituz/web-social-account";
import { PlatformConfigEntity } from "@umituz/web-social-account/core/config";

// Configure platform
const twitterConfig = PlatformConfigEntity.fromPlatform("twitter", {
  clientId: process.env.TWITTER_CLIENT_ID!,
  clientSecret: process.env.TWITTER_CLIENT_SECRET!,
  redirectUri: "http://localhost:3000/auth/callback",
});

function App() {
  return (
    <SocialAccountProvider config={twitterConfig}>
      <ConnectTwitterButton />
    </SocialAccountProvider>
  );
}

function ConnectTwitterButton() {
  const { connect, disconnect, isLoading, error, account } = useSocialAuth(twitterConfig);

  if (account) {
    return (
      <div>
        <p>Connected as @{account.profile.username}</p>
        <button onClick={() => disconnect(account.id)}>Disconnect</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => connect("twitter")} disabled={isLoading}>
        {isLoading ? "Connecting..." : "Connect Twitter"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default App;
