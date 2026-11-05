
import { describe, it, expect, vi, beforeEach } from "vitest";
import { HttpClient } from "../../../src/infrastructure/http/http-client.util";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("HttpClient", () => {
  let httpClient: HttpClient;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    httpClient = new HttpClient(5000, 2);
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  it("should make GET request", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ data: "test" })
    );

    const result = await httpClient.get<{ data: string }>("https://api.example.com/test");

    expect(result).toEqual({ data: "test" });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should make POST request", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ success: true })
    );

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
      .mockResolvedValueOnce(jsonResponse({ data: "retry-success" }));

    const result = await httpClient.get<{ data: string }>("https://api.example.com/test");

    expect(result).toEqual({ data: "retry-success" });
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("should timeout after specified time", async () => {
    const shortClient = new HttpClient(30, 0);
    mockFetch.mockImplementationOnce(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError"))
          );
        })
    );

    await expect(
      shortClient.get("https://api.example.com/test")
    ).rejects.toThrow("Request timeout after 30ms");
  });
});
