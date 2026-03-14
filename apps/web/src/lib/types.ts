export type MessageStatus =
  | "queued"
  | "sending"
  | "sent"
  | "delivered"
  | "failed"
  | "undelivered"
  | "received";

export type CallStatus =
  | "queued"
  | "initiated"
  | "ringing"
  | "in-progress"
  | "completed"
  | "failed"
  | "busy"
  | "no-answer";

export type Direction = "inbound" | "outbound";

export interface SendMessagePayload {
  applicationId: string;
  to: string;
  from: string;
  text?: string;
  mediaUrls?: string[];
  metadata?: Record<string, unknown>;
}

export interface CreateCallPayload {
  applicationId: string;
  to: string;
  from: string;
  answerUrl?: string;
  record?: boolean;
  metadata?: Record<string, unknown>;
}
