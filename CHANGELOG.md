# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-24

### Added
- Initial release of @umituz/web-social-account
- OAuth 2.0 authentication for 13 platforms
- Platform-specific API services
- DDD architecture with domain separation
- React hooks for easy integration
- Storage adapters (localStorage, sessionStorage)
- HTTP client with retry logic
- Cryptographic utilities for PKCE
- Validation utilities
- TypeScript support with full type safety
- Sub-export system for modular imports

### Supported Platforms
- Twitter (OAuth 2.0 + PKCE)
- LinkedIn (OAuth 2.0)
- Instagram (OAuth 2.0)
- Facebook (OAuth 2.0)
- Threads (OAuth 2.0)
- TikTok (OAuth 2.0)
- Pinterest (OAuth 2.0)
- Reddit (OAuth 2.0)
- YouTube (OAuth 2.0)
- Discord (OAuth 2.0 + Bot)
- Telegram (Bot + Login Widget)
- Mastodon (OAuth 2.0 + Multi-instance)
- Medium (OAuth 2.0)

### Infrastructure
- LocalStorage adapter for OAuth state
- SessionStorage adapter for temporary data
- HTTP client with timeout and retry logic
- PKCE code generation utilities
- Input validation utilities

### Developer Experience
- Comprehensive TypeScript types
- React hooks for auth management
- Context providers for app-wide state
- Modular exports for tree-shaking
- Clear error handling with custom error classes

### Documentation
- Complete README with examples
- Platform-specific API documentation
- Configuration examples
- Usage examples for each platform
