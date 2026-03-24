# @umituz/web-social-account Skill

Web uygulamaları için kapsamlı sosyal medya hesap yönetimi skill'i.

## 🎯 Ne Yapıyor?

Bu skill, web uygulamalarına 13 farklı sosyal medya platformunu entegre etmenizi sağlar:

- **Twitter/X** - Tweet atma, media upload
- **LinkedIn** - Post paylaşımı, UGC content
- **Instagram** - Container-based publishing
- **Facebook** - Page management, post creation
- **Threads** - Text/media posting
- **TikTok** - Video upload
- **Pinterest** - Pin creation
- **Reddit** - Subreddit posting
- **YouTube** - Video upload (resumable)
- **Discord** - Bot-based messaging
- **Telegram** - Bot-based + Login Widget
- **Mastodon** - Multi-instance support
- **Medium** - Article publishing

## 🚀 Kurulum

```bash
# Paketi yükle
npm install @umituz/web-social-account

# veya diğer @umituz paketleriyle birlikte
npm install @umituz/web-social-account @umituz/web-firebase @umituz/web-localization
```

## 💡 Temel Kullanım

### 1. Config Kurulumu

```typescript
import { PlatformConfigEntity } from "@umituz/web-social-account/core/config";

// Otomatik config (kolay yol)
const config = PlatformConfigEntity.fromPlatform("twitter", {
  clientId: process.env.TWITTER_CLIENT_ID!,
  clientSecret: process.env.TWITTER_CLIENT_SECRET!,
  redirectUri: "http://localhost:3000/auth/callback",
});
```

### 2. React ile Kullanım

```typescript
import { SocialAccountProvider, useSocialAuth } from "@umituz/web-social-account";

function App() {
  return (
    <SocialAccountProvider config={config}>
      <YourComponent />
    </SocialAccountProvider>
  );
}

function YourComponent() {
  const { connect, disconnect, isLoading, error, account } = useSocialAuth(config);

  return (
    <button onClick={() => connect("twitter")} disabled={isLoading}>
      {account ? `@${account.profile.username}` : "Connect Twitter"}
    </button>
  );
}
```

### 3. Direct API Kullanım

```typescript
import { TwitterApiService } from "@umituz/web-social-account/twitter";

const twitterService = new TwitterApiService();

const result = await twitterService.createTweet(accessToken, {
  text: "Hello World!",
  hashtags: ["#typescript", "#socialmedia"],
  media: [{
    type: "image",
    url: "https://example.com/image.jpg",
    altText: "An image",
  }],
});
```

## 🏗️ Mimari

### DDD (Domain-Driven Design)

```
├── domain/              # Core types & errors
├── domains/
│   ├── core/           # OAuth, Account, Session, Config
│   ├── twitter/        # Twitter implementation
│   ├── linkedin/       # LinkedIn implementation
│   └── ...             # 11 more platforms
├── application/        # React hooks, services
├── infrastructure/     # Storage, HTTP, utilities
└── presentation/       # React providers, components
```

### Sub-Export System

```typescript
// Ana import
import { SocialAccountProvider } from "@umituz/web-social-account";

// Platform-specific
import { TwitterApiService } from "@umituz/web-social-account/twitter";
import { LinkedInApiService } from "@umituz/web-social-account/linkedin";

// Hooks
import { useSocialAuth } from "@umituz/web-social-account/hooks";

// Storage
import { LocalStorageAdapter } from "@umituz/web-social-account/infrastructure";
```

## 🔑 Environment Variables

```bash
# .env
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
# ... diğer platformlar
```

## 📦 Diğer @umituz Paketleriyle Entegrasyon

### @umituz/web-firebase ile

```typescript
import { autoInitializeFirebase } from "@umituz/web-firebase";
import { SocialAccountProvider } from "@umituz/web-social-account";

// Firebase'i başlat
await autoInitializeFirebase();

function App() {
  return (
    <SocialAccountProvider config={config}>
      {/* Social account + Firebase auth */}
    </SocialAccountProvider>
  );
}
```

### @umituz/web-localization ile

```typescript
import { LocalizationProvider } from "@umituz/web-localization";
import { SocialAccountProvider } from "@umituz/web-social-account";

function App() {
  return (
    <LocalizationProvider locale="tr">
      <SocialAccountProvider config={config}>
        {/* Localized social media interface */}
      </SocialAccountProvider>
    </LocalizationProvider>
  );
}
```

### @umituz/web-design-system ile

