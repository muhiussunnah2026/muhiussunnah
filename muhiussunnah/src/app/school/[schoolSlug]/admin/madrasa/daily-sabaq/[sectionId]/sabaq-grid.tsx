"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { saveDailySabaqAction } from "@/server/actions/daily-sabaq";

type Student = { id: string; name_bn: string; roll: number | null; student_code: string };
type Quality = "excellent" | "good" | "average" | "weak";

type Entry = {
  sabaq_para: string;
  sabaq_from: string;
  sabaq_to: string;
  sabaq_quality: Quality | "";
  sabqi_para: string;
  sabqi_quality: Quality | "";
  manzil_paras: string;     // comma-separated
  manzil_quality: Quality | "";
  tajweed_notes: string;
};

type InitEntry = {
  sabaq_para: number | null; sabaq_from: string | null; sabaq_to: string | null; sabaq_quality: string | null;
  sabqi_para: number | null; sabqi_quality: string | null;
  manzil_paras: number[]; manzil_quality: string | null;
  tajweed_notes: string | null;
};

type Props = {
  schoolSlug: string;
  sectionId: string;
  date: string;
  students: Student[];
  initial: Record<string, InitEntry>;
};

const qualityOptions: { v: Quality; label: string; cls: string }[] = [
  { v: "excellent", label: "চমৎকার", cls: "bg-success/20 text-success" },
  { v: "good",      label: "ভাল",     cls: "bg-primary/20 text-primary" },
  { v: "average",   label: "মাঝারি",  cls: "bg-warning/20 text-warning-foreground dark:text-warning" },
  { v: "weak",      label: "দুর্বল",   cls: "bg-destructive/20 text-destructive" },
];

