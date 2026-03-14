import { randomUUID } from "crypto";

interface SendMessageInput {
  to: string;
  from: string;
  text?: string;
  mediaUrls?: string[];
}

interface ProviderResponse {
  providerMessageId: string;
  status: "queued" | "sent";
  segments: number;
}

export class MockSmsProvider {
  async sendMessage(input: SendMessageInput): Promise<ProviderResponse> {
    const content = input.text ?? "";
    const segments = Math.max(1, Math.ceil(content.length / 160));

    return {
      providerMessageId: `mock_msg_${randomUUID()}`,
      status: "queued",
      segments
    };
  }
}

export const smsProvider = new MockSmsProvider();
