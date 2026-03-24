# @umituz/web-social-account

Comprehensive social media account management package with domain-based architecture for web applications.

## Features

- **Multi-Platform Support**: Twitter, LinkedIn, Instagram, Facebook, Threads, TikTok, Pinterest, Reddit, YouTube, Discord, Telegram, Mastodon, Medium
- **OAuth 2.0 Authentication**: Complete OAuth flow implementation with PKCE support
- **DDD Architecture**: Domain-Driven Design with clear separation of concerns
- **TypeScript**: Full type safety and excellent developer experience
- **React Hooks**: Easy integration with React applications
- **Config-Based**: Fully configurable for different applications
- **Sub-Exports**: Import only what you need

## Installation

```bash
npm install @umituz/web-social-account
```

## Quick Start

```typescript
import { SocialAccountProvider, useSocialAuth } from "@umituz/web-social-account";
import { PlatformConfigEntity } from "@umituz/web-social-account/config";

// Setup config
const config = PlatformConfigEntity.fromPlatform("twitter", {
  clientId: process.env.TWITTER_CLIENT_ID!,
  clientSecret: process.env.TWITTER_CLIENT_SECRET!,
  redirectUri: "http://localhost:3000/auth/callback",
});

// Wrap your app with provider
function App() {
  return (
    <SocialAccountProvider config={config}>
      <YourComponent />
    </SocialAccountProvider>
  );
}

// Use in components
function YourComponent() {
  const { connect, disconnect, isLoading, error } = useSocialAuth(config);

  return (
    <button onClick={() => connect("twitter")} disabled={isLoading}>
      Connect Twitter
    </button>
  );
}
```

## Architecture

### Domain Structure

```
src/
├── domain/
│   ├── types/          # Core type definitions
│   └── errors/         # Custom error classes
├── domains/
│   ├── core/           # Core domains (OAuth, Account, Session, Config)
│   ├── twitter/        # Twitter-specific implementation
│   ├── linkedin/       # LinkedIn-specific implementation
│   ├── instagram/      # Instagram-specific implementation
│   └── ...             # Other platforms
├── application/
│   ├── hooks/          # React hooks
│   └── services/       # Application services
└── presentation/
    ├── providers/      # React context providers
    └── components/     # UI components
```

### DDD Layers

1. **Domain Layer**: Core business logic, entities, and interfaces
2. **Application Layer**: Use cases and application services
3. **Infrastructure Layer**: External service integrations
4. **Presentation Layer**: UI components and providers

## Platform Support

| Platform | Status | OAuth | API | Special Features |
|----------|--------|-------|-----|------------------|
| Twitter | ✅ Implemented | ✅ | ✅ | PKCE, Media Upload |
| LinkedIn | ✅ Implemented | ✅ | ✅ | UGC Posts |
| Instagram | ✅ Implemented | ✅ | ✅ | Container-based Publishing |
| Facebook | ✅ Implemented | ✅ | ✅ | Page Management |
| Threads | ✅ Implemented | ✅ | ✅ | Text/Media Containers |
| TikTok | ✅ Implemented | ✅ | ✅ | Video Upload |
| Pinterest | ✅ Implemented | ✅ | ✅ | Pin Creation |
| Reddit | ✅ Implemented | ✅ | ✅ | Subreddit Posting |
| YouTube | ✅ Implemented | ✅ | ✅ | Video Upload, Resumable |
| Discord | ✅ Implemented | ✅ | ✅ | Bot-based |
| Telegram | ✅ Implemented | ✅ | ✅ | Bot-based, Login Widget |
| Mastodon | ✅ Implemented | ✅ | ✅ | Multi-instance, Fediverse |
| Medium | ✅ Implemented | ✅ | ✅ | Article Publishing |

## API Reference

### Core Types

```typescript
import type {
  SocialPlatform,
  PlatformConfig,
  SocialAccount,
  OAuthTokens,
  SocialPostContent,
} from "@umituz/web-social-account/types";
```

### OAuth Services

```typescript
import { TwitterOAuthService } from "@umituz/web-social-account/twitter";

const oauthService = new TwitterOAuthService(config);
const { url, state } = await oauthService.generateAuthorizationUrl("twitter", userId);
```

### React Hooks

```typescript
import { useSocialAuth } from "@umituz/web-social-account/hooks";

const { connect, disconnect, isLoading, error, account } = useSocialAuth(config);
```

### Providers

```typescript
import { SocialAccountProvider, useSocialAccount } from "@umituz/web-social-account/providers";

const { accounts, getAccount, addAccount, removeAccount } = useSocialAccount();
```

## Configuration

### Platform Config (Easy Way)

```typescript
import { PlatformConfigEntity } from "@umituz/web-social-account/core/config";

const config = PlatformConfigEntity.fromPlatform("twitter", {
  clientId: process.env.TWITTER_CLIENT_ID!,
  clientSecret: process.env.TWITTER_CLIENT_SECRET!,
  redirectUri: "https://your-app.com/auth/callback",
  // Optional: Customize scopes
  scope: ["tweet.read", "tweet.write", "users.read"],
});
```

### Platform Config (Manual)

```typescript
const config: PlatformConfig = {
  oAuth: {
    clientId: "your-client-id",
    clientSecret: "your-client-secret",
    redirectUri: "https://your-app.com/auth/callback",
    scope: ["tweet.read", "tweet.write"],
    responseType: "code",
    pkce: true,
    codeChallengeMethod: "S256",
    authorizationUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
  },
  apiTimeout: 30000,
  maxRetries: 3,
};
```

### Environment Variables

```bash
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
# ... other platforms
```

## Usage Examples

### Connect Account

```typescript
const handleConnect = async () => {
  try {
    await connect("twitter");
  } catch (error) {
    console.error("Failed to connect:", error);
  }
};
```

### Post Content

```typescript
const content: SocialPostContent = {
  text: "Hello, world!",
  media: [
    {
      type: "image",
      url: "https://example.com/image.jpg",
      altText: "An image",
    },
  ],
  hashtags: ["#hello", "#world"],
};
```

### Get Account Analytics

```typescript
const analytics = await accountService.getAccountAnalytics(
  accountId,
  new Date("2024-01-01"),
  new Date("2024-01-31")
);
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Project Status

- ✅ **118 files** created
- ✅ **13 platforms** fully implemented
- ✅ **DDD architecture** complete
- ✅ **Infrastructure layer** with storage, HTTP, utilities
- ✅ **Test suite** with unit tests
- ✅ **CI/CD** with GitHub Actions
- ✅ **Documentation** with examples
- ✅ **TypeScript** with full type safety

## License

MIT - see [LICENSE](./LICENSE) file for details.

## Author

UmitUZ

## Support

For issues and questions, please use the GitHub issues page.
