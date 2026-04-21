"use client";

import { useActionState, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { markSalaryPaidAction } from "@/server/actions/payroll";
import type { ActionResult } from "@/server/actions/_helpers";

export function MarkPaidButton({ schoolSlug, id }: { schoolSlug: string; id: string }) {
  const t = useTranslations("payroll");
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(markSalaryPaidAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? t("mark_paid_success")); setOpen(false); }
    else toast.error(state.error);
  }, [state, t]);

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        {t("mark_paid_button")}
      </Button>
    );
  }

  return (
    <form action={action} className="flex items-center gap-1">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="id" value={id} />
      <Input name="paid_on" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="h-8 w-36" />
      <Select name="payment_method" defaultValue="cash">
        <SelectTrigger className="h-8 w-24"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="cash">{t("mark_paid_cash")}</SelectItem>
          <SelectItem value="bkash">{t("mark_paid_bkash")}</SelectItem>
          <SelectItem value="bank_transfer">{t("mark_paid_bank")}</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" size="sm" disabled={pending} className="bg-gradient-primary text-white">
        {pending ? t("mark_paid_pending") : "✓"}
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>✕</Button>
    </form>
  );
}
