import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export class EmergencyRepository {
  private readonly supabase = createSupabaseAdminClient();

  async listLocations(organizationId: string) {
    const { data, error } = await this.supabase
      .from("emergency_locations")
      .select("*")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    return data;
  }

  async createLocation(payload: {
    organizationId: string;
    label: string;
    countryCode: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    stateRegion: string;
    postalCode: string;
    latitude?: number;
    longitude?: number;
    metadata?: Record<string, unknown>;
  }) {
    const { data, error } = await this.supabase
      .from("emergency_locations")
      .insert({
        organization_id: payload.organizationId,
        label: payload.label,
        country_code: payload.countryCode,
        address_line1: payload.addressLine1,
        address_line2: payload.addressLine2 ?? null,
        city: payload.city,
        state_region: payload.stateRegion,
        postal_code: payload.postalCode,
        latitude: payload.latitude ?? null,
        longitude: payload.longitude ?? null,
        is_validated: false,
        metadata: payload.metadata ?? {}
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async ensurePhoneBelongsToOrg(payload: { organizationId: string; phoneNumberId: string }) {
    const { data, error } = await this.supabase
      .from("phone_numbers")
      .select("id, e164_number")
      .eq("id", payload.phoneNumberId)
      .eq("organization_id", payload.organizationId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data;
  }

  async ensureLocationBelongsToOrg(payload: { organizationId: string; locationId: string }) {
    const { data, error } = await this.supabase
      .from("emergency_locations")
      .select("id, label")
      .eq("id", payload.locationId)
      .eq("organization_id", payload.organizationId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data;
  }

  async deactivateAssignmentsForPhone(payload: { organizationId: string; phoneNumberId: string }) {
    const { error } = await this.supabase
      .from("emergency_number_assignments")
      .update({
        is_active: false,
        deactivated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("organization_id", payload.organizationId)
      .eq("phone_number_id", payload.phoneNumberId)
      .eq("is_active", true)
      .is("deleted_at", null);

    if (error) {
      throw error;
    }
  }

  async assignPhoneToLocation(payload: {
    organizationId: string;
    phoneNumberId: string;
    locationId: string;
    metadata?: Record<string, unknown>;
  }) {
    const { data, error } = await this.supabase
      .from("emergency_number_assignments")
      .insert({
        organization_id: payload.organizationId,
        phone_number_id: payload.phoneNumberId,
        emergency_location_id: payload.locationId,
        is_active: true,
        activated_at: new Date().toISOString(),
        metadata: payload.metadata ?? {}
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}
