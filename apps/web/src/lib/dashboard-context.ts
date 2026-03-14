import "server-only";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";

type MembershipRow = {
  organization_id: string;
  role: string;
};

type OrganizationRow = {
  id: string;
  name: string;
  slug: string;
  settings: Record<string, unknown> | null;
};

type ApplicationRow = {
  id: string;
  name: string;
  slug: string;
};

export type DashboardContext = {
  supabase: ReturnType<typeof createSupabaseServerClient>;
  user: {
    id: string;
    email: string;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
    settings: Record<string, unknown>;
  };
  role: string;
  application: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

export function formatShortDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);
}

export function getStatusTone(status: string): "success" | "warning" | "danger" | "neutral" {
  if (["delivered", "completed", "approved", "active", "succeeded", "verified"].includes(status)) {
    return "success";
  }

  if (["failed", "rejected", "cancelled", "undelivered", "suspended", "expired"].includes(status)) {
    return "danger";
  }

  if (["queued", "running", "pending", "pending_approval", "in-progress", "no-answer"].includes(status)) {
    return "warning";
  }

  return "neutral";
}

export async function getDashboardContext(): Promise<DashboardContext> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/login");
  }

  const { data: memberships, error: membershipsError } = await supabase
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (membershipsError || !memberships || memberships.length === 0) {
    throw new Error("No organization membership found for this user.");
  }

  const membershipRows = memberships as MembershipRow[];
  const organizationIds = membershipRows.map((item) => item.organization_id);

  const { data: organizations, error: organizationsError } = await supabase
    .from("organizations")
    .select("id, name, slug, settings")
    .in("id", organizationIds)
    .is("deleted_at", null);

  if (organizationsError || !organizations || organizations.length === 0) {
    throw new Error("No organization found for this user.");
  }

  const orgRows = organizations as OrganizationRow[];
  const demoOrg = orgRows.find((org) => org.slug.startsWith("demo-"));
  const organization = demoOrg ?? orgRows[0];

  const membership = membershipRows.find((row) => row.organization_id === organization.id) ?? membershipRows[0];

  const { data: applications } = await supabase
    .from("applications")
    .select("id, name, slug")
    .eq("organization_id", organization.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(1);

  const application = applications?.[0] as ApplicationRow | undefined;

  return {
    supabase,
    user: {
      id: user.id,
      email: user.email
    },
    organization: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      settings: organization.settings ?? {}
    },
    role: membership.role,
    application: application
      ? {
          id: application.id,
          name: application.name,
          slug: application.slug
        }
      : null
  };
}
