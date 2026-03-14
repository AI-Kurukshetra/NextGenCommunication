export interface CPaaSClientConfig {
  baseUrl?: string;
  apiKey: string;
  timeoutMs?: number;
}

export interface SendMessageRequest {
  to: string;
  from: string;
  text?: string;
  mediaUrls?: string[];
  metadata?: Record<string, unknown>;
}

export interface CreateCallRequest {
  to: string;
  from: string;
  answerUrl?: string;
  record?: boolean;
  metadata?: Record<string, unknown>;
}

export interface PurchaseNumberRequest {
  countryCode?: string;
  numberType?: "local" | "toll_free" | "mobile";
  capabilities?: string[];
}

export interface VerifyStartRequest {
  to: string;
  from: string;
  ttlSeconds?: number;
}

export interface VerifyCheckRequest {
  to: string;
  code: string;
}
