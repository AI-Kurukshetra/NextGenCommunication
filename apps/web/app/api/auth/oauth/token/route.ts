import { randomUUID } from "crypto";
import { z } from "zod";
import { parseJson, withApiErrorHandling } from "@/lib/route";
import { AppError } from "@/lib/errors";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const schema = z.object({
  grant_type: z.literal("client_credentials"),
  client_id: z.string().min(10),
  client_secret: z.string().min(16),
  scope: z.string().optional()
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withApiErrorHandling(async () => {
    const body = await parseJson(request, schema);
    const supabase = createSupabaseAdminClient();

    const { data: client } = await supabase
      .from("oauth_clients")
      .select("*")
      .eq("client_id", body.client_id)
      .eq("is_active", true)
      .is("deleted_at", null)
      .maybeSingle();

    if (!client || client.client_secret !== body.client_secret) {
      throw new AppError("Invalid client credentials", {
        status: 401,
        code: "invalid_client"
      });
    }

    const token = `oa_${randomUUID().replace(/-/g, "")}`;
    const expiresAt = new Date(Date.now() + 3600_000).toISOString();

    await supabase.from("oauth_tokens").insert({
      organization_id: client.organization_id,
      application_id: client.application_id,
      oauth_client_id: client.id,
      access_token: token,
      token_type: "bearer",
      scope: body.scope ?? client.default_scope,
      expires_at: expiresAt
    });

    return Response.json({
      access_token: token,
      token_type: "bearer",
      expires_in: 3600,
      scope: body.scope ?? client.default_scope
    });
  });
}
