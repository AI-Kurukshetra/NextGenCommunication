"use client";

import { useRealtimeCount } from "@/hooks/use-realtime-count";

export function RealtimeIndicator() {
  const messageEvents = useRealtimeCount("messages");
  const callEvents = useRealtimeCount("calls");

  return (
    <div className="rounded-md border bg-card px-3 py-2 text-xs text-muted-foreground">
      Realtime updates: messages +{messageEvents}, calls +{callEvents}
    </div>
  );
}
