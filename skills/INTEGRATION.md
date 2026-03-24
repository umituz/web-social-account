# Web Social Account - Paket Entegrasyon Rehberi

Bu rehber, `@umituz/web-social-account` paketinin projenize nasıl entegre edileceğini adım adım açıklar.

## 📋 İçindekiler

1. [Kurulum](#kurulum)
2. [Temel Konfigürasyon](#temel-konfigürasyon)
3. [React Projesine Entegrasyon](#react-projesine-entegrasyon)
4. [Next.js Projesine Entegrasyon](#nextjs-projesine-entegrasyon)
5. [Diğer @umituz Paketleriyle Kullanım](#diğer-umituz-paketleriyle-kullanım)
6. [Production Deployment](#production-deployment)

## 🔧 Kurulum

### 1. Paketi Yükleyin

```bash
npm install @umituz/web-social-account
```

### 2. Environment Variables

`.env` dosyanıza ekleyin:

```env
# Twitter
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
TWITTER_REDIRECT_URI=http://localhost:3000/auth/twitter/callback

# LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/auth/linkedin/callback

# Instagram
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
INSTAGRAM_REDIRECT_URI=http://localhost:3000/auth/instagram/callback

# ... diğer platformlar
```

## ⚙️ Temel Konfigürasyon

### Config Factory Oluşturun

```typescript
// lib/social-config.ts
import { PlatformConfigEntity } from "@umituz/web-social-account/core/config";

export function getSocialConfig(platform: string) {
  const configs: Record<string, any> = {
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      redirectUri: process.env.TWITTER_REDIRECT_URI!,
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      redirectUri: process.env.LINKEDIN_REDIRECT_URI!,
    },
    instagram: {
      clientId: process.env.INSTAGRAM_CLIENT_ID!,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
      redirectUri: process.env.INSTAGRAM_REDIRECT_URI!,
    },
  };

  return PlatformConfigEntity.fromPlatform(platform as any, configs[platform]);
}
```

## 🚀 React Projesine Entegrasyon

### 1. App Provider ile Wrap Edin

```tsx
// App.tsx
import React from "react";
import { SocialAccountProvider } from "@umituz/web-social-account";
import { getSocialConfig } from "./lib/social-config";

const config = getSocialConfig("twitter");

function App() {
  return (
    <SocialAccountProvider config={config}>
      <YourApp />
    </SocialAccountProvider>
  );
}

export default App;
```

### 2. Connect Button Component

```tsx
// components/ConnectSocialButton.tsx
import React from "react";
import { useSocialAuth } from "@umituz/web-social-account";
import type { SocialPlatform } from "@umituz/web-social-account";

interface Props {
  platform: SocialPlatform;
}

export function ConnectSocialButton({ platform }: Props) {
  const { connect, disconnect, isLoading, error, account } = useSocialAuth(config);

  if (account) {
    return (
      <div>
        <span>Connected as @{account.profile.username}</span>
        <button onClick={() => disconnect(account.id)}>Disconnect</button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => connect(platform)}
        disabled={isLoading}
      >
        {isLoading ? "Connecting..." : `Connect ${platform}`}
      </button>
      {error && <span className="error">{error}</span>}
    </div>
  );
}
```

### 3. Post Component

```tsx
// components/CreatePost.tsx
import React, { useState } from "react";
import { TwitterApiService } from "@umituz/web-social-account/twitter";

export function CreatePost({ accessToken }: { accessToken: string }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    setLoading(true);
    const service = new TwitterApiService();

    const result = await service.createTweet(accessToken, {
      text,
      hashtags: extractHashtags(text),
    });

    if (result.success) {
      alert("Tweet posted!");
      setText("");
    } else {
      alert(`Error: ${result.error?.message}`);
    }

    setLoading(false);
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's happening?"
        maxLength={280}
      />
      <button onClick={handlePost} disabled={loading || !text}>
        {loading ? "Posting..." : "Tweet"}
      </button>
    </div>
  );
}

function extractHashtags(text: string): string[] {
  return text.match(/#\w+/g) || [];
}
```

## 🌐 Next.js Projesine Entegrasyon

### 1. API Routes Oluşturun

```typescript
// pages/api/auth/[platform]/authorize.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getSocialConfig } from "@/lib/social-config";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { platform } = req.query;

  if (!platform || typeof platform !== "string") {
    return res.status(400).json({ error: "Invalid platform" });
  }

  const config = getSocialConfig(platform);
  // OAuth flow başlat
  // ...
}
```

### 2. Callback Route

```typescript
// pages/api/auth/[platform]/callback.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { platform } = req.query;
  const { code, state } = req.query;

  // Token exchange
  // User kaydet
  // Redirect to dashboard
}
```

### 3. Server-side Component

```tsx
// app/dashboard/page.tsx
import { getServerSession } from "@/lib/auth";
import { SocialDashboard } from "@/components/SocialDashboard";

export default async function DashboardPage() {
  const session = await getServerSession();

  return <SocialDashboard userId={session.user.id} />;
}
```

## 🔄 Diğer @umituz Paketleriyle Kullanım

### @umituz/web-firebase ile

```tsx
import { autoInitializeFirebase } from "@umituz/web-firebase";
import { SocialAccountProvider } from "@umituz/web-social-account";
import { LocalizationProvider } from "@umituz/web-localization";

// Firebase başlat
await autoInitializeFirebase();

function App() {
  return (
    <LocalizationProvider locale="tr">
      <FirebaseAuthProvider>
        <SocialAccountProvider config={config}>
          <YourApp />
        </SocialAccountProvider>
      </FirebaseAuthProvider>
    </LocalizationProvider>
  );
}
```

### Custom Storage Adapter

```typescript
// lib/firebase-storage.adapter.ts
import type { ISessionStorage } from "@umituz/web-social-account/core/session";
import { firestore } from "@umituz/web-firebase";

export class FirestoreStorageAdapter implements ISessionStorage {
  async setOAuthState(key: string, state: any): Promise<void> {
    await firestore.collection("oauth_states").doc(key).set({
      ...state,
      createdAt: new Date(),
    });
  }

  async getOAuthState(key: string): Promise<any | null> {
    const doc = await firestore.collection("oauth_states").doc(key).get();
    return doc.exists ? doc.data() : null;
  }

  async removeOAuthState(key: string): Promise<void> {
    await firestore.collection("oauth_states").doc(key).delete();
  }

  // ... other methods
}
```

## 🚀 Production Deployment

### 1. Environment Variables

Production environment'inize ekleyin:

```bash
# Vercel/Vercel/Railway/etc.
TWITTER_CLIENT_ID=prod_client_id
TWITTER_CLIENT_SECRET=prod_client_secret
TWITTER_REDIRECT_URI=https://yourdomain.com/auth/twitter/callback
```

### 2. CORS Ayarları

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "https://yourdomain.com" },
        ],
      },
    ];
  },
};
```

### 3. Security

```typescript
// lib/security.ts
export function validateCallbackUrl(url: string) {
  const allowedDomains = [
    "https://yourdomain.com",
    "http://localhost:3000",
  ];

  const urlObj = new URL(url);
  return allowedDomains.some(domain => urlObj.origin === domain);
}
```

## 📚 Örnek Projeler

### 1. Sosyal Medya Dashboard

```tsx
function Dashboard() {
  const { accounts } = useSocialAccount();

  return (
    <div className="grid">
      {accounts.map(account => (
        <AccountCard key={account.id} account={account}>
          <AccountStats account={account} />
          <RecentPosts account={account} />
        </AccountCard>
      ))}
    </div>
  );
}
```

### 2. Multi-Platform Poster

```tsx
function MultiPlatformPoster() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [content, setContent] = useState("");

  const handlePost = async () => {
    const results = await Promise.allSettled(
      selectedPlatforms.map(platform => postToPlatform(platform, content))
    );

    // Sonuçları göster
  };

  return (
    <div>
      <PlatformSelector
        selected={selectedPlatforms}
        onChange={setSelectedPlatforms}
      />
      <textarea onChange={(e) => setContent(e.target.value)} />
      <button onClick={handlePost}>Post to {selectedPlatforms.length} platforms</button>
    </div>
  );
}
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Error**: Redirect URI'yi kontrol edin
2. **Invalid Token**: Token refresh mekanizmasını implement edin
3. **Rate Limit**: Retry logic ekleyin
4. **State Mismatch**: Storage adapter'ı kontrol edin

## 📞 Destek

Sorun yaşarsanız:
1. [GitHub Issues](https://github.com/umituz/web-social-account/issues)
2. [Documentation](https://github.com/umituz/web-social-account#readme)
3. [Examples](https://github.com/umituz/web-social-account/tree/main/examples)

---

**Not**: Bu rehber, `@umituz/web-social-account` paketinin 1.0.0 versiyonu için hazırlanmıştır.
