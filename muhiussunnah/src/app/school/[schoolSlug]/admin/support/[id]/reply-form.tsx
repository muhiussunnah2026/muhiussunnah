"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { replyTicketAction } from "@/server/actions/support";
import type { ActionResult } from "@/server/actions/_helpers";

export function ReplyForm({ schoolSlug, ticketId }: { schoolSlug: string; ticketId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(replyTicketAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? "পাঠান ো হয়েছে"); formRef.current?.reset(); }
    else toast.error(state.error);
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="ticket_id" value={ticketId} />
      <Textarea name="body" rows={4} required placeholder="উত্তর লিখুন..." />
      <Button type="submit" disabled={pending} className="bg-gradient-primary text-white self-end">
        {pending ? "..." : "উত্তর পাঠান"}
      </Button>
    </form>
  );
}
