import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export class CampaignsRepository {
  private readonly supabase = createSupabaseAdminClient();

  async create(payload: {
    organizationId: string;
    applicationId: string;
    name: string;
    templateId?: string;
    segmentFilter: Record<string, unknown>;
    scheduledAt?: string | null;
  }) {
    const { data, error } = await this.supabase
      .from("campaigns")
      .insert({
        organization_id: payload.organizationId,
        application_id: payload.applicationId,
        name: payload.name,
        template_id: payload.templateId ?? null,
        segment_filter: payload.segmentFilter,
        scheduled_at: payload.scheduledAt ?? null,
        status: payload.scheduledAt ? "scheduled" : "draft"
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async updateStatus(campaignId: string, organizationId: string, status: string) {
    const updates: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === "running") {
      updates.started_at = new Date().toISOString();
    }

    if (status === "completed") {
      updates.completed_at = new Date().toISOString();
    }

    const { error } = await this.supabase
      .from("campaigns")
      .update(updates)
      .eq("id", campaignId)
      .eq("organization_id", organizationId);

    if (error) {
      throw error;
    }
  }
}
