"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitAssignmentAction } from "@/server/actions/lms";

export function SubmitForm({ schoolSlug, assignmentId, studentId, existingBody, existingFile }: {
  schoolSlug: string;
  assignmentId: string;
  studentId: string;
  existingBody: string | null;
  existingFile: string | null;
}) {
  const [state, action, pending] = useActionState(submitAssignmentAction, null);
  const [open, setOpen] = useState(!existingBody && !existingFile);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? "জমা দেওয়া হয়েছে।"); setOpen(false); }
    else toast.error(state.error);
  }, [state]);

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>সম্পাদনা করুন</Button>
    );
  }

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="assignment_id" value={assignmentId} />
      <input type="hidden" name="student_id" value={studentId} />
      <div>
        <Label>উত্তর লিখুন</Label>
        <Textarea name="body" defaultValue={existingBody ?? ""} rows={5} placeholder="এখানে উত্তর লিখুন..." />
      </div>
      <div>
        <Label>অথবা ফাইল URL (Google Drive, Dropbox ইত্যাদি)</Label>
        <Input name="file_url" type="url" defaultValue={existingFile ?? ""} placeholder="https://..." />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "জমা হচ্ছে..." : "জমা দিন"}
        </Button>
        {(existingBody || existingFile) && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>বাতিল</Button>
        )}
      </div>
    </form>
  );
}
