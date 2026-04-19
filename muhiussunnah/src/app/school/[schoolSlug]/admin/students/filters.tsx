"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ClassWithSections = { id: string; name_bn: string; sections: { id: string; name: string }[] };

type Props = {
  schoolSlug: string;
  classes: ClassWithSections[];
  initial: { class_id?: string; section_id?: string; status?: string; q?: string };
};

export function StudentsFilters({ schoolSlug, classes, initial }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string | null) {
    const next = new URLSearchParams(params);
    if (value && value !== "all") next.set(key, value);
    else next.delete(key);
    router.push(`/school/${schoolSlug}/admin/students?${next.toString()}`);
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <Input
        placeholder="নামে খুঁজুন..."
        defaultValue={initial.q ?? ""}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            update("q", (e.target as HTMLInputElement).value || null);
          }
        }}
        className="h-8 w-56"
      />

      <Select defaultValue={initial.section_id ?? "all"} onValueChange={(v: string | null) => update("section_id", !v || v === "all" ? null : v)}>
        <SelectTrigger className="h-8 w-52">
          <SelectValue placeholder="সকল ক্লাস ও সেকশন" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">সকল ক্লাস ও সেকশন</SelectItem>
          {classes.flatMap((c) =>
            c.sections.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {c.name_bn} — {s.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      <Select defaultValue={initial.status ?? "active"} onValueChange={(v: string | null) => update("status", !v || v === "all" ? null : v)}>
        <SelectTrigger className="h-8 w-36">
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
