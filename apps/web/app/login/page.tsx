"use client";

import { FormEvent, useMemo, useState } from "react";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClientBrowser } from "@/lib/supabase-browser";

const DEFAULT_NEXT: Route = "/dashboard";

function safeNextPath(candidate: string | null): Route {
  if (!candidate || !candidate.startsWith("/")) {
    return DEFAULT_NEXT;
  }

  return candidate as Route;
}

function mapErrorMessage(errorParam: string | null) {
  if (!errorParam) {
    return null;
  }

  if (errorParam === "missing_supabase_env") {
    return "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Set them in .env and restart dev server.";
  }

  if (errorParam === "auth_callback_failed") {
    return "Authentication callback failed. Try signing in again.";
  }

  return "Authentication failed. Please try again.";
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => safeNextPath(searchParams.get("next")), [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ssoDomain, setSsoDomain] = useState("");
  const [busyAction, setBusyAction] = useState<"email" | "magic" | "sso" | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    mapErrorMessage(searchParams.get("error"))
  );

  const supabaseConfigured =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const supabase = useMemo(
    () => (supabaseConfigured ? createClientBrowser() : null),
    [supabaseConfigured]
  );

  const resetMessages = () => {
    setStatusMessage(null);
    setErrorMessage(null);
  };

  const buildRedirectTo = () => {
    const encodedNext = encodeURIComponent(nextPath);
    return `${window.location.origin}/auth/callback?next=${encodedNext}`;
  };

  async function handleEmailSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetMessages();

    if (!supabase) {
      setErrorMessage("Supabase client is not configured. Add public Supabase env vars.");
      return;
    }

    setBusyAction("email");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      router.push(nextPath);
      router.refresh();
    } finally {
      setBusyAction(null);
    }
  }

  async function handleMagicLink() {
    resetMessages();

    if (!supabase) {
      setErrorMessage("Supabase client is not configured. Add public Supabase env vars.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Enter your email to send a magic link.");
      return;
    }

    setBusyAction("magic");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: buildRedirectTo()
        }
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setStatusMessage("Magic link sent. Check your inbox and open the link to continue.");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleSso() {
    resetMessages();

    if (!supabase) {
      setErrorMessage("Supabase client is not configured. Add public Supabase env vars.");
      return;
    }

    setBusyAction("sso");

    try {
      const redirectTo = buildRedirectTo();

      if (ssoDomain.trim()) {
        const { error } = await supabase.auth.signInWithSSO({
          domain: ssoDomain.trim(),
          options: {
            redirectTo
          }
        });

        if (error) {
          setErrorMessage(error.message);
        }

        return;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            prompt: "select_account"
          }
        }
      });

      if (error) {
        setErrorMessage(error.message);
      }
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardTitle>Sign In</CardTitle>
        <CardDescription className="mt-2">
          Authenticate with Supabase Auth (email/password, SSO, or magic link).
        </CardDescription>

        <form className="mt-5 space-y-3" onSubmit={handleEmailSignIn}>
          <Input
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={busyAction !== null || !supabaseConfigured}>
            {busyAction === "email" ? "Signing In..." : "Continue with Email"}
          </Button>
        </form>

        <div className="mt-3">
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleMagicLink}
            disabled={busyAction !== null || !supabaseConfigured}
          >
            {busyAction === "magic" ? "Sending Link..." : "Send Magic Link"}
          </Button>
        </div>

        <div className="mt-5 space-y-3 border-t pt-4">
          <Input
            type="text"
            placeholder="company.com (optional for enterprise SSO)"
            value={ssoDomain}
            onChange={(event) => setSsoDomain(event.target.value)}
            disabled={!supabaseConfigured}
          />
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleSso}
            disabled={busyAction !== null || !supabaseConfigured}
          >
            {busyAction === "sso" ? "Redirecting..." : "Continue with SSO"}
          </Button>
        </div>

        {statusMessage ? <p className="mt-4 text-xs text-green-700">{statusMessage}</p> : null}
        {errorMessage ? <p className="mt-4 text-xs text-red-700">{errorMessage}</p> : null}

        <p className="mt-4 text-xs text-muted-foreground">
          Configure providers in Supabase Auth settings.
          <a
            href="https://supabase.com/docs/guides/auth"
            target="_blank"
            rel="noreferrer"
            className="ml-1 underline"
          >
            Learn more
          </a>
        </p>
      </Card>
    </div>
  );
}
