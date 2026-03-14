import { randomBytes } from "crypto";
import { WebRtcRepository } from "@/server/repositories/webrtc-repository";

export class WebRtcService {
  private readonly webrtcRepository = new WebRtcRepository();

  async list(organizationId: string) {
    return this.webrtcRepository.list(organizationId);
  }

  async create(payload: {
    organizationId: string;
    applicationId: string;
    roomName: string;
    callId?: string;
    ttlMinutes?: number;
    metadata?: Record<string, unknown>;
  }) {
    const sessionToken = randomBytes(24).toString("base64url");
    const ttlMinutes = payload.ttlMinutes && payload.ttlMinutes > 0 ? payload.ttlMinutes : 60;
    const expiresAt = new Date(Date.now() + ttlMinutes * 60_000).toISOString();

    const session = await this.webrtcRepository.create({
      organizationId: payload.organizationId,
      applicationId: payload.applicationId,
      callId: payload.callId,
      roomName: payload.roomName,
      sessionToken,
      expiresAt,
      metadata: payload.metadata
    });

    return {
      ...session,
      session_token: sessionToken
    };
  }
}
