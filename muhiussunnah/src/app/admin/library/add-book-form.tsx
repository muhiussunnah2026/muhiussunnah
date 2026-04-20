"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addBookAction } from "@/server/actions/operations";

export function AddBookForm({ schoolSlug }: { schoolSlug: string }) {
  const [state, action, pending] = useActionState(addBookAction, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? "বই যোগ হয়েছে।"); ref.current?.reset(); }
    else toast.error(state.error);
  }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div>
        <Label>শিরোনাম *</Label>
        <Input name="title" placeholder="বইয়ের নাম" required />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>লেখক</Label>
          <Input name="author" placeholder="Author" />
        </div>
        <div>
          <Label>ISBN</Label>
          <Input name="isbn" placeholder="ISBN" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>বিভাগ</Label>
          <Input name="category" placeholder="যেমন: গল্প, ইসলামিক" />
        </div>
        <div>
          <Label>শেলফ</Label>
          <Input name="shelf" placeholder="A-1" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>কপি সংখ্যা</Label>
          <Input name="copies_total" type="number" min={1} defaultValue={1} />
        </div>
        <div>
          <Label>মূল্য (৳)</Label>
          <Input name="price" type="number" min={0} placeholder="0" />
        </div>
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "যোগ হচ্ছে..." : "বই যোগ করুন"}
      </Button>
    </form>
  );
}
