"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select";

type ClassWithSections = { id: string; name_bn: string; sections: { id: string; name: string }[] };

type Props = {
  schoolSlug: string;
  classes: ClassWithSections[];
  initial: { class_id?: string; section_id?: string; status?: string; q?: string };
};

/**
 * Filter value encoding:
 *   "all"                → everyone
 *   "class:<classId>"    → one class (optionally all sections)
 *   "section:<sectionId>"→ one specific section
 *
 * We encode rather than using two selects because section is optional —
 * many schools only have 1 section per class, in which case the class row
 * is enough.
 */

export function StudentsFilters({ schoolSlug, classes, initial }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const t = useTranslations("studentsFilters");

  // Derive current encoded value from the URL
  const currentValue = initial.section_id
    ? `section:${initial.section_id}`
    : initial.class_id
      ? `class:${initial.class_id}`
      : "all";

  function updateFilter(encoded: string | null) {
    const value = encoded ?? "all";
    const next = new URLSearchParams(params);
    next.delete("class_id");
    next.delete("section_id");
    if (value.startsWith("section:")) {
      next.set("section_id", value.slice("section:".length));
    } else if (value.startsWith("class:")) {
      next.set("class_id", value.slice("class:".length));
    }
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
      {/* Name/ID search moved into the StudentsTable for real-time filtering.
          Class + status filters stay here because they trigger a server query. */}
      <Select value={currentValue} onValueChange={updateFilter}>
        <SelectTrigger className="h-10 w-60">
          <SelectValue placeholder={t("all_classes")}>
            {(v: unknown) => {
              const value = typeof v === "string" ? v : "";
              if (!value || value === "all") return t("all_classes");
              if (value.startsWith("class:")) {
                const id = value.slice("class:".length);
                const c = classes.find((x) => x.id === id);
                return c ? `📚 ${c.name_bn}` : t("all_classes");
              }
              if (value.startsWith("section:")) {
                const id = value.slice("section:".length);
                for (const c of classes) {
                  const s = c.sections.find((x) => x.id === id);
                  if (s) return `${c.name_bn} — ${t("section_prefix")} ${s.name}`;
                }
              }
              return t("all_classes");
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("all_classes")}</SelectItem>
          {classes.map((c) => {
            const hasMultiple = c.sections.length > 1;
            return (
              <SelectGroup key={c.id}>
                {/* Every class gets a row, even if it has one or zero sections.
                    Selecting it filters to all students in that class. */}
                <SelectItem value={`class:${c.id}`}>
                  📚 {c.name_bn}
                  {hasMultiple ? t("all_sections_suffix") : ""}
                </SelectItem>
                {hasMultiple
                  ? c.sections.map((s) => (
                      <SelectItem key={s.id} value={`section:${s.id}`}>
                        &nbsp;&nbsp;&nbsp;↳ {c.name_bn} — {t("section_prefix")} {s.name}
                      </SelectItem>
                    ))
                  : null}
              </SelectGroup>
            );
          })}
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
