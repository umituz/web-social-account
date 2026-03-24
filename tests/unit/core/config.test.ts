/**
 * Tests for PlatformConfigEntity
 */

import { describe, it, expect } from "vitest";
import { PlatformConfigEntity } from "../../../src/domains/core/config/entities/platform-config.entity";

describe("PlatformConfigEntity", () => {
  it("should create config for twitter", () => {
    const config = PlatformConfigEntity.fromPlatform("twitter", {
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
      redirectUri: "http://localhost:3000/callback",
    });

    expect(config.oAuth.clientId).toBe("test-client-id");
    expect(config.oAuth.clientSecret).toBe("test-client-secret");
    expect(config.oAuth.redirectUri).toBe("http://localhost:3000/callback");
    expect(config.oAuth.scope).toContain("tweet.read");
    expect(config.oAuth.scope).toContain("tweet.write");
  });

  it("should validate config", () => {
    const config = PlatformConfigEntity.fromPlatform("twitter", {
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
      redirectUri: "http://localhost:3000/callback",
    });

    expect(config.validate()).toBe(true);
  });

  it("should fail validation for invalid config", () => {
    const config = new PlatformConfigEntity({
      oAuth: {
        clientId: "",
        clientSecret: "",
        redirectUri: "",
        scope: [],
        authorizationUrl: "",
        tokenUrl: "",
      },
    });

    expect(config.validate()).toBe(false);
  });

  it("should generate authorization URL", () => {
    const config = PlatformConfigEntity.fromPlatform("twitter", {
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
      redirectUri: "http://localhost:3000/callback",
    });

    const url = config.getAuthorizationUrl("test-state");

    expect(url.toString()).toContain("client_id=test-client-id");
    expect(url.toString()).toContain("redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback");
    expect(url.toString()).toContain("state=test-state");
  });
});
