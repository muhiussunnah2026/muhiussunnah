"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateTicketStatusAction } from "@/server/actions/support";
import type { ActionResult } from "@/server/actions/_helpers";

type Props = { schoolSlug: string; ticketId: string; currentStatus: string };

export function StatusButtons({ schoolSlug, ticketId, currentStatus }: Props) {
  const t = useTranslations("tickets");
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(updateTicketStatusAction, null);

  const statuses: { value: string; label: string }[] = [
    { value: "open", label: t("status_open") },
    { value: "in_progress", label: t("status_in_progress") },
    { value: "waiting", label: t("status_waiting") },
    { value: "resolved", label: t("status_resolved") },
    { value: "closed", label: t("status_closed") },
  ];

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? t("status_updated"));
    else toast.error(state.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div className="flex flex-col gap-2">
      {statuses.map((s) => (
        <form key={s.value} action={action}>
          <input type="hidden" name="schoolSlug" value={schoolSlug} />
          <input type="hidden" name="ticket_id" value={ticketId} />
          <input type="hidden" name="status" value={s.value} />
          <Button
            type="submit"
            size="sm"
            variant={currentStatus === s.value ? "default" : "outline"}
            disabled={pending || currentStatus === s.value}
            className={`w-full ${currentStatus === s.value ? "bg-gradient-primary text-white" : ""}`}
          >
            {currentStatus === s.value ? "✓ " : ""}{s.label}
          </Button>
        </form>
      ))}
    </div>
  );
}
