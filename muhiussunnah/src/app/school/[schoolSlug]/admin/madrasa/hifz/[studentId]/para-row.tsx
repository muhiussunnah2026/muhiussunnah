"use client";

import { useActionState, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { recordHifzAction } from "@/server/actions/hifz";
import type { ActionResult } from "@/server/actions/_helpers";

type Props = {
  schoolSlug: string;
  studentId: string;
  paraNo: number;
  initial: {
    status: "learning" | "revising" | "completed" | "tested";
    mark: number | null;
    grade: string;
    mistakes_count: number;
    note: string;
  };
};

export function ParaRow({ schoolSlug, studentId, paraNo, initial }: Props) {
  const [status, setStatus] = useState(initial.status);
  const [mark, setMark] = useState(initial.mark !== null ? String(initial.mark) : "");
  const [mistakes, setMistakes] = useState(String(initial.mistakes_count));
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(recordHifzAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? "আপডেট");
    else toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="flex items-center justify-end gap-1">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="student_id" value={studentId} />
      <input type="hidden" name="para_no" value={paraNo} />
      <Select name="status" value={status} onValueChange={(v: string | null) => v && setStatus(v as Props["initial"]["status"])}>
        <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="learning">শিখছে</SelectItem>
          <SelectItem value="revising">রিভিশন</SelectItem>
          <SelectItem value="completed">সম্পন্ন</SelectItem>
          <SelectItem value="tested">পরীক্ষিত</SelectItem>
        </SelectContent>
      </Select>
      <Input
        name="mark"
        type="number"
        min={0}
        step="0.5"
        placeholder="মার্ক"
        value={mark}
        onChange={(e) => setMark(e.target.value)}
        className="h-7 w-16 text-xs text-right"
      />
      <Input
        name="mistakes_count"
        type="number"
        min={0}
        placeholder="ভুল"
        value={mistakes}
        onChange={(e) => setMistakes(e.target.value)}
        className="h-7 w-14 text-xs text-right"
      />
      <Button type="submit" size="icon-sm" disabled={pending} aria-label="Save" className="bg-gradient-primary text-white">
        <Check className="size-3.5" />
      </Button>
    </form>
  );
}
