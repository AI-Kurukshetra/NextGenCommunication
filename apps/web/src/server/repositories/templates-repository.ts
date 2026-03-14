import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export class TemplatesRepository {
  private readonly supabase = createSupabaseAdminClient();

  async create(payload: {
    organizationId: string;
    applicationId: string;
    name: string;
    channel: "sms" | "mms" | "whatsapp" | "voice";
    body: string;
    variables: string[];
  }) {
    const { data, error } = await this.supabase
      .from("templates")
      .insert({
        organization_id: payload.organizationId,
        application_id: payload.applicationId,
        name: payload.name,
        channel: payload.channel,
        body: payload.body,
        variables: payload.variables,
        status: "draft"
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async submitForApproval(templateId: string, organizationId: string) {
    const { data, error } = await this.supabase
      .from("templates")
      .update({ status: "pending_approval" })
      .eq("id", templateId)
      .eq("organization_id", organizationId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async review(payload: {
    templateId: string;
    organizationId: string;
    approvedBy?: string;
    approved: boolean;
    notes?: string;
  }) {
    const { data, error } = await this.supabase
      .from("templates")
      .update({
        status: payload.approved ? "approved" : "rejected",
        approved_by: payload.approved ? payload.approvedBy ?? null : null,
        approved_at: payload.approved ? new Date().toISOString() : null,
        approval_notes: payload.notes ?? null
      })
      .eq("id", payload.templateId)
      .eq("organization_id", payload.organizationId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}
