# TEST_SCENARIOS.md — Manual Test Guide

> **Package:** `@umituz/web-social-account` v1.1.4
> **Scope:** OAuth 2.0 flow + API service layer for 13 social platforms.
> **Audience:** Developer / QA performing manual regression before release.

This document is the single source of truth for **what to test**, **how to
verify success**, and **what counts as a failure** for every public-facing
flow in this package. The automated unit suite covers the `HttpClient`,
storage adapters, and `PlatformConfig` validation; everything below must
be exercised against a real (or mocked) social platform API.

---

## 0. Prerequisites

Before any test, set the following in `.env.local` of your host app:

```bash
TWITTER_CLIENT_ID=…
TWITTER_CLIENT_SECRET=…
TWITTER_REDIRECT_URI=http://localhost:3000/auth/callback

LINKEDIN_CLIENT_ID=…
LINKEDIN_CLIENT_SECRET=…
LINKEDIN_REDIRECT_URI=http://localhost:3000/auth/callback

# (one block per platform you want to test)
```

All `clientId` / `clientSecret` values come from each platform's
developer console (e.g. https://developer.twitter.com). The
`redirectUri` must be **exactly** registered on the platform side —
mismatches cause silent OAuth failures.

---

## 1. Initialization

### 1.1 Build the package

```bash
npm install
npm run typecheck      # must exit 0
npm run build          # emits dist/
```

**Pass criteria:** `typecheck` exits with code 0 and no diagnostic output.
**Fail indicator:** Any `error TS…` line.

### 1.2 Lint the new abstractions

```bash
npx tsc --noEmit src/domains/core/oauth/services/base-oauth.service.ts \
                src/domains/core/api/services/base-api.service.ts \
                src/domains/core/platform/registry/platform-registry.ts
```

**Pass criteria:** No errors. The registry must export
`PlatformRegistry.supportedPlatforms()` returning all 13 platform ids.

### 1.3 Import smoke test

In a host app, verify the top-level barrel resolves:

```ts
import {
  SocialAccountProvider,
  useSocialAuth,
  PlatformRegistry,
  BaseOAuthService,
  BaseApiService,
  BaseStorageAdapter,
  LocalStorageAdapter,
  SessionStorageAdapter,
  HttpClient,
  CryptoUtils,
  ValidationUtils,
  TwitterApiService,
  LinkedInApiService,
  // …one export per platform
} from "@umituz/web-social-account";
```

**Pass criteria:** TypeScript compiles. All named exports resolve.
**Fail indicator:** `Module has no exported member …`.

---

## 2. Configuration & Validation

### 2.1 `PlatformConfigEntity.fromPlatform`

```ts
import { PlatformConfigEntity } from "@umituz/web-social-account";

const config = PlatformConfigEntity.fromPlatform("twitter", {
  clientId: "abc",
  clientSecret: "def",
  redirectUri: "http://localhost:3000/cb",
});
```

**Pass criteria:** `config.validate() === true`.
**Fail scenarios:**
- Missing `clientId` → `ConfigurationError("twitter", "Invalid OAuth configuration for twitter")`.
- Empty `scope` array → same error.
- Invalid `redirectUri` URL → same error.

### 2.2 Invalid configuration

```ts
PlatformConfigEntity.fromPlatform("linkedin", {
  clientId: "",
  clientSecret: "",
  redirectUri: "not-a-url",
});
```

**Pass criteria:** Throws `ConfigurationError` synchronously.
**Fail indicator:** Returns an object without throwing.

---

## 3. OAuth Authorization Flow

The OAuth flow has 4 stages. **All four** must pass for the platform to
be considered working.

### 3.1 Stage 1 — Generate authorization URL

```ts
const oauth = registry.createOAuthService("twitter", config);
const { url, state } = await oauth.generateAuthorizationUrl("twitter", "user-1");
```

**Pass criteria:**
- `url` starts with the platform's authorization endpoint.
- `url.searchParams.get("state") === state`.
- `url.searchParams.get("client_id") === "<your clientId>"`.
- For PKCE platforms (Twitter, Discord, YouTube), `url.searchParams.get("code_challenge")` is present and non-empty.

**Fail indicator:** `OAuthError` thrown, or `state` is missing from the URL.

### 3.2 Stage 2 — User authorizes (manual)

Open `url` in a browser. Sign in to the platform. Click **Authorize**.
The platform redirects to your `redirectUri` with `?code=…&state=…`.

**Pass criteria:** Browser lands on your callback with `code` and `state` query params.
**Fail indicator:** Platform shows "invalid client_id" or "redirect_uri_mismatch".

### 3.3 Stage 3 — Exchange code for token

```ts
const tokens = await oauth.exchangeCodeForToken("twitter", code, state, redirectUri);
```

**Pass criteria:** Returns an object with non-empty `accessToken`.
**Fail scenarios:**
- `OAuthError("OAUTH_ERROR", "Token exchange failed: invalid_grant")` → bad/expired code.
- `OAuthError("OAUTH_ERROR", "Invalid or expired state")` → state mismatch (CSRF detected).
- `NetworkError("NETWORK_ERROR", "Failed to exchange code for token")` → platform unreachable.

### 3.4 Stage 4 — Refresh token

```ts
const refreshed = await oauth.refreshToken("twitter", tokens.refreshToken!);
```

**Pass criteria:** `refreshed.accessToken` differs from the original.
**Fail scenarios:**
- `OAuthError("twitter", "Refresh tokens are not supported by this platform")` → expected for Telegram, Medium.
- `InvalidTokenError` → refresh token revoked or expired.

### 3.5 Per-platform matrix

| Platform    | PKCE | Refresh | Revoke | Special |
|-------------|:----:|:-------:|:------:|---------|
| Twitter     | ✅   | ✅      | ✅     | OAuth 2.0 + PKCE required |
| LinkedIn    | ❌   | ✅      | ✅     | OpenID Connect |
| Instagram   | ❌   | ✅ (long-lived) | ✅ | Long-lived tokens via refresh |
| Facebook    | ❌   | ✅ (60d) | ✅    | Page tokens are separate |
| Threads     | ❌   | ❌      | ✅     | 60-day non-expiring tokens |
| TikTok      | ❌   | ✅      | ✅     | `client_key` instead of `client_id` |
| Pinterest   | ❌   | ✅      | ✅     | HTTP Basic auth for token endpoint |
| Reddit      | ❌   | ✅      | ✅     | HTTP Basic auth + `duration=permanent` |
| YouTube     | ❌   | ✅      | ✅     | `access_type=offline&prompt=consent` |
| Discord     | ❌   | ✅      | ✅     | Bot token for guild ops |
| Telegram    | ❌   | ❌      | ❌     | Login Widget, no token exchange |
| Mastodon    | ❌   | ✅      | ✅     | **Per-instance** endpoints |
| Medium      | ❌   | ❌      | ❌     | No refresh, no revoke |

**Test:** for each platform you have credentials for, complete the
3.1→3.3 cycle and confirm `accessToken` is non-empty.

---

## 4. State Validation (CSRF Protection)

### 4.1 Valid state

When a `SessionStorage` (or `LocalStorage`) is passed to the registry:

```ts
const registry = new PlatformRegistry({ storage: new SessionStorageAdapter() });
const oauth = registry.createOAuthService("twitter", config);
const { url, state } = await oauth.generateAuthorizationUrl("twitter", "u1");
// state is now persisted in sessionStorage with key "oauth_state_<state>"
```

After the redirect, `oauth.exchangeCodeForToken(...)` calls
`oauth.validateState(state)` which reads from storage.

**Pass criteria:** Token exchange succeeds.
**Fail indicator:** Throws `OAuthError("Invalid or expired state")`.

### 4.2 Replayed state

```ts
await oauth.exchangeCodeForToken("twitter", code, state, redirectUri); // success
await oauth.exchangeCodeForToken("twitter", code, state, redirectUri); // replay
```

**Pass criteria:** Second call throws `OAuthError("Invalid or expired state")`.
**Fail indicator:** Second call succeeds (CSRF vulnerability — block release).

### 4.3 Expired state

Wait 11 minutes after `generateAuthorizationUrl` (default TTL = 600s),
then call `exchangeCodeForToken`.

**Pass criteria:** Throws `OAuthError("Invalid or expired state")`.
**Fail indicator:** Still accepts the state.

---

## 5. API Service Layer

### 5.1 Get user profile

```ts
const api = new TwitterApiService();
const result = await api.getUserProfile(tokens.accessToken);
```

**Pass criteria:** `result.success === true` and `result.data.id` is a non-empty string.
**Fail scenarios:**
- 401 response → `result.error.code === "401"`, message contains "Unauthorized" or platform-specific error.
- Network failure → `result.error.code === "NETWORK_ERROR"`.
- No `noCache: true` → result may be stale for up to 5 minutes (cache TTL).

### 5.2 Create post (text only)

```ts
const api = new LinkedInApiService();
const result = await api.createPost(tokens.accessToken, linkedInUserId, {
  text: "Hello from automated test",
});
```

**Pass criteria:** `result.success === true` and `result.data.id` is non-empty.
**Fail scenarios:**
- 403 → `result.error.code === "403"`.
- Missing scope → `result.error.message` mentions the missing scope.

### 5.3 Create post (with media)

For each platform that supports media (`image` / `video`):

```ts
const result = await api.createTweet(tokens.accessToken, {
  text: "Test",
  media: [{ type: "image", url: "https://example.com/img.jpg" }],
});
```

**Pass criteria:** Post created with media attached.
**Fail scenarios:**
- Instagram: `result.error.code === "NO_MEDIA"` if media omitted (platform rule).
- Pinterest: same `NO_MEDIA` if media omitted.

### 5.4 Pagination

```ts
const result = await api.getUserTweets(tokens.accessToken, 100);
```

**Pass criteria:** Returns at most 100 tweets.
**Fail scenarios:** `maxResults` ignored → check network panel to verify
the request was `?max_results=100`.

### 5.5 Per-platform API checklist

| Platform    | Get profile | Create post | Get feed | Media upload |
|-------------|:-----------:|:-----------:|:--------:|:------------:|
| Twitter     | ✅          | ✅          | ✅       | ✅ (up to 4) |
| LinkedIn    | ✅          | ✅          | ✅       | ⚠️ (image only) |
| Instagram   | ✅          | ✅ (container + publish) | ✅ | ✅ (image required) |
| Facebook    | ✅          | ✅ (page)   | ✅ (page) | ✅ (image only) |
| Threads     | ✅          | ✅ (text + image) | ✅ | ✅ |
| TikTok      | ✅          | ✅ (video)  | ✅       | ✅ (video required) |
| Pinterest   | ✅          | ✅ (pin)    | ✅       | ✅ (image required) |
| Reddit      | ✅          | ✅          | ✅       | ✅ (image / link) |
| YouTube     | ✅ (channel) | ✅ (video) | ✅ (search) | ✅ (video required) |
| Discord     | ✅          | ✅ (bot)    | ✅       | ✅ (embed) |
| Telegram    | ✅ (bot)    | ✅          | ✅ (updates) | ✅ (photo) |
| Mastodon    | ✅          | ✅          | ✅       | ✅ |
| Medium      | ✅          | ✅ (post)   | ✅       | ⚠️ (HTML embed) |

---

## 6. Storage Adapters

### 6.1 Round-trip with SessionStorage

```ts
const storage = new SessionStorageAdapter();
await storage.setOAuthState("key-1", { state: "abc", platform: "twitter", timestamp: Date.now() });
const read = await storage.getOAuthState("key-1");
```

**Pass criteria:** `read.state === "abc"`.
**Fail indicator:** `read === null`.

### 6.2 Round-trip with LocalStorage

Same as 6.1 but `new LocalStorageAdapter()`. Persists across browser
restarts; SessionStorage does not.

### 6.3 clearExpired

```ts
await storage.setOAuthState("old", { state: "x", platform: "twitter", timestamp: Date.now() - 700_000 });
await storage.clearExpired(600_000);
const result = await storage.getOAuthState("old");
```

**Pass criteria:** `result === null` (expired entry removed).
**Fail indicator:** `result` still present.

### 6.4 Corruption resilience

```ts
localStorage.setItem("oauth_state_corrupt", "{not valid json");
// any getOAuthState should not throw
const result = await storage.getOAuthState("corrupt");
```

**Pass criteria:** Returns `null`. Corrupted entry is removed from storage.
**Fail indicator:** Throws `SyntaxError`.

### 6.5 SSR safety

Instantiate adapters **before** `window` exists:

```ts
// server.ts — no window defined
const adapter = new LocalStorageAdapter();
```

**Pass criteria:** Construction does not throw.
**Fail indicator:** `ReferenceError: window is not defined`.

---

## 7. React Hook (`useSocialAuth`)

### 7.1 Connect happy path

```tsx
const { connect, isLoading, error } = useSocialAuth(config, "user-1");

<button onClick={() => connect("twitter")} disabled={isLoading}>
  Connect Twitter
</button>
{error && <p role="alert">{error}</p>}
```

**Pass criteria:** Clicking redirects to Twitter's auth page.
**Fail scenarios:**
- `ConfigurationError` → button should show error and not redirect.
- `OAuthError` → same.

### 7.2 Custom authorization handler

```tsx
useSocialAuth(config, "u1", {
  onAuthorizeUrl: (platform, url, state) => {
    // open in popup instead of redirect
    window.open(url, "_blank", "width=600,height=700");
  },
});
```

**Pass criteria:** `window.location.href` is **not** changed; popup opens instead.
**Fail indicator:** Full-page redirect happens.

### 7.3 Disconnect

```tsx
const { disconnect } = useSocialAuth(config, "u1");
const account: SocialAccount = /* …fetched from your backend */;

<button onClick={() => disconnect(account)}>Disconnect</button>
```

**Pass criteria:**
- `service.revokeToken` is called with the account's `tokens.token`.
- `onDisconnected(account.id)` callback fires.
- `isLoading` toggles `true → false`.

**Fail scenarios:**
- `revokeToken` throws → `error` state is set, `isLoading` returns to `false`.

### 7.4 Multiple instances (no leakage)

Mount two `useSocialAuth` hooks with **different** registries.

**Pass criteria:** Each hook uses its own `HttpClient` instance; revoking
in one does not affect the other.
**Fail indicator:** Shared mutable state observed across hooks.

---

## 8. Error Handling Matrix

| Trigger | Expected behavior |
|---------|-------------------|
| `clientId` empty | `ConfigurationError` at construction |
| `scope` empty | `ConfigurationError` at construction |
| `redirectUri` not a URL | `ConfigurationError` at construction |
| Network down | `NetworkError` from OAuth calls; `error.code === "NETWORK_ERROR"` from API calls |
| 401 from platform | API: `error.code === "401"`. OAuth: depends on platform (e.g. `InvalidTokenError` for refresh) |
| 403 from platform | API: `error.code === "403"` |
| 429 from platform | API: `error.code === "429"`. `HttpClient` retries with exponential backoff (max 3 attempts). |
| 5xx from platform | `HttpClient` retries up to 3 times. Final failure → throws `Error("HTTP <status>: <text>")` |
| State TTL expired | `OAuthError("Invalid or expired state")` |
| State not in storage | `OAuthError("Invalid or expired state")` |
| Telegram without bot username | `ConfigurationError` |

**Fail indicator:** Any silent fallback, swallowed error, or default
empty array returned on failure.

---

## 9. `HttpClient` Behavior

### 9.1 Caching

```ts
const http = new HttpClient();
await http.get("https://api.example.com/v1/data", { enableCache: true });
await http.get("https://api.example.com/v1/data", { enableCache: true });
```

**Pass criteria:** Second call returns the cached `Response` without a
network round-trip (verify in browser DevTools → Network tab).
**Fail indicator:** Two distinct requests appear in the network log.

### 9.2 Cache TTL

```ts
const http = new HttpClient();
await http.get("https://api.example.com/v1/data", { enableCache: true, cacheTTL: 100 });
await new Promise((r) => setTimeout(r, 200));
await http.get("https://api.example.com/v1/data", { enableCache: true });
```

**Pass criteria:** Second call issues a fresh network request.
**Fail indicator:** Cached value returned after TTL.

### 9.3 Request deduplication

Fire two identical requests **simultaneously** (no awaiting the first):

```ts
const [a, b] = await Promise.all([
  http.get("https://api.example.com/v1/slow"),
  http.get("https://api.example.com/v1/slow"),
]);
```

**Pass criteria:** Network tab shows **one** request.
**Fail indicator:** Two identical requests.

### 9.4 Timeout

```ts
await http.fetch("https://api.example.com/v1/slow", { timeout: 100 });
```

**Pass criteria:** Throws `Error("Request timeout after 100ms")` within
~100ms of the fetch.
**Fail indicator:** Hangs indefinitely.

### 9.5 Retry on 5xx

Mock the server to return 500 twice, then 200.

**Pass criteria:** `HttpClient` returns the 200 response after retries.
**Fail indicator:** Returns 500 immediately or never retries.

### 9.6 No retry on 4xx

Mock server returns 400.

**Pass criteria:** Returns 400 on first attempt (no retries).
**Fail indicator:** Retries 3 times.

### 9.7 Cleanup

```ts
const http = new HttpClient();
http.destroy();
```

**Pass criteria:** `http.cache.size === 0`, `http.pendingRequests.size === 0`.
**Fail indicator:** Memory not released.

---

## 10. Crypto Utilities

### 10.1 Random string

```ts
const a = CryptoUtils.generateRandomString(43);
const b = CryptoUtils.generateRandomString(43);
```

**Pass criteria:** `a !== b`, both length 43.
**Fail indicator:** Identical outputs (RNG broken).

### 10.2 Code challenge determinism

```ts
const challenge1 = await CryptoUtils.generateCodeChallenge("verifier-1");
const challenge2 = await CryptoUtils.generateCodeChallenge("verifier-1");
```

**Pass criteria:** `challenge1 === challenge2`.
**Fail indicator:** Different hashes for the same verifier.

### 10.3 Base64 URL safety

```ts
const encoded = CryptoUtils.base64UrlEncode("hello+world/foo=");
```

**Pass criteria:** Result contains only `[A-Za-z0-9_-]` characters.
**Fail indicator:** `+`, `/`, or `=` present (not URL-safe).

---

## 11. Validation Utilities

### 11.1 URL validation

```ts
ValidationUtils.isValidUrl("https://example.com") // true
ValidationUtils.isValidUrl("not a url")           // false
ValidationUtils.isValidUrl("")                    // false
```

### 11.2 Email validation

```ts
ValidationUtils.isValidEmail("a@b.co")     // true
ValidationUtils.isValidEmail("@b.co")      // false
ValidationUtils.isValidEmail("a@b")        // false
```

### 11.3 Platform config validation

```ts
ValidationUtils.validatePlatformConfig({
  clientId: "id", clientSecret: "sec", redirectUri: "https://x.com/cb",
}); // true
ValidationUtils.validatePlatformConfig({
  clientId: "id", clientSecret: "sec", redirectUri: "notaurl",
}); // false
```

---

## 12. Performance & Memory

### 12.1 Cache eviction (LRU)

```ts
const http = new HttpClient();
// issue 200 distinct GET requests with enableCache
// after request 100, expect cache to evict oldest 20%
```

**Pass criteria:** `http.cache.size <= 100` at all times.
**Fail indicator:** Cache grows unbounded.

### 12.2 Concurrent request cleanup

Fire 50 concurrent requests, wait for all to resolve, then call `http.destroy()`.

**Pass criteria:** `pendingRequests.size === 0` after all requests complete.
**Fail indicator:** Stale pending entries remain.

### 12.3 Adapter cache eviction

```ts
const adapter = new LocalStorageAdapter();
for (let i = 0; i < 100; i++) {
  await adapter.setOAuthState(`k-${i}`, { state: `s-${i}`, platform: "twitter", timestamp: Date.now() });
}
```

**Pass criteria:** `adapter.getCacheStats().stateCacheSize <= 50` (MAX_CACHE_SIZE).
**Fail indicator:** Cache exceeds max size.

---

## 13. End-to-End Smoke (per platform)

For every platform, perform this minimum viable flow:

1. Build `PlatformConfigEntity.fromPlatform(...)`.
2. Construct OAuth service via `registry.createOAuthService(...)`.
3. Call `generateAuthorizationUrl` — verify URL.
4. (Manual) Open URL, authorize, capture `code` and `state`.
5. Call `exchangeCodeForToken` — verify `accessToken` returned.
6. Construct API service.
7. Call `getUserProfile` — verify user object returned.
8. Call `revokeToken` — verify no error.

**Pass criteria for a release:** All 8 steps succeed for every platform
the host app intends to support.

---

## 14. Regression Checklist (Pre-Release)

- [ ] `npm run typecheck` exits 0
- [ ] `npm run build` succeeds
- [ ] `npm test` runs (storage tests are known-failing under `node` env; use `jsdom` if available)
- [ ] No `TODO` / `FIXME` / `HACK` in `src/`
- [ ] No `*_PLACEHOLDER` exports in `src/`
- [ ] No empty directories in `src/`
- [ ] No `as any` casts
- [ ] No force-unwraps (`!.`) in production code
- [ ] `package.json` has zero unused dependencies
- [ ] `CHANGELOG.md` updated for version bump
- [ ] Public exports listed in `README.md` still match `src/index.ts`

---

## 15. Failure Reporting Template

When a test fails, capture:

```
Platform:        <twitter | linkedin | …>
Test:            <e.g. 5.1 Get user profile>
Input:           <redacted code snippet>
Expected:        <pass criteria from this doc>
Actual:          <error message, stack trace, or wrong value>
Network:         <DevTools screenshot or HAR excerpt>
Console:         <any warnings/errors>
```

Attach to your bug report. **Do not** mask errors with try/catch + default
values — the package guarantees errors are surfaced.
