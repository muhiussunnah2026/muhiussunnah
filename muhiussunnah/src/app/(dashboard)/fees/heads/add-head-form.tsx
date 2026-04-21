"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addFeeHeadAction } from "@/server/actions/fees";
import type { ActionResult } from "@/server/actions/_helpers";

export function AddFeeHeadForm({ schoolSlug }: { schoolSlug: string }) {
  const t = useTranslations("fees");
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(addFeeHeadAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? t("add_head_success")); formRef.current?.reset(); }
    else toast.error(state.error);
  }, [state, t]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name_bn">{t("add_head_name_bn")}</Label>
        <Input id="name_bn" name="name_bn" required placeholder={t("add_head_name_placeholder")} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name_en">Name (English)</Label>
        <Input id="name_en" name="name_en" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="type">{t("add_head_type")}</Label>
          <Select name="type" defaultValue="general">
            <SelectTrigger id="type">
              <SelectValue>
                {(v: unknown) => {
                  const k = typeof v === "string" ? v : "general";
                  try { return t(`head_type_${k}`); } catch { return k; }
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">{t("head_type_general")}</SelectItem>
              <SelectItem value="admission">{t("head_type_admission")}</SelectItem>
              <SelectItem value="session">{t("head_type_session")}</SelectItem>
              <SelectItem value="exam">{t("head_type_exam")}</SelectItem>
              <SelectItem value="transport">{t("head_type_transport")}</SelectItem>
              <SelectItem value="hostel">{t("head_type_hostel")}</SelectItem>
              <SelectItem value="canteen">{t("head_type_canteen")}</SelectItem>
              <SelectItem value="other">{t("head_type_other")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="frequency">{t("add_head_frequency")}</Label>
          <Select name="frequency">
            <SelectTrigger id="frequency">
              <SelectValue placeholder="—">
                {(v: unknown) => {
                  const k = typeof v === "string" ? v : "";
                  if (!k) return "—";
                  try { return t(`freq_${k}`); } catch { return k; }
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">{t("freq_monthly")}</SelectItem>
              <SelectItem value="quarterly">{t("freq_quarterly")}</SelectItem>
              <SelectItem value="annual">{t("freq_annual")}</SelectItem>
              <SelectItem value="one_time">{t("freq_one_time")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="default_amount">{t("add_head_default_amount")}</Label>
        <Input id="default_amount" name="default_amount" type="number" min={0} step="0.01" defaultValue={0} />
      </div>
      <label className="inline-flex items-center gap-2 text-sm">
        <Checkbox name="is_recurring" /> {t("add_head_recurring")}
      </label>
      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? t("add_head_pending") : t("add_head_submit")}
      </Button>
    </form>
  );
}
