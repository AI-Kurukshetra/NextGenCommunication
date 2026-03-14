import { createHash, randomBytes } from "crypto";
import { SipRepository } from "@/server/repositories/sip-repository";

export class SipService {
  private readonly sipRepository = new SipRepository();

  async list(organizationId: string) {
    return this.sipRepository.list(organizationId);
  }

  async create(payload: {
    organizationId: string;
    applicationId: string;
    name: string;
    domain: string;
    transport?: "udp" | "tcp" | "tls";
    codecs?: string[];
    username?: string;
    password?: string;
    metadata?: Record<string, unknown>;
  }) {
    const username = payload.username?.trim() || `sip_${randomBytes(4).toString("hex")}`;
    const rawSecret = payload.password?.trim() || randomBytes(18).toString("base64url");
    const secretHash = createHash("sha256").update(rawSecret).digest("hex");

    const endpoint = await this.sipRepository.create({
      organizationId: payload.organizationId,
      applicationId: payload.applicationId,
      name: payload.name,
      username,
      passwordSecret: secretHash,
      domain: payload.domain,
      transport: payload.transport ?? "udp",
      codecs: payload.codecs?.length ? payload.codecs : ["pcmu", "opus"],
      metadata: payload.metadata
    });

    return {
      ...endpoint,
      generated_password: rawSecret
    };
  }
}
