import { randomUUID } from "crypto";

interface CreateCallInput {
  to: string;
  from: string;
  answerUrl?: string;
  record?: boolean;
}

interface CreateCallResponse {
  providerCallId: string;
  status: "initiated" | "ringing";
}

export class MockVoiceProvider {
  async createCall(_: CreateCallInput): Promise<CreateCallResponse> {
    return {
      providerCallId: `mock_call_${randomUUID()}`,
      status: "initiated"
    };
  }
}

export const voiceProvider = new MockVoiceProvider();
