"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { replyTicketAction } from "@/server/actions/support";
import type { ActionResult } from "@/server/actions/_helpers";

export function ReplyForm({ schoolSlug, ticketId }: { schoolSlug: string; ticketId: string }) {
  const t = useTranslations("tickets");
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(replyTicketAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? t("reply_sent")); formRef.current?.reset(); }
    else toast.error(state.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="ticket_id" value={ticketId} />
      <Textarea name="body" rows={4} required placeholder={t("reply_placeholder")} />
      <Button type="submit" disabled={pending} className="bg-gradient-primary text-white self-end">
        {pending ? t("reply_sending") : t("reply_cta")}
      </Button>
    </form>
  );
}
