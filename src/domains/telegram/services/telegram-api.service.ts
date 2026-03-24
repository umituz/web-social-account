/**
 * Telegram API Service (Bot-based)
 */

import type { SocialPostContent, SocialApiResponse } from "../../../domain/types";
import type {
  TelegramUser,
  TelegramChat,
  TelegramMessage,
  TelegramFile,
  TelegramResponse,
} from "../types/telegram.types";

export class TelegramApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = "https://api.telegram.org";
  }

  /**
   * Get bot info
   */
  async getBotInfo(botToken: string): Promise<SocialApiResponse<TelegramUser>> {
    try {
      const response = await fetch(`${this.baseUrl}/bot${botToken}/getMe`);

      const data = (await response.json()) as TelegramResponse<TelegramUser>;

      if (!data.ok) {
        return {
          success: false,
          error: {
            code: data.error_code?.toString() || "UNKNOWN",
            message: data.description || "Failed to get bot info",
          },
        };
      }

      return {
        success: true,
        data: data.result!,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Network error occurred",
          details: error,
        },
      };
    }
  }

  /**
   * Get bot's updates (messages)
   */
  async getUpdates(
    botToken: string,
    offset: number = 0,
    limit: number = 100
  ): Promise<SocialApiResponse<TelegramMessage[]>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/bot${botToken}/getUpdates?offset=${offset}&limit=${limit}`
      );

      const data = (await response.json()) as TelegramResponse<TelegramMessage[]>;

      if (!data.ok) {
        return {
          success: false,
          error: {
            code: data.error_code?.toString() || "UNKNOWN",
            message: data.description || "Failed to get updates",
          },
        };
      }

      return {
        success: true,
        data: data.result || [],
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Network error occurred",
          details: error,
        },
      };
    }
  }

  /**
   * Send a message
   */
  async sendMessage(
    botToken: string,
    chatId: string,
    content: SocialPostContent
  ): Promise<SocialApiResponse<{ message_id: number }>> {
    try {
      const body: Record<string, unknown> = {
        chat_id: chatId,
        text: content.text,
      };

      if (content.media && content.media.length > 0) {
        body.photo = content.media[0].url;
        if (content.text) {
          body.caption = content.text;
        }
        delete body.text;
      }

      const method = content.media ? "sendPhoto" : "sendMessage";
      const response = await fetch(`${this.baseUrl}/bot${botToken}/${method}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = (await response.json()) as TelegramResponse<TelegramMessage>;

      if (!data.ok) {
        return {
          success: false,
          error: {
            code: data.error_code?.toString() || "UNKNOWN",
            message: data.description || "Failed to send message",
          },
        };
      }

      return {
        success: true,
        data: { message_id: data.result!.message_id },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Network error occurred",
          details: error,
        },
      };
    }
  }

  /**
   * Get file info
   */
  async getFile(
    botToken: string,
    fileId: string
  ): Promise<SocialApiResponse<TelegramFile>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/bot${botToken}/getFile?file_id=${fileId}`
      );

      const data = (await response.json()) as TelegramResponse<TelegramFile>;

      if (!data.ok) {
        return {
          success: false,
          error: {
            code: data.error_code?.toString() || "UNKNOWN",
            message: data.description || "Failed to get file",
          },
        };
      }

      return {
        success: true,
        data: data.result!,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Network error occurred",
          details: error,
        },
      };
    }
  }

  /**
   * Get file URL
   */
  getFileUrl(botToken: string, filePath: string): string {
    return `${this.baseUrl}/file/bot${botToken}/${filePath}`;
  }
}