```typescript
import { DesignSystemProvider } from "@umituz/web-design-system";
import { useSocialAuth } from "@umituz/web-social-account";

function SocialMediaButton() {
  const { connect, isLoading } = useSocialAuth(config);

  return (
    <Button onClick={() => connect("twitter")} loading={isLoading}>
      Connect Twitter
    </Button>
  );
}
```

## 🎯 Use Case'ler

### 1. Sosyal Medya Dashboard

```typescript
function SocialDashboard() {
  const { accounts, getAccount } = useSocialAccount();

  return (
    <div>
      <h2>Connected Accounts ({accounts.length})</h2>
      {accounts.map(account => (
        <AccountCard key={account.id} account={account} />
      ))}
    </div>
  );
}
```

### 2. Toplu Post Atma

```typescript
async function postToMultiplePlatforms(content: SocialPostContent) {
  const platforms = ["twitter", "linkedin", "facebook"];

  const results = await Promise.allSettled(
    platforms.map(platform => postToPlatform(platform, content))
  );

  return results;
}
```

### 3. Planlı Content

```typescript
async function schedulePost(platform: SocialPlatform, content: SocialPostContent, date: Date) {
  // Store in database
  await db.scheduledPosts.create({
    platform,
    content,
    scheduledFor: date,
  });

  // Cron job ile publish et
}
```

## 🔧 Advanced Features

### Custom Storage

```typescript
import type { ISessionStorage } from "@umituz/web-social-account/core/session";

class RedisStorageAdapter implements ISessionStorage {
  async setOAuthState(key: string, state: any): Promise<void> {
    await redis.set(`oauth:${key}`, JSON.stringify(state), "EX", 600);
  }
  // ... other methods
}
```

### Error Handling

```typescript
import {
  OAuthError,
  TokenRefreshError,
  RateLimitError,
  InvalidTokenError,
} from "@umituz/web-social-account/errors";

try {
  await connect("twitter");
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(`Retry after ${error.retryAfter} seconds`);
  } else if (error instanceof OAuthError) {
    console.error("OAuth failed:", error.message);
  }
}
```

### Token Refresh

```typescript
import { TwitterOAuthService } from "@umituz/web-social-account/twitter";

const oauthService = new TwitterOAuthService(config);

// Token expire olunca
if (account.isTokenExpiringSoon()) {
  const newTokens = await oauthService.refreshToken("twitter", account.tokens.refreshToken!);
  account.updateTokens(newTokens);
}
```

## 📚 Dokümantasyon

- **README.md** - Complete documentation
- **examples/** - Usage examples
- **CONTRIBUTING.md** - Contributing guidelines
- **CHANGELOG.md** - Version history

## 🧪 Testing

```bash
npm install
npm test              # Run tests
npm run typecheck     # Type check
npm run build         # Build
```

## 🌟 Best Practices

1. **Config Management**: Environment variables kullan
2. **Error Handling**: Her platform için spesifik error handling
3. **Token Storage**: Secure storage kullan (localStorage/cookie)
4. **Rate Limiting**: Platform rate limitlerini respect et
5. **User Experience**: Loading states ve error messages göster

## 🤝 Desteklenen Platformlar

| Platform | OAuth | API | Special Features |
|----------|-------|-----|------------------|
| Twitter | ✅ | ✅ | PKCE, Media Upload |
| LinkedIn | ✅ | ✅ | UGC Posts |
| Instagram | ✅ | ✅ | Container-based |
| Facebook | ✅ | ✅ | Page Management |
| Threads | ✅ | ✅ | Text/Media Containers |
| TikTok | ✅ | ✅ | Video Upload |
| Pinterest | ✅ | ✅ | Pin Creation |
| Reddit | ✅ | ✅ | Subreddit Posting |
| YouTube | ✅ | ✅ | Resumable Upload |
| Discord | ✅ | ✅ | Bot-based |
| Telegram | ✅ | ✅ | Bot + Login Widget |
| Mastodon | ✅ | ✅ | Multi-instance |
| Medium | ✅ | ✅ | Article Publishing |

## 🎓 Resources

- [Twitter API Docs](https://developer.twitter.com/en/docs/twitter-api)
- [LinkedIn API Docs](https://learn.microsoft.com/en-us/linkedin/)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram)
- [Reddit API Docs](https://www.reddit.com/dev/api/)
- [YouTube API Docs](https://developers.google.com/youtube/v3)

---

**Created by UmitUZ App Factory**
**Version: 1.0.0**
