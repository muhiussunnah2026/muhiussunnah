"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";

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
    router.push(`/school/${schoolSlug}/admin/students?${next.toString()}`);
  }

  function updateStatus(value: string | null) {
    const next = new URLSearchParams(params);
    if (value && value !== "all") next.set("status", value);
    else next.delete("status");
    router.push(`/school/${schoolSlug}/admin/students?${next.toString()}`);
  }

  function updateQuery(value: string | null) {
    const next = new URLSearchParams(params);
    if (value) next.set("q", value);
    else next.delete("q");
    router.push(`/school/${schoolSlug}/admin/students?${next.toString()}`);
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <Input
        placeholder="নামে খুঁজুন..."
        defaultValue={initial.q ?? ""}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            updateQuery((e.target as HTMLInputElement).value || null);
          }
        }}
        className="h-10 w-56"
      />

      <Select value={currentValue} onValueChange={updateFilter}>
        <SelectTrigger className="h-10 w-60">
          <SelectValue placeholder="সকল ক্লাস">
            {(v: unknown) => {
              const value = typeof v === "string" ? v : "";
              if (!value || value === "all") return "সকল ক্লাস";
              if (value.startsWith("class:")) {
                const id = value.slice("class:".length);
                const c = classes.find((x) => x.id === id);
                return c ? `📚 ${c.name_bn}` : "সকল ক্লাস";
              }
              if (value.startsWith("section:")) {
                const id = value.slice("section:".length);
                for (const c of classes) {
                  const s = c.sections.find((x) => x.id === id);
                  if (s) return `${c.name_bn} — সেকশন ${s.name}`;
                }
              }
              return "সকল ক্লাস";
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">সকল ক্লাস</SelectItem>
          {classes.map((c) => {
            const hasMultiple = c.sections.length > 1;
            return (
              <SelectGroup key={c.id}>
                {/* Every class gets a row, even if it has one or zero sections.
                    Selecting it filters to all students in that class. */}
                <SelectItem value={`class:${c.id}`}>
                  📚 {c.name_bn}
                  {hasMultiple ? ` (সকল সেকশন)` : ""}
                </SelectItem>
                {hasMultiple
                  ? c.sections.map((s) => (
                      <SelectItem key={s.id} value={`section:${s.id}`}>
                        &nbsp;&nbsp;&nbsp;↳ {c.name_bn} — সেকশন {s.name}
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
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">সক্রিয়</SelectItem>
          <SelectItem value="transferred">বদলি</SelectItem>
          <SelectItem value="passed_out">পাশ</SelectItem>
          <SelectItem value="dropped">বাদ</SelectItem>
          <SelectItem value="all">সকল</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
