"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { gradeSubmissionAction } from "@/server/actions/lms";

export function GradeForm({ schoolSlug, submissionId, currentMarks, currentFeedback, maxMarks }: {
  schoolSlug: string;
  submissionId: string;
  currentMarks: number | null;
  currentFeedback: string | null;
  maxMarks: number | null;
}) {
  const [state, action, pending] = useActionState(gradeSubmissionAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? "সেভ হয়েছে।");
    else toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="flex items-end gap-2">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="submission_id" value={submissionId} />
      <div className="w-24">
        <label className="text-xs text-muted-foreground">মার্কস {maxMarks ? `(/${maxMarks})` : ""}</label>
        <Input name="marks" type="number" min={0} max={maxMarks ?? undefined} step={0.5} defaultValue={currentMarks ?? ""} required />
      </div>
      <div className="flex-1">
        <label className="text-xs text-muted-foreground">মন্তব্য</label>
        <Textarea name="feedback" rows={1} defaultValue={currentFeedback ?? ""} placeholder="শিক্ষকের মন্তব্য" />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "..." : "সেভ"}
      </Button>
    </form>
  );
}
