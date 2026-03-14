"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
    setStatus(null);

    startTransition(async () => {
      const response = await fetch("/api/public/newsletter", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        setStatus("Could not save your email. Try again.");
        return;
      }

      setEmail("");
      setStatus("Subscribed. Product notes and launch updates will land in your inbox.");
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          className="h-12 rounded-full border-white/15 bg-white/5 px-5 text-white placeholder:text-slate-400"
        />
        <Button
          type="button"
          onClick={submit}
          disabled={isPending || email.trim().length === 0}
          className="h-12 rounded-full bg-[#58d7c4] px-6 text-slate-950 hover:bg-[#79e3d3]"
        >
          {isPending ? "Submitting..." : "Subscribe"}
        </Button>
      </div>
      {status ? <p className="text-sm text-slate-300">{status}</p> : null}
    </div>
  );
}
