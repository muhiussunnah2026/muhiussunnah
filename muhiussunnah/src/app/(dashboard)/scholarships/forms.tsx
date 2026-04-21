"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addScholarshipAction, assignScholarshipAction } from "@/server/actions/scholarships";
import type { ActionResult } from "@/server/actions/_helpers";

export function AddScholarshipForm({ schoolSlug }: { schoolSlug: string }) {
  const t = useTranslations("scholarships");
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(addScholarshipAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? t("form_success")); formRef.current?.reset(); }
    else toast.error(state.error);
  }, [state, t]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">{t("form_name")}</Label>
        <Input id="name" name="name" required placeholder={t("form_name_placeholder")} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">{t("form_description")}</Label>
        <Textarea id="description" name="description" rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="amount_type">{t("form_amount_type")}</Label>
          <Select name="amount_type" defaultValue="fixed">
            <SelectTrigger id="amount_type">
              <SelectValue>
                {(v: unknown) => {
                  const k = typeof v === "string" ? v : "fixed";
                  try { return t(`type_${k}`); } catch { return k; }
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">{t("type_fixed")}</SelectItem>
              <SelectItem value="percentage">{t("type_percentage")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="amount">{t("form_amount")}</Label>
          <Input id="amount" name="amount" type="number" min={0} step="0.01" required />
        </div>
      </div>
      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? t("form_pending") : t("form_submit")}
      </Button>
    </form>
  );
}

export function AssignScholarshipForm({ schoolSlug, scholarships, students }: {
  schoolSlug: string;
  scholarships: { id: string; name: string }[];
  students: { id: string; name_bn: string; student_code: string }[];
}) {
  const t = useTranslations("scholarships");
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(assignScholarshipAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? t("assign_success")); formRef.current?.reset(); }
    else toast.error(state.error);
  }, [state, t]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="scholarship_id">{t("assign_scholarship_label")}</Label>
        <Select name="scholarship_id" required>
          <SelectTrigger id="scholarship_id"><SelectValue placeholder={t("assign_placeholder")} /></SelectTrigger>
          <SelectContent>
            {scholarships.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="student_id">{t("assign_student_label")}</Label>
        <Select name="student_id" required>
          <SelectTrigger id="student_id"><SelectValue placeholder={t("assign_placeholder")} /></SelectTrigger>
          <SelectContent>
            {students.slice(0, 200).map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name_bn} ({s.student_code})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="valid_until">{t("assign_valid_until")}</Label>
        <Input id="valid_until" name="valid_until" type="date" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">{t("assign_notes")}</Label>
        <Textarea id="notes" name="notes" rows={2} />
      </div>
      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? t("assign_pending") : t("assign_submit")}
      </Button>
    </form>
  );
}
