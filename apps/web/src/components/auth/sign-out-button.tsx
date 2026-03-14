"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClientBrowser } from "@/lib/supabase-browser";
import { cn } from "@/lib/utils";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    setIsLoading(true);

    try {
      const supabase = createClientBrowser();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button variant="secondary" onClick={handleSignOut} disabled={isLoading} className={cn("w-full", className)}>
      {isLoading ? "Signing out..." : "Sign out"}
    </Button>
  );
}
