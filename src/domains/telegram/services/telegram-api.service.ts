/**
 * Telegram Bot API Service
 *
 * Telegram does not use bearer tokens. All requests are authenticated with
 * the bot token in the URL. Response shape is `{ ok, result, error_code,
 * description }`. Errors are normalized through the base class.
 */

import type { SocialPostContent, SocialApiResponse } from "../../../domain/types";
import type {
  TelegramUser,
  TelegramMessage,
  TelegramFile,
  TelegramResponse,
} from "../types/telegram.types";
import { BaseApiService } from "../../core/api/services/base-api.service";
import { HttpClient } from "../../../infrastructure/http/http-client.util";

export class TelegramApiService extends BaseApiService {
  constructor(http: HttpClient = new HttpClient()) {
    super(http);
  }

  protected baseUrl(): string {
    return "https://api.telegram.org";
  }

  /**
   * Telegram responses wrap data in `{ ok, result, error_code, description }`.
   */
  private async callTelegram<T>(
    botToken: string,
    method: string,
    params: Record<string, string> = {}
  ): Promise<SocialApiResponse<T>> {
    try {
      const qs = new URLSearchParams(params).toString();
      const path = `/bot${botToken}/${method}${qs ? `?${qs}` : ""}`;
      const response = await this.http.fetch(this.url(path), { method: "GET" });
      const data = (await response.json()) as TelegramResponse<T>;

      if (!data.ok) {
        return {
          success: false,
          error: {
            code: data.error_code ? String(data.error_code) : "UNKNOWN",
            message: data.description ?? `Telegram ${method} failed`,
          },
        };
      }

      if (data.result === undefined || data.result === null) {
        return {
          success: false,
          error: { code: "EMPTY_RESULT", message: "Telegram returned an empty result" },
        };
      }

      return { success: true, data: data.result };
    } catch (error) {
      return { success: false, error: this.toApiError(error, "Network error occurred") };
    }
  }

  async getBotInfo(botToken: string): Promise<SocialApiResponse<TelegramUser>> {
    return this.callTelegram<TelegramUser>(botToken, "getMe");
  }

  async getUpdates(
    botToken: string,
    offset: number = 0,
    limit: number = 100
  ): Promise<SocialApiResponse<TelegramMessage[]>> {
    return this.callTelegram<TelegramMessage[]>(botToken, "getUpdates", {
      offset: String(offset),
      limit: String(limit),
    }).then((response) => ({
      success: response.success,
      data: response.success ? (response.data ?? []) : undefined,
      ...(response.success ? {} : { error: response.error }),
    }));
  }

  async sendMessage(
    botToken: string,
    chatId: string,
    content: SocialPostContent
  ): Promise<SocialApiResponse<{ message_id: number }>> {
    const hasMedia = content.media && content.media.length > 0;
    const method = hasMedia ? "sendPhoto" : "sendMessage";
    const body: Record<string, string> = hasMedia
      ? { chat_id: chatId, photo: content.media![0].url, caption: content.text }
      : { chat_id: chatId, text: content.text };

    try {
      const response = await this.http.fetch(this.url(`/bot${botToken}/${method}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json()) as TelegramResponse<TelegramMessage>;
      if (!data.ok || !data.result) {
        return {
          success: false,
          error: {
            code: data.error_code ? String(data.error_code) : "UNKNOWN",
            message: data.description ?? `Telegram ${method} failed`,
          },
        };
      }
      return { success: true, data: { message_id: data.result.message_id } };
    } catch (error) {
      return { success: false, error: this.toApiError(error, "Network error occurred") };
    }
  }

  async getFile(
    botToken: string,
    fileId: string
  ): Promise<SocialApiResponse<TelegramFile>> {
    return this.callTelegram<TelegramFile>(botToken, "getFile", { file_id: fileId });
  }

  getFileUrl(botToken: string, filePath: string): string {
    return `${this.baseUrl()}/file/bot${botToken}/${filePath}`;
  }
}
