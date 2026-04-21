"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addTransportRouteAction, addVehicleAction } from "@/server/actions/operations";

export function AddRouteForm({ schoolSlug }: { schoolSlug: string }) {
  const t = useTranslations("transport");
  const [state, action, pending] = useActionState(addTransportRouteAction, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? t("add_route_added")); ref.current?.reset(); }
    else toast.error(state.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div>
        <Label>{t("route_name_label")}</Label>
        <Input name="name" placeholder={t("route_name_placeholder")} required />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>{t("route_start_label")}</Label>
          <Input name="start_point" placeholder={t("route_start_placeholder")} />
        </div>
        <div>
          <Label>{t("route_end_label")}</Label>
          <Input name="end_point" placeholder={t("route_end_placeholder")} />
        </div>
      </div>
      <div>
        <Label>{t("route_fare_label")}</Label>
        <Input name="fare_per_month" type="number" min={0} placeholder="0" />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t("route_adding") : t("route_cta")}
      </Button>
    </form>
  );
}

type Route = { id: string; name: string };

export function AddVehicleForm({ schoolSlug, routes }: { schoolSlug: string; routes: Route[] }) {
  const t = useTranslations("transport");
  const [state, action, pending] = useActionState(addVehicleAction, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) { toast.success(state.message ?? t("vehicle_added")); ref.current?.reset(); }
    else toast.error(state.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="schoolSlug" value={schoolSlug} />
      <div>
        <Label>{t("vehicle_route_label")}</Label>
        <select name="route_id" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">{t("vehicle_route_placeholder")}</option>
          {routes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>
      <div>
        <Label>{t("vehicle_reg_label")}</Label>
        <Input name="reg_no" placeholder="ঢাকা-মেট্রো-১২৩৪" required />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>{t("vehicle_driver_label")}</Label>
          <Input name="driver_name" placeholder={t("vehicle_driver_placeholder")} />
        </div>
        <div>
          <Label>{t("vehicle_phone_label")}</Label>
          <Input name="driver_phone" placeholder="01XXXXXXXXX" />
        </div>
      </div>
      <div>
        <Label>{t("vehicle_capacity_label")}</Label>
        <Input name="capacity" type="number" min={1} placeholder="40" />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t("route_adding") : t("vehicle_cta")}
      </Button>
    </form>
  );
}
