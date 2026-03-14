import { createHash, timingSafeEqual } from "crypto";
import { AppError } from "@/lib/errors";
import { MessagesRepository } from "@/server/repositories/messages-repository";
import { UsageRepository } from "@/server/repositories/usage-repository";
import { OtpRepository } from "@/server/repositories/otp-repository";
import { smsProvider } from "@/server/integrations/sms-provider";
import { enqueueWebhookEvent } from "@/lib/queue";

function hashOtp(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function secureEquals(a: string, b: string) {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

function randomOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export class VerifyService {
  private readonly messagesRepository = new MessagesRepository();
  private readonly usageRepository = new UsageRepository();
  private readonly otpRepository = new OtpRepository();

  async start(payload: {
    organizationId: string;
    applicationId: string;
    to: string;
    from: string;
    ttlSeconds?: number;
  }) {
    const code = randomOtp();
    const ttl = payload.ttlSeconds ?? 300;
    const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
    const codeHash = hashOtp(code);

    const otp = await this.otpRepository.create({
      organizationId: payload.organizationId,
      applicationId: payload.applicationId,
      toNumber: payload.to,
      codeHash,
      expiresAt,
      channel: "sms"
    });

    const providerResult = await smsProvider.sendMessage({
      to: payload.to,
      from: payload.from,
      text: `Your verification code is ${code}. It expires in ${Math.floor(ttl / 60)} minutes.`
    });

    await this.messagesRepository.create({
      organizationId: payload.organizationId,
      applicationId: payload.applicationId,
      toNumber: payload.to,
      fromNumber: payload.from,
      body: "OTP message sent",
      mediaUrls: [],
      direction: "outbound",
      status: "queued",
      provider: "mock",
      providerMessageId: providerResult.providerMessageId,
      segmentCount: providerResult.segments,
      metadata: { otpId: otp.id }
    });

    await this.usageRepository.track({
      organizationId: payload.organizationId,
      applicationId: payload.applicationId,
      eventType: "verify.start",
      units: 1,
      unitType: "request",
      amountUsd: 0.01,
      referenceType: "otp",
      referenceId: otp.id
    });

    await enqueueWebhookEvent(payload.organizationId, "verify.started", {
      otp_id: otp.id,
      to: payload.to,
      expires_at: expiresAt
    });

    return {
      verification_id: otp.id,
      status: otp.status,
      expires_at: expiresAt
    };
  }

  async check(payload: {
    organizationId: string;
    to: string;
    code: string;
  }) {
    const otp = await this.otpRepository.findActive(payload.organizationId, payload.to);

    if (!otp) {
      throw new AppError("Verification not found", { status: 404, code: "verification_not_found" });
    }

    if (new Date(otp.expires_at).getTime() < Date.now()) {
      await this.otpRepository.markResult(otp.id, "expired");
      throw new AppError("Verification expired", { status: 400, code: "verification_expired" });
    }

    const passed = secureEquals(hashOtp(payload.code), otp.code_hash);

    await this.otpRepository.markResult(otp.id, passed ? "verified" : "failed");

    return {
      verification_id: otp.id,
      status: passed ? "approved" : "denied"
    };
  }
}
