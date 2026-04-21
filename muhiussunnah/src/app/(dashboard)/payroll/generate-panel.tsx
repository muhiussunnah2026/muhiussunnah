"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateMonthlyPayrollAction } from "@/server/actions/payroll";

export function GeneratePayrollPanel({ schoolSlug, initialMonth, initialYear }: { schoolSlug: string; initialMonth: number; initialYear: number }) {
  const t = useTranslations("payroll");
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
  const [pending, startTransition] = useTransition();

  function handleGenerate() {
    startTransition(async () => {
      const res = await generateMonthlyPayrollAction(schoolSlug, { month, year });
      if (res.ok) toast.success(res.message ?? t("generate_success"));
      else toast.error(res.error);
    });
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5">
        <h2 className="text-lg font-semibold">{t("generate_title")}</h2>
        <p className="text-xs text-muted-foreground">
          {t("generate_desc")}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>{t("generate_month")}</Label>
            <Select value={String(month)} onValueChange={(v: string | null) => v && setMonth(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <SelectItem key={m} value={String(m)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>{t("generate_year")}</Label>
            <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={pending} className="mt-1 bg-gradient-primary text-white">
          {pending ? t("generate_pending") : t("generate_submit")}
        </Button>
      </CardContent>
    </Card>
  );
}
