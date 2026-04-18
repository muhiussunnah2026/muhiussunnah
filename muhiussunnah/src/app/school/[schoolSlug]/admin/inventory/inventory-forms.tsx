"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addInventoryItemAction, addInventoryMovementAction } from "@/server/actions/operations";

export function AddItemForm({ schoolSlug }: { schoolSlug: string }) {
  const [state, action, pending] = useActionState(addInventoryItemAction, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? "আইটেম যোগ হয়েছে।"); ref.current?.reset(); }
    else toast.error(state.error);
  }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div>
        <Label>আইটেমের নাম *</Label>
        <Input name="name" placeholder="যেমন: A4 কাগজ, চেয়ার" required />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>বিভাগ</Label>
          <Input name="category" placeholder="স্টেশনারি, আসবাব" />
        </div>
        <div>
          <Label>একক</Label>
          <Input name="unit" placeholder="রিম, পিস, কেজি" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Reorder স্তর</Label>
          <Input name="reorder_level" type="number" min={0} placeholder="10" />
        </div>
        <div>
          <Label>একক মূল্য (৳)</Label>
          <Input name="unit_price" type="number" min={0} placeholder="0" />
        </div>
      </div>
      <div>
        <Label>সাপ্লায়ার</Label>
        <Input name="supplier" placeholder="সাপ্লায়ারের নাম" />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "যোগ হচ্ছে..." : "আইটেম যোগ করুন"}
      </Button>
    </form>
  );
}

type Item = { id: string; name: string };

export function StockMovementForm({ schoolSlug, items }: { schoolSlug: string; items: Item[] }) {
  const [state, action, pending] = useActionState(addInventoryMovementAction, null);
  const ref = useRef<HTMLFormElement>(null);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? "স্টক আপডেট হয়েছে।"); ref.current?.reset(); }
    else toast.error(state.error);
  }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div>
        <Label>আইটেম *</Label>
        <select name="item_id" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">আইটেম বেছে নিন</option>
          {items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
      </div>
      <div>
        <Label>ধরন *</Label>
        <select name="type" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="in">স্টক ইন (প্রাপ্তি)</option>
          <option value="out">স্টক আউট (ব্যবহার)</option>
          <option value="adjustment">সমন্বয়</option>
          <option value="waste">নষ্ট</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>পরিমাণ *</Label>
          <Input name="qty" type="number" min={0.01} step={0.01} placeholder="1" required />
        </div>
        <div>
          <Label>তারিখ *</Label>
          <Input name="date" type="date" defaultValue={today} required />
        </div>
      </div>
      <div>
        <Label>রেফারেন্স / নোট</Label>
        <Input name="notes" placeholder="চালান নম্বর বা কারণ" />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "আপডেট হচ্ছে..." : "স্টক আপডেট করুন"}
      </Button>
    </form>
  );
}
