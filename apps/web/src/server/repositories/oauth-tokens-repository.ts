import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export interface OAuthPrincipal {
  tokenId: string;
  organizationId: string;
  applicationId: string;
  scopes: string[];
}

export class OAuthTokensRepository {
  private readonly supabase = createSupabaseAdminClient();

  async findActive(accessToken: string): Promise<OAuthPrincipal | null> {
    const { data, error } = await this.supabase
      .from("oauth_tokens")
      .select("id, organization_id, application_id, scope, expires_at, revoked_at")
      .eq("access_token", accessToken)
      .is("deleted_at", null)
      .is("revoked_at", null)
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    if (new Date(data.expires_at).getTime() <= Date.now()) {
      return null;
    }

    return {
      tokenId: data.id,
      organizationId: data.organization_id,
      applicationId: data.application_id,
      scopes: String(data.scope ?? "")
        .split(" ")
        .map((scope) => scope.trim())
        .filter(Boolean)
    };
  }
}
