import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export class StorageService {
  private readonly supabase = createSupabaseAdminClient();

  async uploadCallRecording(callId: string, file: ArrayBuffer, contentType = "audio/mpeg") {
    const path = `recordings/${callId}.mp3`;

    const { error } = await this.supabase.storage
      .from("cpaas-assets")
      .upload(path, file, {
        contentType,
        upsert: true
      });

    if (error) {
      throw error;
    }

    const { data } = this.supabase.storage.from("cpaas-assets").getPublicUrl(path);
    return data.publicUrl;
  }
}
