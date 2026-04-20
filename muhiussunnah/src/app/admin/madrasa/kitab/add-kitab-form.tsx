"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addKitabAction } from "@/server/actions/kitab";
import type { ActionResult } from "@/server/actions/_helpers";

type Class = { id: string; name_bn: string };

export function AddKitabForm({ schoolSlug, classes }: { schoolSlug: string; classes: Class[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(addKitabAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? "যোগ হয়েছে"); formRef.current?.reset(); }
    else toast.error(state.error);
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="stage">স্তর</Label>
        <Select name="stage" defaultValue="ibtedaiyyah">
          <SelectTrigger id="stage"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ibtedaiyyah">ইবতিদাইয়্যাহ</SelectItem>
            <SelectItem value="mutawassita">মুতাওয়াসসিতাহ</SelectItem>
            <SelectItem value="sanaweeya_aamma">সানাবিয়্যাহ আম্মা</SelectItem>
            <SelectItem value="sanaweeya_khassa">সানাবিয়্যাহ খাসসা</SelectItem>
            <SelectItem value="fazilat">ফযিলাত</SelectItem>
            <SelectItem value="kamil">কামিল</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="kitab_name">কিতাবের নাম</Label>
        <Input id="kitab_name" name="kitab_name" required placeholder="যেমন: মিশকাত শরীফ" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="author">লেখক</Label>
        <Input id="author" name="author" placeholder="ঐচ্ছিক" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="display_order">ক্রম</Label>
          <Input id="display_order" name="display_order" type="number" min={0} defaultValue={0} />
        </div>
        {classes.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="class_id">ক্লাস</Label>
            <Select name="class_id">
              <SelectTrigger id="class_id"><SelectValue placeholder="সকল" /></SelectTrigger>
              <SelectContent>
                {classes.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name_bn}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>
      <Button type="submit" disabled={pending} className="mt-1 bg-gradient-primary text-white">
        {pending ? "..." : "যোগ করুন"}
      </Button>
    </form>
  );
}
