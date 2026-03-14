import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export class NumbersRepository {
  private readonly supabase = createSupabaseAdminClient();

  async purchase(payload: {
    organizationId: string;
    applicationId: string;
    e164Number: string;
    countryCode: string;
    numberType: "local" | "toll_free" | "mobile";
    capabilities: string[];
    provider: string;
  }) {
    const { data, error } = await this.supabase
      .from("phone_numbers")
      .insert({
        organization_id: payload.organizationId,
        application_id: payload.applicationId,
        e164_number: payload.e164Number,
        country_code: payload.countryCode,
        number_type: payload.numberType,
        capabilities: payload.capabilities,
        provider: payload.provider,
        status: "active",
        purchased_at: new Date().toISOString()
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async port(payload: {
    organizationId: string;
    applicationId: string;
    e164Number: string;
    countryCode: string;
    numberType: "local" | "toll_free" | "mobile";
    capabilities: string[];
  }) {
    const { data, error } = await this.supabase
      .from("phone_numbers")
      .insert({
        organization_id: payload.organizationId,
        application_id: payload.applicationId,
        e164_number: payload.e164Number,
        country_code: payload.countryCode,
        number_type: payload.numberType,
        capabilities: payload.capabilities,
        provider: "port-in",
        status: "porting",
        port_requested_at: new Date().toISOString()
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async assign(payload: {
    organizationId: string;
    phoneNumberId: string;
    applicationId: string;
  }) {
    const { data, error } = await this.supabase
      .from("phone_numbers")
      .update({
        application_id: payload.applicationId,
        updated_at: new Date().toISOString()
      })
      .eq("id", payload.phoneNumberId)
      .eq("organization_id", payload.organizationId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}
