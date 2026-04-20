"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { markSalaryPaidAction } from "@/server/actions/payroll";
import type { ActionResult } from "@/server/actions/_helpers";

export function MarkPaidButton({ schoolSlug, id }: { schoolSlug: string; id: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(markSalaryPaidAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? "সফল"); setOpen(false); }
    else toast.error(state.error);
  }, [state]);

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Mark Paid
      </Button>
    );
  }

  return (
    <form action={action} className="flex items-center gap-1">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <input type="hidden" name="id" value={id} />
      <Input name="paid_on" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="h-8 w-36" />
      <Select name="payment_method" defaultValue="cash">
        <SelectTrigger className="h-8 w-24"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="cash">Cash</SelectItem>
          <SelectItem value="bkash">bKash</SelectItem>
          <SelectItem value="bank_transfer">Bank</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" size="sm" disabled={pending} className="bg-gradient-primary text-white">
        {pending ? "..." : "✓"}
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>✕</Button>
    </form>
  );
}
