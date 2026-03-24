# Contributing to @umituz/web-social-account

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/umituz/web-social-account.git
   cd web-social-account
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development commands**
   ```bash
   npm run typecheck  # Type checking
   npm test          # Run tests
   npm run build     # Build the project
   ```

## Project Structure

```
src/
├── domain/              # Core types and errors
├── domains/
│   ├── core/           # Core domains (OAuth, Account, etc.)
│   ├── twitter/        # Twitter implementation
│   ├── linkedin/       # LinkedIn implementation
│   └── ...             # Other platforms
├── application/        # Application services and hooks
├── infrastructure/     # Storage, HTTP, utilities
└── presentation/       # React components and providers
```

## Adding a New Platform

1. **Create domain structure**
   ```bash
   mkdir -p src/domains/newplatform/{types,services}
   ```

2. **Implement types**
   - Create `src/domains/newplatform/types/newplatform.types.ts`
   - Define platform-specific types

3. **Implement OAuth service**
   - Create `src/domains/newplatform/services/newplatform-oauth.service.ts`
   - Implement `IOAuthService` interface

4. **Implement API service**
   - Create `src/domains/newplatform/services/newplatform-api.service.ts`
   - Implement platform-specific API calls

5. **Update exports**
   - Update `src/domains/newplatform/index.ts`
   - Update `src/index.ts`
   - Update `package.json` exports

6. **Add tests**
   - Create unit tests for OAuth service
   - Create unit tests for API service

7. **Update documentation**
   - Add platform to README
   - Add examples
   - Update CHANGELOG

## Code Style

- Use TypeScript for all code
- Follow DDD principles
- Use strict type checking
- Write descriptive variable names
- Add JSDoc comments for public APIs
- Keep functions small and focused

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage
```

## Commit Guidelines

- Use conventional commit messages
- Prefix commits with type: `feat:`, `fix:`, `docs:`, `refactor:`, etc.
- Add scope when applicable: `feat(twitter): add media upload`
- Write clear, descriptive commit messages

Examples:
```
feat(instagram): add reel upload support
fix(linkedin): handle token expiration correctly
docs: update API examples
refactor(core): extract common OAuth logic
```

## Pull Requests

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Ensure all tests pass
6. Submit a pull request

### PR Checklist

- [ ] Tests pass
- [ ] No TypeScript errors
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] Commit messages follow conventions

## Questions?

Feel free to open an issue for any questions or suggestions!
