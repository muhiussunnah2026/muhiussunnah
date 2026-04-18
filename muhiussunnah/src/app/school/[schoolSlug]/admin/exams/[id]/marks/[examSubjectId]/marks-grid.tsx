"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Lock, Unlock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { saveMarksAction, toggleLockAction } from "@/server/actions/marks";

type Student = { id: string; name_bn: string; roll: number | null; student_code: string; photo_url: string | null };

type Entry = { marks: string; is_absent: boolean };

type Props = {
  schoolSlug: string;
  examSubjectId: string;
  fullMarks: number;
  passMarks: number;
  students: Student[];
  initial: Record<string, { marks: number | null; is_absent: boolean; grade: string | null }>;
  locked: boolean;
};

function guessGrade(marks: number, full: number): string {
  const pct = full > 0 ? (marks / full) * 100 : 0;
  if (pct >= 80) return "A+";
  if (pct >= 70) return "A";
  if (pct >= 60) return "A-";
  if (pct >= 50) return "B";
  if (pct >= 40) return "C";
  if (pct >= 33) return "D";
  return "F";
}

export function MarksGrid({ schoolSlug, examSubjectId, fullMarks, passMarks, students, initial, locked }: Props) {
  const [entries, setEntries] = useState<Record<string, Entry>>(() => {
    const out: Record<string, Entry> = {};
    for (const s of students) {
      const e = initial[s.id];
      out[s.id] = {
        marks: e?.marks !== null && e?.marks !== undefined ? String(e.marks) : "",
        is_absent: e?.is_absent ?? false,
      };
    }
    return out;
  });
  const [pending, startTransition] = useTransition();
  const [lockPending, startLockTransition] = useTransition();

  const counts = useMemo(() => {
    let entered = 0;
    let absent = 0;
    let passed = 0;
    let failed = 0;
    for (const s of students) {
      const e = entries[s.id];
      if (!e) continue;
      if (e.is_absent) { absent++; continue; }
      const n = Number(e.marks);
      if (e.marks === "" || Number.isNaN(n)) continue;
      entered++;
      if (n >= passMarks) passed++;
      else failed++;
    }
    return { entered, absent, passed, failed, pending: students.length - entered - absent };
  }, [entries, students, passMarks]);

  function setMarks(studentId: string, value: string) {
    setEntries((e) => ({
      ...e,
      [studentId]: { ...e[studentId], marks: value },
    }));
  }

  function setAbsent(studentId: string, absent: boolean) {
    setEntries((e) => ({
      ...e,
      [studentId]: { ...e[studentId], is_absent: absent, marks: absent ? "" : e[studentId]?.marks ?? "" },
    }));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, rowIdx: number) {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = document.getElementById(`marks-${rowIdx + 1}`);
      (next as HTMLInputElement | null)?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = document.getElementById(`marks-${rowIdx - 1}`);
      (prev as HTMLInputElement | null)?.focus();
    }
  }

  function save() {
    const payload = students.map((s) => {
      const e = entries[s.id];
      const marks = e?.is_absent ? null : e?.marks ? Number(e.marks) : null;
      return {
        student_id: s.id,
        marks_obtained: marks,
        is_absent: e?.is_absent ?? false,
        grade: marks !== null ? guessGrade(marks, fullMarks) : undefined,
      };
    });
    startTransition(async () => {
      const res = await saveMarksAction({ schoolSlug, exam_subject_id: examSubjectId, entries: payload });
      if (res.ok) toast.success(res.message ?? "সংরক্ষিত");
      else toast.error(res.error);
    });
  }

  function toggleLock(lock: boolean) {
    const fd = new FormData();
    fd.set("schoolSlug", schoolSlug);
    fd.set("exam_subject_id", examSubjectId);
    fd.set("lock", String(lock));
    startLockTransition(async () => {
      const res = await toggleLockAction(null, fd);
      if (res.ok) { toast.success(res.message ?? "সফল"); location.reload(); }
      else toast.error(res.error);
    });
  }

  return (
    <>
      <Card className="sticky top-14 z-10 mb-4 border-primary/30">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex flex-wrap gap-4 text-xs">
            <span>এন্ট্রি: <span className="font-semibold text-success"><BanglaDigit value={counts.entered} /></span></span>
            <span>অনুপস্থিত: <span className="font-semibold text-muted-foreground"><BanglaDigit value={counts.absent} /></span></span>
            <span>পাশ: <span className="font-semibold text-success"><BanglaDigit value={counts.passed} /></span></span>
            <span>ফেল: <span className="font-semibold text-destructive"><BanglaDigit value={counts.failed} /></span></span>
            <span>বাকি: <span className="font-semibold text-warning-foreground dark:text-warning"><BanglaDigit value={counts.pending} /></span></span>
          </div>
          <div className="flex items-center gap-2">
            {locked ? (
              <Button size="sm" variant="outline" onClick={() => toggleLock(false)} disabled={lockPending}>
                <Unlock className="me-1 size-3.5" /> Unlock
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => toggleLock(true)} disabled={lockPending}>
                <Lock className="me-1 size-3.5" /> লক করুন
              </Button>
            )}
            <Button size="sm" onClick={save} disabled={pending || locked} className="bg-gradient-primary text-white">
              <Save className="me-1 size-3.5" />
              {pending ? "সংরক্ষণ..." : "সংরক্ষণ করুন"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="sticky top-28 z-0 bg-muted/50 text-xs">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">ছাত্র</th>
                <th className="p-2 text-right w-24">মার্ক্স</th>
                <th className="p-2 text-center w-24">অনুপস্থিত</th>
                <th className="p-2 text-center w-20">গ্রেড</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, idx) => {
                const e = entries[s.id];
                const n = Number(e?.marks ?? "");
                const grade = !Number.isNaN(n) && e?.marks ? guessGrade(n, fullMarks) : "—";
                const failed = !e?.is_absent && e?.marks && !Number.isNaN(n) && n < passMarks;
                return (
                  <tr key={s.id} className="border-t border-border/60">
                    <td className="p-2 text-xs text-muted-foreground">
                      {s.roll ? <BanglaDigit value={s.roll} /> : "—"}
                    </td>
                    <td className="p-2">
                      <div className="font-medium">{s.name_bn}</div>
                      <div className="text-xs text-muted-foreground font-mono">{s.student_code}</div>
                    </td>
                    <td className="p-2 text-right">
                      <Input
                        id={`marks-${idx}`}
                        type="number"
                        min={0}
                        max={fullMarks}
                        step="0.5"
                        value={e?.marks ?? ""}
                        disabled={e?.is_absent || locked}
                        onChange={(ev) => setMarks(s.id, ev.target.value)}
                        onKeyDown={(ev) => handleKeyDown(ev, idx)}
                        className={`h-8 w-20 text-right ${failed ? "border-destructive/60" : ""}`}
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="checkbox"
                        checked={e?.is_absent ?? false}
                        disabled={locked}
                        onChange={(ev) => setAbsent(s.id, ev.target.checked)}
                        className="size-4 accent-destructive"
                      />
                    </td>
                    <td className="p-2 text-center">
                      {e?.is_absent ? (
                        <span className="text-xs text-muted-foreground">A</span>
                      ) : e?.marks && !Number.isNaN(n) ? (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${failed ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                          {grade}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
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
