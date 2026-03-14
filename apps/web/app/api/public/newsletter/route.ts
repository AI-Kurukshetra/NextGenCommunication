import { z } from "zod";

import { withApiErrorHandling } from "@/lib/route";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const schema = z.object({
  email: z.string().email()
});

export async function POST(request: Request) {
  return withApiErrorHandling(async () => {
    const payload = schema.parse(await request.json());
    const supabase = createSupabaseAdminClient();

    const { error } = await supabase.from("public_newsletter").insert({
      email: payload.email,
      source: "marketing"
    });

    if (error) {
      throw error;
    }

    return Response.json({ status: "ok" }, { status: 201 });
  });
}
