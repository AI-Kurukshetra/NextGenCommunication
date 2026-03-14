import { requestJson } from "../http";
import type { SendMessageRequest } from "../types";

export class MessagesResource {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly timeoutMs: number
  ) {}

  async send(payload: SendMessageRequest) {
    return requestJson<{
      id: string;
      status: string;
      to: string;
      from: string;
      segments: number;
      created_at: string;
    }>(
      this.baseUrl,
      this.apiKey,
      "/api/messages/send",
      {
        method: "POST",
        body: JSON.stringify(payload)
      },
      this.timeoutMs
    );
  }

  async get(messageId: string) {
    return requestJson<{
      id: string;
      status: string;
      to: string;
      from: string;
      body: string | null;
      media_urls: string[];
      created_at: string;
      delivered_at: string | null;
    }>(this.baseUrl, this.apiKey, `/api/messages/${messageId}`, {}, this.timeoutMs);
  }
}
