"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createTicketAction } from "@/server/actions/support";
import type { ActionResult } from "@/server/actions/_helpers";

export function NewTicketForm({ schoolSlug }: { schoolSlug: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(createTicketAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message ?? "পাঠান ো হয়েছে");
      formRef.current?.reset();
      if (state.redirect) router.push(state.redirect);
    } else {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="subject">বিষয়</Label>
        <Input id="subject" name="subject" required placeholder="সংক্ষেপে কী নিয়ে" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="body">বিস্তারিত</Label>
        <Textarea id="body" name="body" rows={4} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="priority">গুরুত্ব</Label>
        <Select name="priority" defaultValue="normal">
          <SelectTrigger id="priority"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="low">কম</SelectItem>
            <SelectItem value="normal">স্বাভাবিক</SelectItem>
            <SelectItem value="high">বেশি</SelectItem>
            <SelectItem value="urgent">জরুরি</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? "পাঠানো হচ্ছে..." : "টিকেট পাঠান"}
      </Button>
    </form>
  );
}
