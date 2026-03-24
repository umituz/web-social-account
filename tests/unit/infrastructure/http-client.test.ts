/**
 * Tests for HttpClient
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { HttpClient } from "../../../src/infrastructure/http/http-client.util";

describe("HttpClient", () => {
  let httpClient: HttpClient;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    httpClient = new HttpClient(5000, 2);
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  it("should make GET request", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: "test" }),
    });

    const result = await httpClient.get<{ data: string }>("https://api.example.com/test");

    expect(result).toEqual({ data: "test" });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should make POST request", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const result = await httpClient.post<{ success: boolean }>(
      "https://api.example.com/create",
      { name: "test" }
    );

    expect(result).toEqual({ success: true });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should retry on failure", async () => {
    mockFetch
      .mockRejectedValueOnce(new Error("Network error"))
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: "retry-success" }),
      });

    const result = await httpClient.get<{ data: string }>("https://api.example.com/test");

    expect(result).toEqual({ data: "retry-success" });
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("should timeout after specified time", async () => {
    mockFetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves

    await expect(
      httpClient.get("https://api.example.com/test")
    ).rejects.toThrow("Request timeout after 5000ms");
  });
});
