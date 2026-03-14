"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

interface LeadFormProps {
  variant: "expert" | "trial";
}

const variantCopy = {
  expert: {
    title: "Talk to an architect",
    cta: "Request callback"
  },
  trial: {
    title: "Start a guided trial",
    cta: "Request trial"
  }
} as const;

export function LeadForm({ variant }: LeadFormProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    useCase: "",
    message: ""
  });
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function submit() {
    setStatus(null);

    startTransition(async () => {
      const response = await fetch("/api/public/leads", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          type: variant,
          ...form
        })
      });

      if (!response.ok) {
        setStatus("Submission failed. Please try again.");
        return;
      }

      setForm({
        name: "",
        email: "",
        company: "",
        useCase: "",
        message: ""
      });
      setStatus("Request captured. A follow-up note will be queued for your team.");
    });
  }

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0f766e]">Conversion</p>
        <h3 className="text-2xl font-semibold text-slate-950">{variantCopy[variant].title}</h3>
        <p className="text-sm leading-6 text-slate-600">
          Share your rollout plan and we will match you with the right product, routing, and launch guidance.
        </p>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Input value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Name" />
        <Input
          type="email"
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
          placeholder="Work email"
        />
        <Input
          value={form.company}
          onChange={(event) => updateField("company", event.target.value)}
          placeholder="Company"
        />
        <Input
          value={form.useCase}
          onChange={(event) => updateField("useCase", event.target.value)}
          placeholder="Primary use case"
        />
        <Textarea
          value={form.message}
          onChange={(event) => updateField("message", event.target.value)}
          placeholder="Current providers, channels, regions, or launch timing"
          className="md:col-span-2"
        />
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          onClick={submit}
          disabled={isPending || form.name.trim().length === 0 || form.email.trim().length === 0}
          className="rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800"
        >
          {isPending ? "Submitting..." : variantCopy[variant].cta}
        </Button>
        <p className="text-xs text-slate-500">We use this only for product follow-up and launch planning.</p>
      </div>
      {status ? <p className="mt-3 text-sm text-slate-700">{status}</p> : null}
    </div>
  );
}
