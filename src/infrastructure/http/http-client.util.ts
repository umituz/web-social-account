/**
 * HTTP Client Utility with retry logic and timeout
 */

export interface HttpRequestOptions {
  timeout?: number;
  maxRetries?: number;
  headers?: Record<string, string>;
}

export class HttpClient {
  private defaultTimeout: number;
  private defaultMaxRetries: number;

  constructor(timeout: number = 30000, maxRetries: number = 3) {
    this.defaultTimeout = timeout;
    this.defaultMaxRetries = maxRetries;
  }

  async fetch(
    url: string,
    options: RequestInit & HttpRequestOptions = {}
  ): Promise<Response> {
    const {
      timeout = this.defaultTimeout,
      maxRetries = this.defaultMaxRetries,
      headers = {},
      ...fetchOptions
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...fetchOptions,
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        return response;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on 4xx errors (except 429)
        if (error instanceof Response && error.status >= 400 && error.status < 500 && error.status !== 429) {
          throw error;
        }

        // Don't retry on AbortError (timeout)
        if (error instanceof Error && error.name === "AbortError") {
          throw new Error(`Request timeout after ${timeout}ms`);
        }

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error("Request failed");
  }

  async get<T>(
    url: string,
    options: Omit<HttpRequestOptions, "body"> = {}
  ): Promise<T> {
    const response = await this.fetch(url, { ...options, method: "GET" });
    return this.parseResponse<T>(response);
  }

  async post<T>(
    url: string,
    body: unknown,
    options: HttpRequestOptions = {}
  ): Promise<T> {
    const response = await this.fetch(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
    return this.parseResponse<T>(response);
  }

  async put<T>(
    url: string,
    body: unknown,
    options: HttpRequestOptions = {}
  ): Promise<T> {
    const response = await this.fetch(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
    return this.parseResponse<T>(response);
  }

  async delete<T>(
    url: string,
    options: Omit<HttpRequestOptions, "body"> = {}
  ): Promise<T> {
    const response = await this.fetch(url, { ...options, method: "DELETE" });
    return this.parseResponse<T>(response);
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(JSON.stringify(error));
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return (await response.json()) as T;
    }

    return (await response.text()) as unknown as T;
  }
}
