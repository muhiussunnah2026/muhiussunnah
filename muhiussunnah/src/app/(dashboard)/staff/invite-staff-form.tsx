"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { inviteStaffAction } from "@/server/actions/staff";
import type { ActionResult } from "@/server/actions/_helpers";

type Branch = { id: string; name: string };
type Props = { schoolSlug: string; branches: Branch[] };

export function InviteStaffForm({ schoolSlug, branches }: Props) {
  const t = useTranslations("staff");
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(inviteStaffAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message ?? t("invite_added"));
      formRef.current?.reset();
    } else toast.error(state.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="full_name_bn">{t("invite_name_label")}</Label>
        <Input id="full_name_bn" name="full_name_bn" required placeholder={t("invite_name_placeholder")} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">{t("invite_email_label")}</Label>
          <Input id="email" name="email" type="email" required placeholder="teacher@school.com" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">{t("invite_phone_label")}</Label>
          <Input id="phone" name="phone" type="tel" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="role">{t("invite_role_label")}</Label>
          <Select name="role" defaultValue="CLASS_TEACHER">
            <SelectTrigger id="role"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="SCHOOL_ADMIN">{t("role_SCHOOL_ADMIN")}</SelectItem>
              <SelectItem value="VICE_PRINCIPAL">{t("role_VICE_PRINCIPAL")}</SelectItem>
              <SelectItem value="ACCOUNTANT">{t("role_ACCOUNTANT")}</SelectItem>
              <SelectItem value="BRANCH_ADMIN">{t("role_BRANCH_ADMIN")}</SelectItem>
              <SelectItem value="CLASS_TEACHER">{t("role_CLASS_TEACHER")}</SelectItem>
              <SelectItem value="SUBJECT_TEACHER">{t("role_SUBJECT_TEACHER")}</SelectItem>
              <SelectItem value="MADRASA_USTADH">{t("role_MADRASA_USTADH")}</SelectItem>
              <SelectItem value="LIBRARIAN">{t("role_LIBRARIAN")}</SelectItem>
              <SelectItem value="TRANSPORT_MANAGER">{t("role_TRANSPORT_MANAGER")}</SelectItem>
              <SelectItem value="HOSTEL_WARDEN">{t("role_HOSTEL_WARDEN")}</SelectItem>
              <SelectItem value="CANTEEN_MANAGER">{t("role_CANTEEN_MANAGER")}</SelectItem>
              <SelectItem value="COUNSELOR">{t("role_COUNSELOR")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="employee_code">{t("invite_code_label")}</Label>
          <Input id="employee_code" name="employee_code" placeholder="EMP-001" />
        </div>
      </div>

      {branches.length > 1 ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="branch_id">{t("invite_branch_label")}</Label>
          <Select name="branch_id">
            <SelectTrigger id="branch_id"><SelectValue placeholder={t("invite_branch_all")} /></SelectTrigger>
            <SelectContent>
              {branches.map((b) => (<SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? t("invite_sending") : t("invite_cta")}
      </Button>
      <p className="text-xs text-muted-foreground">
        {t("invite_help")}
      </p>
    </form>
  );
}
