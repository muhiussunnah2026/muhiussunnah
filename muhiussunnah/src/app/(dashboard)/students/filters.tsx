"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ClassWithSections = { id: string; name_bn: string; sections: { id: string; name: string }[] };

type Props = {
  schoolSlug: string;
  classes: ClassWithSections[];
  initial: { class_id?: string; section_id?: string; status?: string; q?: string };
};

/**
 * Class + status filters. The section concept is hidden in the UI per
 * the product decision to simplify — institutes that need multiple
 * sections create separate classes ("Class Five (A)", "Class Five (B)")
 * instead. Legacy URLs that still carry ?section_id= keep working on
 * the server side; this picker only exposes class-level filtering.
 */

export function StudentsFilters({ classes, initial }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const t = useTranslations("studentsFilters");

  const currentValue = initial.class_id ?? "all";

  function updateFilter(value: string | null) {
    const next = new URLSearchParams(params);
    next.delete("class_id");
    next.delete("section_id");
    if (value && value !== "all") next.set("class_id", value);
    router.push(`/students?${next.toString()}`);
  }

  function updateStatus(value: string | null) {
    const next = new URLSearchParams(params);
    if (value && value !== "all") next.set("status", value);
    else next.delete("status");
    router.push(`/students?${next.toString()}`);
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <Select value={currentValue} onValueChange={updateFilter}>
        <SelectTrigger className="h-10 w-60">
          <SelectValue placeholder={t("all_classes")}>
            {(v: unknown) => {
              const value = typeof v === "string" ? v : "";
              if (!value || value === "all") return t("all_classes");
              const c = classes.find((x) => x.id === value);
              return c ? `📚 ${c.name_bn}` : t("all_classes");
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("all_classes")}</SelectItem>
          {classes.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              📚 {c.name_bn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select defaultValue={initial.status ?? "active"} onValueChange={(v: string | null) => updateStatus(v)}>
        <SelectTrigger className="h-10 w-36">
          <SelectValue>
            {(v: unknown) => {
              const key = typeof v === "string" && v ? v : "active";
              try {
                return t(`status_${key}`);
              } catch {
                return key;
              }
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">{t("status_active")}</SelectItem>
          <SelectItem value="transferred">{t("status_transferred")}</SelectItem>
          <SelectItem value="passed_out">{t("status_passed_out")}</SelectItem>
          <SelectItem value="dropped">{t("status_dropped")}</SelectItem>
          <SelectItem value="all">{t("status_all")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
