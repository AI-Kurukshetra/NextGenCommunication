import { createSupabaseServerClient } from "@/lib/supabase-server";
import { AppError } from "@/lib/errors";

export async function requireUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AppError("Unauthorized", { status: 401, code: "unauthorized" });
  }

  return user;
}
