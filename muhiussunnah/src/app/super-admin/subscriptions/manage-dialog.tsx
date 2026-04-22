"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Settings2, CreditCard, Mail, KeyRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  updateSchoolSubscriptionAction,
  updateTenantAdminEmailAction,
  resetTenantAdminPasswordAction,
} from "./actions";

export type PlanOption = {
  id: string;
  name_bn: string;
  name_en: string;
  price_bdt: number;
};

type Props = {
  schoolId: string;
  schoolName: string;
  adminUserId: string | null;
  adminEmail: string;
  currentPlanId: string | null;
  currentStatus: string;
  currentTrialEndsAt: string | null;
  currentExpiresAt: string | null;
  currentIsPlatformOwned: boolean;
  plans: PlanOption[];
};

/** ISO → yyyy-MM-dd string accepted by <input type="date" />. */
function toDateInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

const STATUSES = ["trial", "active", "past_due", "canceled", "suspended"] as const;

export function ManageSchoolDialog(props: Props) {
  const t = useTranslations("superAdmin");
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <Settings2 className="me-1.5 size-3.5" />
        {t("manage_cta")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-gradient-primary text-white">
              <Settings2 className="size-4" />
            </span>
            {t("manage_title", { name: props.schoolName })}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="plan" className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="plan" className="flex-1">
              <CreditCard className="me-1.5 size-3.5" />
              {t("manage_tab_plan")}
            </TabsTrigger>
            <TabsTrigger value="email" className="flex-1" disabled={!props.adminUserId}>
              <Mail className="me-1.5 size-3.5" />
              {t("manage_tab_email")}
            </TabsTrigger>
            <TabsTrigger value="password" className="flex-1" disabled={!props.adminUserId}>
              <KeyRound className="me-1.5 size-3.5" />
              {t("manage_tab_password")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plan" className="pt-4">
            <PlanForm {...props} onDone={() => setOpen(false)} />
          </TabsContent>
          <TabsContent value="email" className="pt-4">
            {props.adminUserId ? (
              <EmailForm
                schoolId={props.schoolId}
                userId={props.adminUserId}
                currentEmail={props.adminEmail}
                onDone={() => setOpen(false)}
              />
            ) : (
              <p className="text-sm text-muted-foreground">{t("manage_no_admin")}</p>
            )}
          </TabsContent>
          <TabsContent value="password" className="pt-4">
            {props.adminUserId ? (
              <PasswordForm
                schoolId={props.schoolId}
                userId={props.adminUserId}
                onDone={() => setOpen(false)}
              />
            ) : (
              <p className="text-sm text-muted-foreground">{t("manage_no_admin")}</p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
      </Dialog>
    </>
  );
}

// -------------------- Plan form --------------------

function PlanForm({
  schoolId,
  currentPlanId,
  currentStatus,
  currentTrialEndsAt,
  currentExpiresAt,
  currentIsPlatformOwned,
  plans,
  onDone,
}: Props & { onDone: () => void }) {
  const t = useTranslations("superAdmin");
  const [state, action, pending] = useActionState(updateSchoolSubscriptionAction, null);
  const [planId, setPlanId] = useState(currentPlanId ?? "");
  const [status, setStatus] = useState(currentStatus);
  const [platformOwned, setPlatformOwned] = useState(currentIsPlatformOwned);

  useEffect(() => {
    if (state?.ok) {
      toast.success(state.message ?? t("manage_saved"));
      onDone();
    } else if (state && !state.ok) {
      toast.error(state.error);
    }
  }, [state, onDone, t]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolId" value={schoolId} />
      <input type="hidden" name="planId" value={planId} />
      <input type="hidden" name="status" value={status} />
      <input
        type="hidden"
        name="isPlatformOwned"
        value={platformOwned ? "true" : "false"}
      />

      <div className="flex flex-col gap-1.5">
        <Label>{t("manage_plan_label")}</Label>
        <Select value={planId} onValueChange={(v) => setPlanId(v ?? "")}>
          <SelectTrigger className="w-full justify-between">
            <span className="flex-1 text-left">
              {(() => {
                const current = plans.find((p) => p.id === planId);
                if (!current) return t("manage_plan_none");
                return `${current.name_bn} · ৳${Number(current.price_bdt).toLocaleString("en-IN")}`;
              })()}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">— {t("manage_plan_none")} —</SelectItem>
            {plans.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name_bn} · ৳{Number(p.price_bdt).toLocaleString("en-IN")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>{t("manage_status_label")}</Label>
        <Select value={status} onValueChange={(v) => setStatus(v ?? status)}>
          <SelectTrigger className="w-full justify-between">
            <span className="flex-1 text-left">
              {t(`subs_status_${status}` as Parameters<typeof t>[0])}
            </span>
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`subs_status_${s}` as Parameters<typeof t>[0])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="trialEndsAt">{t("manage_trial_end_label")}</Label>
          <Input
            id="trialEndsAt"
            name="trialEndsAt"
            type="date"
            defaultValue={toDateInput(currentTrialEndsAt)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="subscriptionExpiresAt">{t("manage_expires_label")}</Label>
          <Input
            id="subscriptionExpiresAt"
            name="subscriptionExpiresAt"
            type="date"
            defaultValue={toDateInput(currentExpiresAt)}
          />
        </div>
      </div>

      <label className="mt-1 flex cursor-pointer items-start gap-3 rounded-lg border border-primary/25 bg-gradient-to-br from-primary/5 to-transparent p-3 hover:border-primary/40">
        <input
          type="checkbox"
          checked={platformOwned}
          onChange={(e) => setPlatformOwned(e.target.checked)}
          className="mt-0.5 size-4 accent-primary"
        />
        <div className="flex-1">
          <div className="text-sm font-medium">{t("manage_platform_owned_label")}</div>
          <div className="text-xs text-muted-foreground">
            {t("manage_platform_owned_hint")}
          </div>
        </div>
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>
          {t("manage_cancel")}
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? t("manage_saving") : t("manage_save")}
        </Button>
      </div>
    </form>
  );
}

// -------------------- Email form --------------------

function EmailForm({
  schoolId,
  userId,
  currentEmail,
  onDone,
}: {
  schoolId: string;
  userId: string;
  currentEmail: string;
  onDone: () => void;
}) {
  const t = useTranslations("superAdmin");
  const [state, action, pending] = useActionState(updateTenantAdminEmailAction, null);

  useEffect(() => {
    if (state?.ok) {
      toast.success(state.message ?? t("manage_saved"));
      onDone();
    } else if (state && !state.ok) {
      toast.error(state.error);
    }
  }, [state, onDone, t]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolId" value={schoolId} />
      <input type="hidden" name="userId" value={userId} />

      <div className="flex flex-col gap-1.5">
        <Label>{t("manage_current_email_label")}</Label>
        <Input value={currentEmail} disabled readOnly />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newEmail">{t("manage_new_email_label")}</Label>
        <Input
          id="newEmail"
          name="newEmail"
          type="email"
          required
          placeholder="principal@school.com"
        />
        <p className="text-xs text-muted-foreground">{t("manage_email_hint")}</p>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>
          {t("manage_cancel")}
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? t("manage_saving") : t("manage_change_email")}
        </Button>
      </div>
    </form>
  );
}

// -------------------- Password form --------------------

function PasswordForm({
  schoolId,
  userId,
  onDone,
}: {
  schoolId: string;
  userId: string;
  onDone: () => void;
}) {
  const t = useTranslations("superAdmin");
  const [state, action, pending] = useActionState(resetTenantAdminPasswordAction, null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (state?.ok) {
      toast.success(state.message ?? t("manage_saved"));
      onDone();
    } else if (state && !state.ok) {
      toast.error(state.error);
    }
  }, [state, onDone, t]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolId" value={schoolId} />
      <input type="hidden" name="userId" value={userId} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newPassword">{t("manage_new_password_label")}</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type={shown ? "text" : "password"}
          required
          minLength={6}
          placeholder="••••••••"
        />
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={shown}
            onChange={(e) => setShown(e.target.checked)}
          />
          {t("manage_show_password")}
        </label>
        <p className="text-xs text-muted-foreground">{t("manage_password_hint")}</p>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>
          {t("manage_cancel")}
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? t("manage_saving") : t("manage_reset_password")}
        </Button>
      </div>
    </form>
  );
}
