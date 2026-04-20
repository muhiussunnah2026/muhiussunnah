"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateTicketStatusAction } from "@/server/actions/support";
import type { ActionResult } from "@/server/actions/_helpers";

type Props = { schoolSlug: string; ticketId: string; currentStatus: string };

const statuses: { value: string; label: string; variant?: "default" | "outline" | "secondary" }[] = [
  { value: "open", label: "খোলা", variant: "outline" },
  { value: "in_progress", label: "চলমান", variant: "outline" },
  { value: "waiting", label: "অপেক্ষমান", variant: "outline" },
  { value: "resolved", label: "সমাধান", variant: "default" },
  { value: "closed", label: "বন্ধ", variant: "secondary" },
];

export function StatusButtons({ schoolSlug, ticketId, currentStatus }: Props) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(updateTicketStatusAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? "আপডেট");
    else toast.error(state.error);
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
