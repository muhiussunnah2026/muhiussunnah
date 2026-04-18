"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, Hash, User, Mail, Phone, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registerSchoolAction, type ActionResult } from "@/server/actions/auth";
import type { RegisterPageCopy } from "@/lib/i18n/pages";

const inputCls =
  "h-12 rounded-xl bg-card/50 border-border/70 px-3.5 text-sm transition-all focus-visible:bg-card focus-visible:border-primary/50 focus-visible:shadow-lg focus-visible:shadow-primary/10 hover:border-border";
const inputWithIconCls =
  "h-12 rounded-xl bg-card/50 border-border/70 ps-11 pe-3.5 text-sm transition-all focus-visible:bg-card focus-visible:border-primary/50 focus-visible:shadow-lg focus-visible:shadow-primary/10 hover:border-border";
const labelCls = "text-sm font-semibold text-foreground/90";
const iconCls =
  "pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground";

export function RegisterSchoolForm({ copy }: { copy: RegisterPageCopy }) {
  const router = useRouter();
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    registerSchoolAction,
    null,
  );

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message ?? copy.registerSuccessFallback);
      if (state.redirect) router.push(state.redirect);
    } else {
      toast.error(state.error);
    }
  }, [state, router, copy.registerSuccessFallback]);

  return (
    <form action={action} className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-5">
        <legend className="sr-only">{copy.schoolInfoLegend}</legend>

        <div className="flex flex-col gap-2">
          <Label htmlFor="school_name_bn" className={labelCls}>{copy.schoolNameBnLabel}</Label>
          <div className="relative">
            <Building2 className={iconCls} />
            <Input
              id="school_name_bn"
              name="school_name_bn"
              required
              placeholder={copy.schoolNameBnPlaceholder}
              className={inputWithIconCls}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="school_name_en" className={labelCls}>{copy.schoolNameEnLabel}</Label>
          <div className="relative">
            <Building2 className={iconCls} />
            <Input
              id="school_name_en"
              name="school_name_en"
              placeholder={copy.schoolNameEnPlaceholder}
              className={inputWithIconCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="school_type" className={labelCls}>{copy.schoolTypeLabel}</Label>
            <Select name="school_type" defaultValue="school">
              <SelectTrigger id="school_type" className={inputCls + " data-[placeholder]:text-muted-foreground"}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="school">{copy.schoolTypeSchool}</SelectItem>
                <SelectItem value="madrasa">{copy.schoolTypeMadrasa}</SelectItem>
                <SelectItem value="both">{copy.schoolTypeBoth}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="eiin" className={labelCls}>{copy.eiinLabel}</Label>
            <div className="relative">
              <Hash className={iconCls} />
              <Input id="eiin" name="eiin" inputMode="numeric" className={inputWithIconCls} />
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-5 border-t border-border/60 pt-5">
        <legend className="sr-only">{copy.adminInfoLegend}</legend>

        <div className="flex flex-col gap-2">
          <Label htmlFor="admin_full_name" className={labelCls}>{copy.adminNameLabel}</Label>
          <div className="relative">
            <User className={iconCls} />
            <Input id="admin_full_name" name="admin_full_name" required className={inputWithIconCls} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="admin_email" className={labelCls}>{copy.emailLabel}</Label>
            <div className="relative">
              <Mail className={iconCls} />
              <Input
                id="admin_email"
                name="admin_email"
                type="email"
                required
                autoComplete="email"
                className={inputWithIconCls}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="admin_phone" className={labelCls}>{copy.phoneLabel}</Label>
            <div className="relative">
              <Phone className={iconCls} />
              <Input
                id="admin_phone"
                name="admin_phone"
                type="tel"
                inputMode="tel"
                className={inputWithIconCls}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="admin_password" className={labelCls}>{copy.passwordLabel}</Label>
          <div className="relative">
            <Lock className={iconCls} />
            <Input
              id="admin_password"
              name="admin_password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="••••••••"
              className={inputWithIconCls}
            />
          </div>
        </div>
      </fieldset>

      {state && !state.ok ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        className="mt-1 h-12 rounded-xl bg-gradient-primary animate-gradient text-white text-base font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all"
      >
        {pending ? copy.submitPending : copy.submitIdle}
      </Button>

      <p className="text-center text-xs text-muted-foreground">{copy.termsNote}</p>
    </form>
  );
}
