import { createHash, timingSafeEqual } from "crypto";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export interface ApiPrincipal {
  keyId: string;
  organizationId: string;
  applicationId: string;
  scopes: string[];
  rateLimitPerMinute: number;
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export class ApiKeysRepository {
  private readonly supabase = createSupabaseAdminClient();

  async findPrincipal(rawKey: string): Promise<ApiPrincipal | null> {
    const keyHash = sha256(rawKey);
    const { data, error } = await this.supabase
      .from("api_keys")
      .select("id, application_id, organization_id, scopes, rate_limit_per_minute, key_hash")
      .eq("key_hash", keyHash)
      .eq("is_active", true)
      .is("deleted_at", null)
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const stored = Buffer.from(data.key_hash as string, "utf8");
    const provided = Buffer.from(keyHash, "utf8");

    if (stored.length !== provided.length || !timingSafeEqual(stored, provided)) {
      return null;
    }

    return {
      keyId: data.id,
      organizationId: data.organization_id,
      applicationId: data.application_id,
      scopes: (data.scopes as string[]) ?? [],
      rateLimitPerMinute: data.rate_limit_per_minute ?? 120
    };
  }
}
