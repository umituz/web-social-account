/**
 * OAuth domain exports
 */

export * from "./entities/oauth-state.entity";
export * from "./services/oauth-service.interface";

// Re-export for convenience - all OAuth services should import this
export type { IOAuthService } from "./services/oauth-service.interface";
