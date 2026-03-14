export type Channel = "sms" | "mms" | "voice" | "whatsapp" | "email";

export interface OmnichannelMessage {
  channel: Channel;
  to: string;
  from: string;
  content: string;
  mediaUrls?: string[];
}

export function normalizeOmnichannelPayload(payload: OmnichannelMessage) {
  return {
    channel: payload.channel,
    destination: payload.to,
    source: payload.from,
    content: payload.content,
    media_urls: payload.mediaUrls ?? []
  };
}
