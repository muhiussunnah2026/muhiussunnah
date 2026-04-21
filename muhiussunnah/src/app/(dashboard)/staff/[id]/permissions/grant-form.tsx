"use client";

import { useActionState, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { grantPermissionAction } from "@/server/actions/staff";
import type { ActionResult } from "@/server/actions/_helpers";

type ClassOption = { id: string; name_bn: string };
type SectionOption = { id: string; name: string; class_id: string; classes: { name_bn: string } };

type Props = {
  schoolSlug: string;
  schoolUserId: string;
  classes: ClassOption[];
  sections: SectionOption[];
};

export function GrantPermissionForm({ schoolSlug, schoolUserId, classes, sections }: Props) {
  const t = useTranslations("staff");
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(grantPermissionAction, null);
  const [scopeType, setScopeType] = useState<string>("school");

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? t("perm_granted"));
    else toast.error(state.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="school_user_id" value={schoolUserId} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="action">{t("perm_action_label")}</Label>
        <Select name="action" defaultValue="view">
          <SelectTrigger id="action"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="view">{t("perm_action_view")}</SelectItem>
            <SelectItem value="create">{t("perm_action_create")}</SelectItem>
            <SelectItem value="update">{t("perm_action_update")}</SelectItem>
            <SelectItem value="delete">{t("perm_action_delete")}</SelectItem>
            <SelectItem value="approve">{t("perm_action_approve")}</SelectItem>
            <SelectItem value="export">{t("perm_action_export")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="resource">{t("perm_resource_label")}</Label>
        <Select name="resource" defaultValue="student">
          <SelectTrigger id="resource"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="student">{t("perm_res_student")}</SelectItem>
            <SelectItem value="attendance">{t("perm_res_attendance")}</SelectItem>
            <SelectItem value="marks">{t("perm_res_marks")}</SelectItem>
            <SelectItem value="fee">{t("perm_res_fee")}</SelectItem>
            <SelectItem value="exam">{t("perm_res_exam")}</SelectItem>
            <SelectItem value="salary">{t("perm_res_salary")}</SelectItem>
            <SelectItem value="class">{t("perm_res_class")}</SelectItem>
            <SelectItem value="subject">{t("perm_res_subject")}</SelectItem>
            <SelectItem value="notice">{t("perm_res_notice")}</SelectItem>
            <SelectItem value="report_card">{t("perm_res_report_card")}</SelectItem>
            <SelectItem value="finance_report">{t("perm_res_finance_report")}</SelectItem>
            <SelectItem value="donation">{t("perm_res_donation")}</SelectItem>
            <SelectItem value="hifz">{t("perm_res_hifz")}</SelectItem>
            <SelectItem value="sabaq">{t("perm_res_sabaq")}</SelectItem>
            <SelectItem value="certificate">{t("perm_res_certificate")}</SelectItem>
            <SelectItem value="library">{t("perm_res_library")}</SelectItem>
            <SelectItem value="transport">{t("perm_res_transport")}</SelectItem>
            <SelectItem value="hostel">{t("perm_res_hostel")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="scope_type">{t("perm_scope_label")}</Label>
        <Select name="scope_type" value={scopeType} onValueChange={(v: string | null) => v && setScopeType(v)}>
          <SelectTrigger id="scope_type"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="school">{t("perm_scope_school")}</SelectItem>
            <SelectItem value="class">{t("perm_scope_class")}</SelectItem>
            <SelectItem value="section">{t("perm_scope_section")}</SelectItem>
            <SelectItem value="self">{t("perm_scope_self")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {scopeType === "class" ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="scope_id_class">{t("perm_scope_class_label")}</Label>
          <Select name="scope_id">
            <SelectTrigger id="scope_id_class"><SelectValue placeholder={t("perm_class_placeholder")} /></SelectTrigger>
            <SelectContent>
              {classes.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name_bn}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {scopeType === "section" ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="scope_id_section">{t("perm_scope_section_label")}</Label>
          <Select name="scope_id">
            <SelectTrigger id="scope_id_section"><SelectValue placeholder={t("perm_section_placeholder")} /></SelectTrigger>
            <SelectContent>
              {sections.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.classes.name_bn} — {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? t("perm_granting") : t("perm_grant_cta")}
      </Button>
    </form>
  );
}
