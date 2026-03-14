"use client";

import Link from "next/link";
import { FormEvent, Suspense, useMemo, useState } from "react";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { Home, KeyRound, Mail, Sparkles } from "lucide-react";

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

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => safeNextPath(searchParams.get("next")), [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busyAction, setBusyAction] = useState<"email" | "signup" | "magic" | null>(null);
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

      router.replace(nextPath);
      router.refresh();
    } finally {
      setBusyAction(null);
    }
  }

  async function handleSignUp() {
    resetMessages();

    if (!supabase) {
      setErrorMessage("Supabase client is not configured. Add public Supabase env vars.");
      return;
    }

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Enter both email and password to create an account.");
      return;
    }

    setBusyAction("signup");

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: buildRedirectTo()
        }
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (data.session) {
        router.replace(nextPath);
        router.refresh();
        return;
      }

      setStatusMessage(
        "Account created. Check your inbox and verify your email before signing in."
      );
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f3efe6] px-4 py-8 md:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-cyan-300/25 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-orange-300/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-slate-300/30 blur-3xl" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_1fr]">
        <section className="hidden rounded-3xl border border-slate-200/70 bg-white/60 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.08)] backdrop-blur lg:block">
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            <Sparkles className="h-3.5 w-3.5 text-cyan-700" />
            Access Console
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-slate-950">
            Secure access to your communications command center.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-slate-600">
            Manage messaging, voice, templates, campaign orchestration, and usage analytics through Supabase-authenticated workspace access.
          </p>

          <div className="mt-8 grid gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">Real-time Operations</p>
              <p className="mt-2 text-sm text-slate-600">Delivery tracking, webhook visibility, and fraud-aware routing signals in one place.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">Role-aware Workspaces</p>
              <p className="mt-2 text-sm text-slate-600">Each user lands in org-specific demo data with scoped records and dashboards.</p>
            </div>
          </div>
        </section>

        <Card className="rounded-3xl border-slate-200/80 bg-white/90 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur md:p-8">
          <div className="mb-6 flex items-center justify-end gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <Home className="h-3.5 w-3.5" />
              Main Site
            </Link>
          </div>

          <CardTitle className="text-2xl text-slate-950">Sign In</CardTitle>
          <CardDescription className="mt-2">
            Authenticate with Supabase Auth (email/password or magic link).
          </CardDescription>

          <form className="mt-6 space-y-3" onSubmit={handleEmailSignIn}>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Email</p>
              <Input
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Password</p>
              <Input
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button type="submit" className="w-full gap-2" disabled={busyAction !== null || !supabaseConfigured}>
                <Mail className="h-4 w-4" />
                {busyAction === "email" ? "Signing In..." : "Continue with Email"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full gap-2"
                onClick={handleSignUp}
                disabled={busyAction !== null || !supabaseConfigured}
              >
                <KeyRound className="h-4 w-4" />
                {busyAction === "signup" ? "Creating..." : "Create Account"}
              </Button>
            </div>
          </form>

          <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleMagicLink}
              disabled={busyAction !== null || !supabaseConfigured}
            >
              {busyAction === "magic" ? "Sending Link..." : "Send Magic Link"}
            </Button>
          </div>

          {statusMessage ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              {statusMessage}
            </div>
          ) : null}
          {errorMessage ? (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
              {errorMessage}
            </div>
          ) : null}

          <p className="mt-5 text-xs text-slate-500">
            Configure providers in Supabase Auth settings.
            <a
              href="https://supabase.com/docs/guides/auth"
              target="_blank"
              rel="noreferrer"
              className="ml-1 font-semibold underline"
            >
              Learn more
            </a>
          </p>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f3efe6]" />}>
      <LoginPageContent />
    </Suspense>
  );
}
