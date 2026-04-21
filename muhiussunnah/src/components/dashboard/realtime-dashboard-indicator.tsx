"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@supabase/supabase-js";
import { LiveIndicator } from "@/components/ui/live-indicator";

export function RealtimeDashboardIndicator({ schoolId }: { schoolId: string }) {
  const router = useRouter();
  const t = useTranslations("realtime");
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
        () => handleChange(t("event_payment")),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "students", filter: `school_id=eq.${schoolId}` },
        () => handleChange(t("event_new_student")),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "admission_inquiries", filter: `school_id=eq.${schoolId}` },
        () => handleChange(t("event_admission_inquiry")),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId, router]);

  return (
    <div className="flex items-center gap-2">
      <LiveIndicator connected={connected} label={connected ? t("live") : t("offline")} />
      {lastEvent && (
        <span className="text-xs text-muted-foreground">{t("last_event")} {lastEvent}</span>
      )}
    </div>
  );
}
