"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, Clock, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { saveAttendanceAction } from "@/server/actions/attendance";

type Student = { id: string; name_bn: string; name_en: string | null; roll: number | null; photo_url: string | null; gender: string | null };

type Status = "present" | "absent" | "late" | "leave";

type Props = {
  schoolSlug: string;
  sectionId: string;
  date: string;
  students: Student[];
  initial: Record<string, { status: string; remarks: string | null }>;
};

export function AttendanceRoster({ schoolSlug, sectionId, date, students, initial }: Props) {
  const [entries, setEntries] = useState<Record<string, Status>>(() => {
    const out: Record<string, Status> = {};
    for (const s of students) {
      const e = initial[s.id];
      out[s.id] = (e?.status as Status) ?? "present"; // default optimistic: present
    }
    return out;
  });
  const [pending, startTransition] = useTransition();

  const counts = useMemo(() => {
    const c: Record<Status, number> = { present: 0, absent: 0, late: 0, leave: 0 };
    for (const k of Object.values(entries)) c[k] = (c[k] ?? 0) + 1;
    return c;
  }, [entries]);

  function setAll(status: Status) {
    const next: Record<string, Status> = {};
    for (const s of students) next[s.id] = status;
    setEntries(next);
  }

  function cycle(studentId: string) {
    setEntries((e) => {
      const order: Status[] = ["present", "absent", "late", "leave"];
      const current = e[studentId] ?? "present";
      const nextIdx = (order.indexOf(current) + 1) % order.length;
      return { ...e, [studentId]: order[nextIdx] };
    });
  }

  function set(studentId: string, status: Status) {
    setEntries((e) => ({ ...e, [studentId]: status }));
  }

  function submit() {
    const payload = students.map((s) => ({ student_id: s.id, status: entries[s.id] ?? "present" as const }));
    startTransition(async () => {
      const res = await saveAttendanceAction({ schoolSlug, section_id: sectionId, date, entries: payload });
      if (res.ok) {
        toast.success(
          `✓ ${payload.length} জনের attendance সম্পন্ন`,
          {
            description: `উপস্থিত: ${counts.present} · অনুপস্থিত: ${counts.absent} · দেরি: ${counts.late} · ছুটি: ${counts.leave}`,
          },
        );
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <>
      <Card className="sticky top-14 z-10 mb-4 border-primary/30">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex flex-wrap gap-3 text-xs">
            <StatusTally label="উপস্থিত" count={counts.present} tone="success" />
            <StatusTally label="অনুপস্থিত" count={counts.absent} tone="destructive" />
            <StatusTally label="দেরি" count={counts.late} tone="warning" />
            <StatusTally label="ছুটি" count={counts.leave} tone="muted" />
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setAll("present")}>
              সব উপস্থিত
            </Button>
            <Button type="button" size="sm" onClick={submit} disabled={pending} className="bg-gradient-primary text-white">
              {pending ? "সংরক্ষণ হচ্ছে..." : <>সংরক্ষণ <ArrowRight className="ms-1 size-3.5" /></>}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-2 md:grid-cols-2">
        {students.map((s) => (
          <StudentRow
            key={s.id}
            student={s}
            status={entries[s.id] ?? "present"}
            onCycle={() => cycle(s.id)}
            onSet={(st) => set(s.id, st)}
          />
        ))}
      </div>
    </>
  );
}

function StatusTally({ label, count, tone }: { label: string; count: number; tone: "success" | "destructive" | "warning" | "muted" }) {
  const color = {
    success: "text-success",
    destructive: "text-destructive",
    warning: "text-warning-foreground dark:text-warning",
    muted: "text-muted-foreground",
  }[tone];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`font-semibold ${color}`}><BanglaDigit value={count} /></span>
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}

function StudentRow({ student, status, onCycle, onSet }: {
  student: Student; status: Status; onCycle: () => void; onSet: (s: Status) => void;
}) {
  const statusColor: Record<Status, string> = {
    present: "ring-success/60 bg-success/5",
    absent: "ring-destructive/60 bg-destructive/5",
    late: "ring-warning/60 bg-warning/5",
    leave: "ring-muted-foreground/40 bg-muted",
  };

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg ring-1 p-3 transition ${statusColor[status]}`}
      onClick={onCycle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onCycle(); } }}
    >
      <div className="flex items-center gap-3">
        <Avatar className="size-10">
          {student.photo_url ? <AvatarImage src={student.photo_url} alt={student.name_bn} /> : null}
          <AvatarFallback className="bg-primary/10 text-primary">{student.name_bn.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{student.name_bn}</div>
          {student.roll ? (
            <div className="text-xs text-muted-foreground">রোল: <BanglaDigit value={student.roll} /></div>
          ) : null}
        </div>
      </div>

      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
        <StatusPill active={status === "present"} tone="success" onClick={() => onSet("present")} icon={<Check className="size-3.5" />} label="P" />
        <StatusPill active={status === "absent"} tone="destructive" onClick={() => onSet("absent")} icon={<X className="size-3.5" />} label="A" />
        <StatusPill active={status === "late"} tone="warning" onClick={() => onSet("late")} icon={<Clock className="size-3.5" />} label="L" />
      </div>
    </div>
  );
}

function StatusPill({ active, tone, onClick, icon, label }: {
  active: boolean; tone: "success" | "destructive" | "warning";
  onClick: () => void; icon: React.ReactNode; label: string;
}) {
  const colors = active ? {
    success: "bg-success text-success-foreground",
    destructive: "bg-destructive text-white",
    warning: "bg-warning text-warning-foreground",
  }[tone] : "bg-muted text-muted-foreground hover:bg-muted/70";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`inline-flex size-8 items-center justify-center rounded-md text-xs font-semibold transition ${colors}`}
    >
      {icon}
    </button>
  );
}
