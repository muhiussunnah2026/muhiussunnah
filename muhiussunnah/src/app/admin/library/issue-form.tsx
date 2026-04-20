"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { issueBookAction, returnBookAction } from "@/server/actions/operations";

type Book = { id: string; title: string; copies_available: number };
type Student = { id: string; name_bn: string | null; name_en: string | null };
type Issue = { id: string; book_id: string; due_on: string; students: { name_bn: string | null } | null; library_books: { title: string } | null };

export function IssueBookForm({ schoolSlug, books, students }: { schoolSlug: string; books: Book[]; students: Student[] }) {
  const [state, action, pending] = useActionState(issueBookAction, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? "ইস্যু হয়েছে।"); ref.current?.reset(); }
    else toast.error(state.error);
  }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div>
        <Label>বই *</Label>
        <select name="book_id" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">বই বেছে নিন</option>
          {books.filter((b) => b.copies_available > 0).map((b) => (
            <option key={b.id} value={b.id}>{b.title} ({b.copies_available} available)</option>
          ))}
        </select>
      </div>
      <div>
        <Label>ছাত্র *</Label>
        <select name="student_id" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">ছাত্র বেছে নিন</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.name_bn ?? s.name_en ?? s.id}</option>
          ))}
        </select>
      </div>
      <div>
        <Label>ফেরতের তারিখ *</Label>
        <Input name="due_on" type="date" required />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "ইস্যু হচ্ছে..." : "বই ইস্যু করুন"}
      </Button>
    </form>
  );
}

export function ReturnBookButton({ schoolSlug, issue }: { schoolSlug: string; issue: Issue }) {
  const [state, action, pending] = useActionState(returnBookAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? "ফেরত নেওয়া হয়েছে।");
    else toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="inline">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="issue_id" value={issue.id} />
      <input type="hidden" name="book_id" value={issue.book_id} />
      <input type="hidden" name="fine" value={0} />
      <Button variant="outline" size="sm" type="submit" disabled={pending}>
        {pending ? "..." : "ফেরত"}
      </Button>
    </form>
  );
}
