import { CookieOptions, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const DEFAULT_NEXT = "/dashboard";

function safeNextPath(candidate: string | null) {
  if (!candidate || !candidate.startsWith("/")) {
    return DEFAULT_NEXT;
  }

  return candidate;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = safeNextPath(requestUrl.searchParams.get("next"));

  const loginUrl = new URL("/login", requestUrl.origin);
  loginUrl.searchParams.set("next", nextPath);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    loginUrl.searchParams.set("error", "missing_supabase_env");
    return NextResponse.redirect(loginUrl);
  }

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          cookieStore.set({ name, value, ...options });
        },
        remove: (name: string, options: CookieOptions) => {
          cookieStore.set({ name, value: "", ...options });
        }
      }
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      loginUrl.searchParams.set("error", "auth_callback_failed");
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}
