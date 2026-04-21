"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { generateMonthlyInvoicesAction } from "@/server/actions/fees";

type Props = { schoolSlug: string; classes: { id: string; name_bn: string }[] };

export function GenerateInvoicesPanel({ schoolSlug, classes }: Props) {
  const t = useTranslations("fees");
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [classId, setClassId] = useState<string>("all");
  const [dueDate, setDueDate] = useState("");
  const [result, setResult] = useState<{ invoices_created: number; invoices_skipped: number; students_processed: number } | null>(null);
  const [pending, startTransition] = useTransition();

  function handleGenerate() {
    startTransition(async () => {
      const res = await generateMonthlyInvoicesAction(schoolSlug, {
        month,
        year,
        class_id: classId === "all" ? null : classId,
        due_date: dueDate || undefined,
      });
      if (res.ok && res.data) {
        setResult(res.data);
        toast.success(res.message ?? t("generate_done"));
      } else if (!res.ok) {
        toast.error(res.error);
      }
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

        <div className="flex flex-col gap-1.5">
          <Label>{t("generate_class")}</Label>
          <Select value={classId} onValueChange={(v: string | null) => v && setClassId(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("generate_all_classes")}</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name_bn}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>{t("generate_due_date")}</Label>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>

        <Button onClick={handleGenerate} disabled={pending} className="mt-2 bg-gradient-primary text-white">
          {pending ? t("generate_pending") : t("generate_submit")}
        </Button>

        {result ? (
          <div className="mt-2 rounded-md border border-success/30 bg-success/5 p-3 text-xs">
            <p className="font-semibold">
              {t.rich("generate_result_count", {
                created: () => <BanglaDigit value={result.invoices_created} />,
                skipped: () => <BanglaDigit value={result.invoices_skipped} />,
              })}
            </p>
            <p className="text-muted-foreground">
              {t.rich("generate_result_processed", {
                count: () => <BanglaDigit value={result.students_processed} />,
              })}
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
