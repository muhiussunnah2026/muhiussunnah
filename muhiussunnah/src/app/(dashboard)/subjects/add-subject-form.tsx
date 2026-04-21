"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addSubjectAction } from "@/server/actions/academic";
import type { ActionResult } from "@/server/actions/_helpers";

type ClassOption = { id: string; name_bn: string; name_en: string | null };

type Props = { schoolSlug: string; classes: ClassOption[] };

export function AddSubjectForm({ schoolSlug, classes }: Props) {
  const t = useTranslations("subjects");
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(addSubjectAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? t("add_ok"));
    else toast.error(state.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name_bn">{t("add_name_bn")}</Label>
        <Input id="name_bn" name="name_bn" required placeholder={t("add_name_bn_placeholder")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name_en">{t("add_name_en")}</Label>
          <Input id="name_en" name="name_en" placeholder="Bengali" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name_ar">{t("add_name_ar")}</Label>
          <Input id="name_ar" name="name_ar" placeholder="اللغة" dir="rtl" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="class_id">{t("add_class_label")}</Label>
        <Select name="class_id">
          <SelectTrigger id="class_id">
            <SelectValue placeholder={t("add_class_placeholder")} />
          </SelectTrigger>
          <SelectContent>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name_bn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="code">{t("add_code_label")}</Label>
          <Input id="code" name="code" placeholder="BN101" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="full_marks">{t("add_full_marks_label")}</Label>
          <Input id="full_marks" name="full_marks" type="number" min={1} defaultValue={100} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pass_marks">{t("add_pass_marks_label")}</Label>
          <Input id="pass_marks" name="pass_marks" type="number" min={0} defaultValue={33} />
        </div>
      </div>

      <label className="inline-flex items-center gap-2 text-sm">
        <Checkbox name="is_optional" />
        {t("add_optional_label")}
      </label>

      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? t("add_adding") : t("add_cta")}
      </Button>
    </form>
  );
}
