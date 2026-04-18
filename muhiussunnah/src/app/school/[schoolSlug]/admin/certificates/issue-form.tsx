"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { issueCertificateAction } from "@/server/actions/certificates";
import type { ActionResult } from "@/server/actions/_helpers";

type Props = {
  schoolSlug: string;
  templates: { id: string; name: string; type: string }[];
  students: { id: string; name_bn: string; student_code: string }[];
};

export function IssueCertificateForm({ schoolSlug, templates, students }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(issueCertificateAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message ?? "ইস্যু হয়েছে");
      formRef.current?.reset();
      if (state.redirect) router.push(state.redirect);
    } else {
      toast.error(state.error);
    }
  }, [state, router]);

  if (templates.length === 0) {
    return (
      <p className="rounded-md border border-warning/30 bg-warning/5 p-3 text-sm">
        ⚠ কোন টেমপ্লেট নেই। Templates পেইজ থেকে তৈরি করুন।
      </p>
    );
  }

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="template_id">টেমপ্লেট</Label>
        <Select name="template_id" required>
          <SelectTrigger id="template_id"><SelectValue placeholder="নির্বাচন" /></SelectTrigger>
          <SelectContent>
            {templates.map((t) => (<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="student_id">ছাত্র</Label>
        <Select name="student_id" required>
          <SelectTrigger id="student_id"><SelectValue placeholder="নির্বাচন" /></SelectTrigger>
          <SelectContent>
            {students.slice(0, 500).map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name_bn} ({s.student_code})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? "ইস্যু হচ্ছে..." : "ইস্যু করুন"}
      </Button>
    </form>
  );
}
