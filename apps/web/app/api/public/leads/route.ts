import { z } from "zod";

import { withApiErrorHandling } from "@/lib/route";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const leadSchema = z.object({
  type: z.enum(["expert", "trial"]),
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().min(1),
  useCase: z.string().min(2),
  message: z.string().optional()
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withApiErrorHandling(async () => {
    const payload = leadSchema.parse(await request.json());
    const supabase = createSupabaseAdminClient();

    const { error } = await supabase.from("public_leads").insert({
      lead_type: payload.type,
      name: payload.name,
      email: payload.email,
      company: payload.company,
      use_case: payload.useCase,
      message: payload.message ?? null,
      source: "marketing"
    });

    if (error) {
      throw error;
    }

    return Response.json({ status: "ok" }, { status: 201 });
  });
}
