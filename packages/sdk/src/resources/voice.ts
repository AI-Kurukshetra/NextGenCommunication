import { requestJson } from "../http";
import type { CreateCallRequest } from "../types";

export class VoiceResource {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly timeoutMs: number
  ) {}

  async call(payload: CreateCallRequest) {
    return requestJson<{
      id: string;
      status: string;
      to: string;
      from: string;
      created_at: string;
    }>(
      this.baseUrl,
      this.apiKey,
      "/api/voice/call",
      {
        method: "POST",
        body: JSON.stringify(payload)
      },
      this.timeoutMs
    );
  }
}