export function SabaqGrid({ schoolSlug, sectionId, date, students, initial }: Props) {
  const [entries, setEntries] = useState<Record<string, Entry>>(() => {
    const out: Record<string, Entry> = {};
    for (const s of students) {
      const i = initial[s.id];
      out[s.id] = {
        sabaq_para: i?.sabaq_para != null ? String(i.sabaq_para) : "",
        sabaq_from: i?.sabaq_from ?? "",
        sabaq_to: i?.sabaq_to ?? "",
        sabaq_quality: (i?.sabaq_quality as Quality | null) ?? "",
        sabqi_para: i?.sabqi_para != null ? String(i.sabqi_para) : "",
        sabqi_quality: (i?.sabqi_quality as Quality | null) ?? "",
        manzil_paras: (i?.manzil_paras ?? []).join(", "),
        manzil_quality: (i?.manzil_quality as Quality | null) ?? "",
        tajweed_notes: i?.tajweed_notes ?? "",
      };
    }
    return out;
  });
  const [pending, startTransition] = useTransition();

  function setField<K extends keyof Entry>(studentId: string, key: K, value: Entry[K]) {
    setEntries((e) => ({ ...e, [studentId]: { ...e[studentId], [key]: value } }));
  }

  function save() {
    const payload = students.map((s) => {
      const e = entries[s.id];
      const manzilArr = e.manzil_paras
        .split(",")
        .map((x) => Number(x.trim()))
        .filter((x) => Number.isFinite(x) && x >= 1 && x <= 30);
      return {
        student_id: s.id,
        sabaq_para: e.sabaq_para ? Number(e.sabaq_para) : null,
        sabaq_from: e.sabaq_from || null,
        sabaq_to: e.sabaq_to || null,
        sabaq_quality: e.sabaq_quality || null,
        sabqi_para: e.sabqi_para ? Number(e.sabqi_para) : null,
        sabqi_quality: e.sabqi_quality || null,
        manzil_paras: manzilArr,
        manzil_quality: e.manzil_quality || null,
        tajweed_notes: e.tajweed_notes || null,
      };
    });
    startTransition(async () => {
      void sectionId;
      const res = await saveDailySabaqAction({ schoolSlug, date, entries: payload });
      if (res.ok) toast.success(res.message ?? "সংরক্ষিত");
      else toast.error(res.error);
    });
  }

  return (
    <>
      <Card className="sticky top-14 z-10 mb-4 border-primary/30">
        <CardContent className="flex items-center justify-between p-3">
          <span className="text-xs text-muted-foreground">
            <BanglaDigit value={students.length} /> জন ছাত্র · {date}
          </span>
          <Button size="sm" onClick={save} disabled={pending} className="bg-gradient-primary text-white">
            <Save className="me-1 size-3.5" />
            {pending ? "সংরক্ষণ..." : "সব সংরক্ষণ"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr>
                <th className="sticky left-0 bg-muted/50 p-2 text-left min-w-40">ছাত্র</th>
                <th className="p-2 text-left" colSpan={4}>সবক (নতুন পাঠ)</th>
                <th className="p-2 text-left" colSpan={2}>সবকী (গতকাল)</th>
                <th className="p-2 text-left" colSpan={2}>মানজিল (সমষ্টি)</th>
                <th className="p-2 text-left">তাজওয়ীদ</th>
              </tr>
              <tr className="border-t border-border/40 text-[10px] text-muted-foreground">
                <th className="sticky left-0 bg-muted/50 p-2"></th>
                <th className="p-1">পারা</th>
                <th className="p-1">থেকে</th>
                <th className="p-1">পর্যন্ত</th>
                <th className="p-1">মান</th>
                <th className="p-1">পারা</th>
                <th className="p-1">মান</th>
                <th className="p-1">পারাসমূহ</th>
                <th className="p-1">মান</th>
                <th className="p-1">মন্তব্য</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const e = entries[s.id];
                return (
                  <tr key={s.id} className="border-t border-border/40">
                    <td className="sticky left-0 bg-background p-2">
                      <div className="font-medium">{s.name_bn}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {s.roll ? <>রোল: <BanglaDigit value={s.roll} /></> : s.student_code}
                      </div>
                    </td>
                    <td className="p-1">
                      <Input type="number" min={1} max={30} value={e.sabaq_para} onChange={(ev) => setField(s.id, "sabaq_para", ev.target.value)} className="h-7 w-14 text-center text-xs" />
                    </td>
                    <td className="p-1">
                      <Input value={e.sabaq_from} onChange={(ev) => setField(s.id, "sabaq_from", ev.target.value)} className="h-7 w-20 text-xs" />
                    </td>
                    <td className="p-1">
                      <Input value={e.sabaq_to} onChange={(ev) => setField(s.id, "sabaq_to", ev.target.value)} className="h-7 w-20 text-xs" />
                    </td>
                    <td className="p-1"><QualitySelect value={e.sabaq_quality} onChange={(v) => setField(s.id, "sabaq_quality", v)} /></td>
                    <td className="p-1">
                      <Input type="number" min={1} max={30} value={e.sabqi_para} onChange={(ev) => setField(s.id, "sabqi_para", ev.target.value)} className="h-7 w-14 text-center text-xs" />
                    </td>
                    <td className="p-1"><QualitySelect value={e.sabqi_quality} onChange={(v) => setField(s.id, "sabqi_quality", v)} /></td>
                    <td className="p-1">
                      <Input value={e.manzil_paras} onChange={(ev) => setField(s.id, "manzil_paras", ev.target.value)} placeholder="1,2,3" className="h-7 w-24 text-xs" />
                    </td>
                    <td className="p-1"><QualitySelect value={e.manzil_quality} onChange={(v) => setField(s.id, "manzil_quality", v)} /></td>
                    <td className="p-1">
                      <Input value={e.tajweed_notes} onChange={(ev) => setField(s.id, "tajweed_notes", ev.target.value)} className="h-7 w-32 text-xs" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  );
}

function QualitySelect({ value, onChange }: { value: Quality | ""; onChange: (v: Quality | "") => void }) {
  return (
    <Select value={value || undefined} onValueChange={(v: string | null) => onChange((v as Quality) ?? "")}>
      <SelectTrigger className="h-7 w-20 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
      <SelectContent>
        {qualityOptions.map((q) => (
          <SelectItem key={q.v} value={q.v}>{q.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
