import type { CPaaSClientConfig } from "./types";
import { MessagesResource } from "./resources/messages";
import { VoiceResource } from "./resources/voice";
import { NumbersResource } from "./resources/numbers";
import { VerifyResource } from "./resources/verify";
import { UsageResource } from "./resources/usage";
import { AnalyticsResource } from "./resources/analytics";

export class CPaaSClient {
  readonly messages: MessagesResource;
  readonly voice: VoiceResource;
  readonly numbers: NumbersResource;
  readonly verify: VerifyResource;
  readonly usage: UsageResource;
  readonly analytics: AnalyticsResource;

  constructor(config: CPaaSClientConfig | string) {
    const normalized: CPaaSClientConfig =
      typeof config === "string" ? { apiKey: config } : config;

    const baseUrl = normalized.baseUrl ?? "http://localhost:3000";
    const timeoutMs = normalized.timeoutMs ?? 15000;

    this.messages = new MessagesResource(baseUrl, normalized.apiKey, timeoutMs);
    this.voice = new VoiceResource(baseUrl, normalized.apiKey, timeoutMs);
    this.numbers = new NumbersResource(baseUrl, normalized.apiKey, timeoutMs);
    this.verify = new VerifyResource(baseUrl, normalized.apiKey, timeoutMs);
    this.usage = new UsageResource(baseUrl, normalized.apiKey, timeoutMs);
    this.analytics = new AnalyticsResource(baseUrl, normalized.apiKey, timeoutMs);
  }
}
