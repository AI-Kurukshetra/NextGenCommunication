"use client";

import { useEffect, useState } from "react";
import { createClientBrowser } from "@/lib/supabase-browser";

export function useRealtimeCount(table: string) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const supabase = createClientBrowser();

    const channel = supabase
      .channel(`count-${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          setCount((value) => value + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table]);

  return count;
}
