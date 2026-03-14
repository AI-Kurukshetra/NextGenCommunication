import { createHmac } from "crypto";
import { env } from "@/lib/config";

export function signWebhookPayload(body: string) {
  return createHmac("sha256", env.CPAAS_WEBHOOK_SIGNING_SECRET).update(body).digest("hex");
}
