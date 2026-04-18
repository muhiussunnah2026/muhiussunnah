"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { LiveIndicator } from "@/components/ui/live-indicator";

/**
 * Realtime dashboard indicator — subscribes to postgres_changes on key tenant
 * tables and triggers a router refresh when new rows arrive. This is the
 * Phase 6 realtime layer on the admin dashboard.
 *
 * Rate-limit refresh to once every 3s to avoid thrashing.
 */
export function RealtimeDashboardIndicator({ schoolId }: { schoolId: string }) {
  const router = useRouter();
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;

    const supabase = createClient(url, key);
    let lastRefresh = 0;

    const ch = supabase
      .channel(`school-${schoolId}-realtime`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments", filter: `school_id=eq.${schoolId}` },
        () => handleChange("ফি পেমেন্ট"),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "students", filter: `school_id=eq.${schoolId}` },
        () => handleChange("নতুন ছাত্র"),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "admission_inquiries", filter: `school_id=eq.${schoolId}` },
        () => handleChange("ভর্তি জিজ্ঞাসা"),
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    function handleChange(label: string) {
      setLastEvent(label);
      const now = Date.now();
      if (now - lastRefresh > 3000) {
        lastRefresh = now;
        router.refresh();
      }
    }

    return () => {
      supabase.removeChannel(ch);
    };
  }, [schoolId, router]);

  return (
    <div className="flex items-center gap-2">
      <LiveIndicator connected={connected} label={connected ? "লাইভ" : "অফলাইন"} />
      {lastEvent && (
        <span className="text-xs text-muted-foreground">· সর্বশেষ: {lastEvent}</span>
      )}
    </div>
  );
}
