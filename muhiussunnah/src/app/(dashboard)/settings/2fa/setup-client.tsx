"use client";

import { useActionState, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Shield, ShieldCheck, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { setupTotpAction, verifyTotpAction, disableTotpAction } from "@/server/actions/totp";

type Existing = { verified: boolean };

export function TwoFactorSetup({ schoolSlug, existing }: { schoolSlug: string; existing: Existing | null }) {
  const t = useTranslations("settings");
  const [setupState, setupAction, setupPending] = useActionState(setupTotpAction, null);
  const [verifyState, verifyAction, verifyPending] = useActionState(verifyTotpAction, null);
  const [disableState, disableAction, disablePending] = useActionState(disableTotpAction, null);
  const [setup, setSetup] = useState<{ secret: string; uri: string; recovery: string[] } | null>(null);

  useEffect(() => {
    if (!setupState) return;
    if (setupState.ok && setupState.data) {
      setSetup(setupState.data);
      toast.success(setupState.message ?? t("twofa_setup_started"));
    } else if (!setupState.ok) {
      toast.error(setupState.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setupState]);

  useEffect(() => {
    if (!verifyState) return;
    if (verifyState.ok) { toast.success(verifyState.message ?? t("twofa_enabled_toast")); setSetup(null); }
    else toast.error(verifyState.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifyState]);

  useEffect(() => {
    if (!disableState) return;
    if (disableState.ok) toast.success(disableState.message ?? t("twofa_disabled_toast"));
    else toast.error(disableState.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disableState]);

  if (existing?.verified && !setup) {
    return (
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-success/10 text-success">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold">{t("twofa_active_title")}</h3>
              <p className="text-xs text-muted-foreground">{t("twofa_active_body")}</p>
            </div>
            <Badge className="ms-auto bg-success/10 text-success hover:bg-success/20" variant="secondary">
              {t("twofa_active_badge")}
            </Badge>
          </div>
          <form action={disableAction}>
            <input type="hidden" name="schoolSlug" value={schoolSlug} />
            <Button type="submit" variant="destructive" size="sm" disabled={disablePending}>
              <ShieldOff className="me-1.5 size-4" />
              {disablePending ? t("twofa_disabling") : t("twofa_disable_cta")}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (setup) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(setup.uri)}`;
    return (
      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold">{t("twofa_step1_title")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("twofa_step1_body")}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrUrl} alt="TOTP QR" className="border rounded-lg bg-white p-2" width={220} height={220} />

          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground">{t("twofa_manual_entry")}</summary>
            <code className="mt-2 block rounded bg-muted p-2 break-all">{setup.secret}</code>
          </details>

          <hr />

          <h3 className="font-semibold">{t("twofa_step2_title")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("twofa_step2_body")}
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm font-mono">
            {setup.recovery.map((c) => (
              <code key={c} className="rounded bg-muted px-2 py-1">{c}</code>
            ))}
          </div>

          <hr />

          <h3 className="font-semibold">{t("twofa_step3_title")}</h3>
          <form action={verifyAction} className="space-y-3">
            <input type="hidden" name="schoolSlug" value={schoolSlug} />
            <div>
              <Label>{t("twofa_code_label")}</Label>
              <Input name="code" placeholder="123456" maxLength={6} inputMode="numeric" required />
            </div>
            <Button type="submit" disabled={verifyPending} className="w-full">
              {verifyPending ? t("twofa_verifying") : t("twofa_verify_cta")}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-warning/10 text-warning-foreground dark:text-warning">
            <Shield className="size-5" />
          </div>
          <div>
            <h3 className="font-semibold">{t("twofa_init_title")}</h3>
            <p className="text-xs text-muted-foreground">{t("twofa_init_body")}</p>
          </div>
        </div>
        <form action={setupAction}>
          <input type="hidden" name="schoolSlug" value={schoolSlug} />
          <Button type="submit" disabled={setupPending}>
            <Shield className="me-1.5 size-4" />
            {setupPending ? t("twofa_setting_up") : t("twofa_start_cta")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
