"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { inviteStaffAction } from "@/server/actions/staff";
import type { ActionResult } from "@/server/actions/_helpers";

type Branch = { id: string; name: string };
type Props = { schoolSlug: string; branches: Branch[] };

export function InviteStaffForm({ schoolSlug, branches }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(inviteStaffAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message ?? "যোগ হয়েছে");
      formRef.current?.reset();
    } else toast.error(state.error);
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="full_name_bn">নাম (বাংলা)</Label>
        <Input id="full_name_bn" name="full_name_bn" required placeholder="যেমন: আবুল হোসেন" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">ইমেইল</Label>
          <Input id="email" name="email" type="email" required placeholder="teacher@school.com" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">ফোন</Label>
          <Input id="phone" name="phone" type="tel" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="role">ভূমিকা</Label>
          <Select name="role" defaultValue="CLASS_TEACHER">
            <SelectTrigger id="role"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="SCHOOL_ADMIN">প্রিন্সিপাল</SelectItem>
              <SelectItem value="VICE_PRINCIPAL">ভাইস প্রিন্সিপাল</SelectItem>
              <SelectItem value="ACCOUNTANT">হিসাবরক্ষক</SelectItem>
              <SelectItem value="BRANCH_ADMIN">শাখা প্রধান</SelectItem>
              <SelectItem value="CLASS_TEACHER">শ্রেণি শিক্ষক</SelectItem>
              <SelectItem value="SUBJECT_TEACHER">বিষয় শিক্ষক</SelectItem>
              <SelectItem value="MADRASA_USTADH">উস্তাদ</SelectItem>
              <SelectItem value="LIBRARIAN">গ্রন্থাগারিক</SelectItem>
              <SelectItem value="TRANSPORT_MANAGER">পরিবহন ব্যবস্থাপক</SelectItem>
              <SelectItem value="HOSTEL_WARDEN">হোস্টেল ওয়ার্ডেন</SelectItem>
              <SelectItem value="CANTEEN_MANAGER">ক্যান্টিন ব্যবস্থাপক</SelectItem>
              <SelectItem value="COUNSELOR">কাউন্সেলর</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="employee_code">কর্মচারী কোড</Label>
          <Input id="employee_code" name="employee_code" placeholder="EMP-001" />
        </div>
      </div>

      {branches.length > 1 ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="branch_id">শাখা</Label>
          <Select name="branch_id">
            <SelectTrigger id="branch_id"><SelectValue placeholder="সকল শাখায়" /></SelectTrigger>
            <SelectContent>
              {branches.map((b) => (<SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? "আমন্ত্রণ পাঠান ো হচ্ছে..." : "আমন্ত্রণ পাঠান"}
      </Button>
      <p className="text-xs text-muted-foreground">
        ইনভাইট পাঠানোর পর ইমেইলে পাসওয়ার্ড সেট করার লিংক যাবে।
      </p>
    </form>
  );
}
