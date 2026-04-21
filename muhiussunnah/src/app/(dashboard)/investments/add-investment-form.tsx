"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addInvestmentAction } from "@/server/actions/investments";
import type { ActionResult } from "@/server/actions/_helpers";

export function AddInvestmentForm({ schoolSlug }: { schoolSlug: string }) {
  const t = useTranslations("investments");
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(addInvestmentAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? t("form_success")); formRef.current?.reset(); }
    else toast.error(state.error);
  }, [state, t]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">{t("form_title")}</Label>
        <Input id="title" name="title" required placeholder={t("form_title_placeholder")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="principal">{t("form_principal")}</Label>
          <Input id="principal" name="principal" type="number" min={0.01} step="0.01" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="return_expected">{t("form_return_expected")}</Label>
          <Input id="return_expected" name="return_expected" type="number" min={0} step="0.01" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="start_date">{t("form_start_date")}</Label>
          <Input id="start_date" name="start_date" type="date" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="maturity_date">{t("form_maturity_date")}</Label>
          <Input id="maturity_date" name="maturity_date" type="date" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">{t("form_notes")}</Label>
        <Textarea id="notes" name="notes" rows={2} />
      </div>
      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? t("form_pending") : t("form_submit")}
      </Button>
    </form>
  );
}
