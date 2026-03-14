import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export class WebRtcRepository {
  private readonly supabase = createSupabaseAdminClient();

  async list(organizationId: string) {
    const { data, error } = await this.supabase
      .from("webrtc_sessions")
      .select("id, organization_id, application_id, call_id, room_name, status, expires_at, ended_at, metadata, created_at")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    return data;
  }

  async create(payload: {
    organizationId: string;
    applicationId: string;
    callId?: string;
    roomName: string;
    sessionToken: string;
    expiresAt: string;
    metadata?: Record<string, unknown>;
  }) {
    const { data, error } = await this.supabase
      .from("webrtc_sessions")
      .insert({
        organization_id: payload.organizationId,
        application_id: payload.applicationId,
        call_id: payload.callId ?? null,
        room_name: payload.roomName,
        session_token: payload.sessionToken,
        status: "active",
        expires_at: payload.expiresAt,
        metadata: payload.metadata ?? {}
      })
      .select("id, organization_id, application_id, call_id, room_name, status, expires_at, ended_at, metadata, created_at")
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}
