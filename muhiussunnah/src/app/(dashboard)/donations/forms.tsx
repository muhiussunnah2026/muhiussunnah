"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addCampaignAction, addDonationAction } from "@/server/actions/donations";
import type { ActionResult } from "@/server/actions/_helpers";

export function AddCampaignForm({ schoolSlug }: { schoolSlug: string }) {
  const t = useTranslations("donations");
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(addCampaignAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? t("campaign_success")); formRef.current?.reset(); }
    else toast.error(state.error);
  }, [state, t]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">{t("campaign_title")}</Label>
        <Input id="title" name="title" required placeholder={t("campaign_title_placeholder")} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">{t("campaign_description")}</Label>
        <Textarea id="description" name="description" rows={2} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="target_amount">{t("campaign_target")}</Label>
        <Input id="target_amount" name="target_amount" type="number" min={0} step="0.01" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="start_date">{t("campaign_start")}</Label>
          <Input id="start_date" name="start_date" type="date" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="end_date">{t("campaign_end")}</Label>
          <Input id="end_date" name="end_date" type="date" />
        </div>
      </div>
      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? t("campaign_pending") : t("campaign_submit")}
      </Button>
    </form>
  );
}

export function AddDonationForm({ schoolSlug, campaigns }: { schoolSlug: string; campaigns: { id: string; title: string }[] }) {
  const t = useTranslations("donations");
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(addDonationAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? t("donation_success")); formRef.current?.reset(); }
    else toast.error(state.error);
  }, [state, t]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      {campaigns.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="campaign_id">{t("donation_campaign_label")}</Label>
          <Select name="campaign_id">
            <SelectTrigger id="campaign_id"><SelectValue placeholder={t("donation_no_campaign")} /></SelectTrigger>
            <SelectContent>
              {campaigns.map((c) => (<SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="donor_name">{t("donation_donor_name")}</Label>
        <Input id="donor_name" name="donor_name" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="donor_phone">{t("donation_donor_phone")}</Label>
        <Input id="donor_phone" name="donor_phone" type="tel" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="amount">{t("donation_amount")}</Label>
        <Input id="amount" name="amount" type="number" min={0.01} step="0.01" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="method">{t("donation_method")}</Label>
        <Select name="method" defaultValue="cash">
          <SelectTrigger id="method">
            <SelectValue>
              {(v: unknown) => {
                const k = typeof v === "string" ? v : "cash";
                try { return t(`method_${k}`); } catch { return k; }
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">{t("method_cash")}</SelectItem>
            <SelectItem value="bkash">{t("method_bkash")}</SelectItem>
            <SelectItem value="nagad">{t("method_nagad")}</SelectItem>
            <SelectItem value="rocket">Rocket</SelectItem>
            <SelectItem value="bank_transfer">{t("method_bank_transfer")}</SelectItem>
            <SelectItem value="cheque">{t("method_cheque")}</SelectItem>
            <SelectItem value="other">{t("method_other")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <label className="inline-flex items-center gap-2 text-sm">
        <Checkbox name="is_anonymous" /> {t("donation_anonymous_label")}
      </label>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">{t("donation_notes")}</Label>
        <Textarea id="notes" name="notes" rows={2} />
      </div>
      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? t("donation_pending") : t("donation_submit")}
      </Button>
    </form>
  );
}
