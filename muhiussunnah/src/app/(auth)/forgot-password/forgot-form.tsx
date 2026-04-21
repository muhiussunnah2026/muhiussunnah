"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordAction, type ActionResult } from "@/server/actions/auth";

export function ForgotPasswordForm() {
  const t = useTranslations("forgotPassword");
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    forgotPasswordAction,
    null,
  );

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? t("form_sent"));
    else toast.error(state.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t("form_email_label")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
        />
      </div>
      <Button type="submit" disabled={pending} className="bg-gradient-primary text-white">
        {pending ? t("form_sending") : t("form_cta")}
      </Button>
    </form>
  );
}
