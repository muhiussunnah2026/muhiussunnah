import { AlertTriangle, TrendingDown } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { ComputeRiskButton } from "./compute-button";

const levelLabel = (lv: string) =>
  ({ critical: "গুরুতর", high: "উচ্চ", medium: "মাঝারি", low: "কম" }[lv] ?? lv);
const levelVariant = (lv: string): "default" | "secondary" | "destructive" | "outline" =>
  lv === "critical" ? "destructive" : lv === "high" ? "destructive" : lv === "medium" ? "secondary" : "outline";

export default async function DropoutRiskPage() {
  const membership = await requireActiveRole([...ADMIN_ROLES]);

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: scores } = await (supabase as any)
    .from("student_risk_scores")
    .select("id, score, risk_level, attendance_pct, avg_marks_pct, fee_overdue_days, factors, suggestion, computed_at, students ( id, name_bn, name_en, roll_no, sections ( name_bn, classes ( name_bn ) ) )")
    .eq("school_id", membership.school_id)
    .order("score", { ascending: false })
    .limit(200);

  type Row = {
    id: string;
    score: number;
    risk_level: string;
    attendance_pct: number | null;
    avg_marks_pct: number | null;
    fee_overdue_days: number | null;
    factors: Record<string, string>;
    suggestion: string | null;
    computed_at: string;
    students: { name_bn: string | null; name_en: string | null; roll_no: string | null; sections: { name_bn: string; classes: { name_bn: string } } | null } | null;
  };

  const list = (scores ?? []) as Row[];
  const critical = list.filter((r) => r.risk_level === "critical").length;
  const high = list.filter((r) => r.risk_level === "high").length;
  const lastComputed = list[0]?.computed_at;

  return (
    <>
      <PageHeader
        title="ঝুঁকিপূর্ণ শিক্ষার্থী (AI Dropout Risk)"
        subtitle="উপস্থিতি + মার্কস + বকেয়া ফি — তিনটি factor-এ ভিত্তি করে AI-computed risk score। নিয়মিত গণনা করুন এবং উচ্চ ঝুঁকির ছাত্রদের দ্রুত কাউন্সেলিং দিন।"
        impact={[
          { label: <>🚨 গুরুতর · <BanglaDigit value={critical} /></>, tone: critical > 0 ? "warning" : "default" },
          { label: <>⚠️ উচ্চ · <BanglaDigit value={high} /></>, tone: high > 0 ? "warning" : "default" },
          { label: <>মোট · <BanglaDigit value={list.length} /></>, tone: "default" },
          ...(lastComputed ? [{ label: <>সর্বশেষ গণনা: {new Date(lastComputed).toLocaleDateString("bn-BD")}</>, tone: "accent" as const }] : []),
        ]}
        actions={<ComputeRiskButton  schoolSlug={schoolSlug}/>}
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<TrendingDown className="size-8" />}
          title="এখনো কোন ঝুঁকি স্কোর গণনা হয়নি"
          body="উপরে 'ঝুঁকি স্কোর গণনা করুন' বাটনে ক্লিক করুন। প্রতিটি সক্রিয় ছাত্রের জন্য AI উপস্থিতি, মার্কস ও বকেয়া ফি বিশ্লেষণ করে risk score দেবে।"
          proTip="মাসে অন্তত একবার গণনা করুন। গুরুতর ঝুঁকির ছাত্রদের অভিভাবকের সাথে জরুরি মিটিং ডাকুন।"
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ছাত্র</TableHead>
                  <TableHead>শ্রেণি</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead className="text-right">উপস্থিতি</TableHead>
                  <TableHead className="text-right">মার্কস</TableHead>
                  <TableHead className="text-right">বকেয়া</TableHead>
                  <TableHead>পরামর্শ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm">
                      <div className="font-medium">{r.students?.name_bn ?? r.students?.name_en ?? "—"}</div>
                      {r.students?.roll_no && <div className="text-xs text-muted-foreground">Roll: <BanglaDigit value={r.students.roll_no} /></div>}
                    </TableCell>
                    <TableCell className="text-xs">
                      {r.students?.sections ? `${r.students.sections.classes?.name_bn} — ${r.students.sections.name_bn}` : "—"}
                    </TableCell>
                    <TableCell>
                      <span className={`font-bold ${r.risk_level === "critical" ? "text-destructive" : r.risk_level === "high" ? "text-warning-foreground dark:text-warning" : "text-muted-foreground"}`}>
                        <BanglaDigit value={r.score} />
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={levelVariant(r.risk_level)} className="text-xs">
                        {r.risk_level === "critical" && <AlertTriangle className="me-1 size-3" />}
                        {levelLabel(r.risk_level)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {r.attendance_pct !== null ? <><BanglaDigit value={Math.round(r.attendance_pct)} />%</> : "—"}
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {r.avg_marks_pct !== null ? <><BanglaDigit value={Math.round(r.avg_marks_pct)} />%</> : "—"}
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {r.fee_overdue_days !== null && r.fee_overdue_days > 0 ? <><BanglaDigit value={r.fee_overdue_days} /> দিন</> : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs">
                      {r.suggestion ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
