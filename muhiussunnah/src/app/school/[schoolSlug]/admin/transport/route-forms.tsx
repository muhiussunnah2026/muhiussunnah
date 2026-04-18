"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addTransportRouteAction, addVehicleAction } from "@/server/actions/operations";

export function AddRouteForm({ schoolSlug }: { schoolSlug: string }) {
  const [state, action, pending] = useActionState(addTransportRouteAction, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? "রুট যোগ হয়েছে।"); ref.current?.reset(); }
    else toast.error(state.error);
  }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div>
        <Label>রুটের নাম *</Label>
        <Input name="name" placeholder="যেমন: মিরপুর - স্কুল" required />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>শুরু</Label>
          <Input name="start_point" placeholder="শুরুর স্থান" />
        </div>
        <div>
          <Label>শেষ</Label>
          <Input name="end_point" placeholder="শেষ স্থান" />
        </div>
      </div>
      <div>
        <Label>মাসিক ভাড়া (৳)</Label>
        <Input name="fare_per_month" type="number" min={0} placeholder="0" />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "যোগ হচ্ছে..." : "রুট যোগ করুন"}
      </Button>
    </form>
  );
}

type Route = { id: string; name: string };

export function AddVehicleForm({ schoolSlug, routes }: { schoolSlug: string; routes: Route[] }) {
  const [state, action, pending] = useActionState(addVehicleAction, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? "গাড়ি যোগ হয়েছে।"); ref.current?.reset(); }
    else toast.error(state.error);
  }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div>
        <Label>রুট *</Label>
        <select name="route_id" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">রুট বেছে নিন</option>
          {routes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>
      <div>
        <Label>রেজিস্ট্রেশন নম্বর *</Label>
        <Input name="reg_no" placeholder="ঢাকা-মেট্রো-১২৩৪" required />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>ড্রাইভার</Label>
          <Input name="driver_name" placeholder="নাম" />
        </div>
        <div>
          <Label>মোবাইল</Label>
          <Input name="driver_phone" placeholder="01XXXXXXXXX" />
        </div>
      </div>
      <div>
        <Label>ধারণ ক্ষমতা</Label>
        <Input name="capacity" type="number" min={1} placeholder="40" />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "যোগ হচ্ছে..." : "গাড়ি যোগ করুন"}
      </Button>
    </form>
  );
}
