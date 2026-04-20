"use client";

import { useActionState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteRoutineRowAction } from "@/server/actions/exams";
import type { ActionResult } from "@/server/actions/_helpers";

export function DeleteRoutineButton({ schoolSlug, examId, rowId }: { schoolSlug: string; examId: string; rowId: string }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(deleteRoutineRowAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? "মুছে ফেলা হয়েছে");
    else toast.error(state.error);
  }, [state]);

  return (
    <form action={action} onSubmit={(e) => { if (!confirm("এই রুটিন এন্ট্রি মুছবেন? মার্ক্স ডেটাও মুছে যাবে।")) e.preventDefault(); }}>
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="exam_id" value={examId} />
      <input type="hidden" name="id" value={rowId} />
      <Button type="submit" size="icon-sm" variant="ghost" disabled={pending} aria-label="Delete">
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </form>
  );
}
