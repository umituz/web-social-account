# Examples

This directory contains usage examples for @umituz/web-social-account.

## Examples

### [basic-usage.tsx](./basic-usage.tsx)
Basic usage example showing how to connect a single platform.

### [multi-platform.tsx](./multi-platform.tsx)
Example showing how to manage multiple social media platforms in a single application.

### [api-usage.ts](./api-usage.ts)
Direct API usage examples for posting content to different platforms.

### [custom-storage.ts](./custom-storage.ts)
Example showing how to implement custom storage for OAuth state (e.g., Redis, database).

## Running Examples

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. Run examples:
   ```bash
   # For React examples, you'll need to integrate them into a React app
   # For API examples, you can run them with ts-node
   npx ts-node examples/api-usage.ts
   ```

## Tips

- Always validate tokens before making API calls
- Handle rate limiting appropriately
- Use appropriate storage for your use case (localStorage for client-side, Redis for server-side)
- Implement proper error handling
- Follow each platform's API guidelines and best practices
