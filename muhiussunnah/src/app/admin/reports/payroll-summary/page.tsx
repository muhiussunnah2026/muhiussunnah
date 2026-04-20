import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";

type PageProps = {
  searchParams: Promise<{ month?: string; year?: string }>;
};

const monthLabels = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

export default async function PayrollSummaryPage({ searchParams }: PageProps) {
  const search = await searchParams;
  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);

  const schoolSlug = membership.school_slug;
  const now = new Date();
  const year = Number(search.year ?? now.getFullYear());
  const month = Number(search.month ?? now.getMonth() + 1);

  const supabase = await supabaseServer();

  // staff_salaries references school_user_id → filter via inner join on school_users.school_id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: payrolls } = await (supabase as any)
    .from("staff_salaries")
    .select("id, gross_amount, net_amount, deductions, status, school_users!inner ( school_id, full_name_bn, full_name_en, role )")
    .eq("school_users.school_id", membership.school_id)
    .eq("year", year)
    .eq("month", month)
    .order("gross_amount", { ascending: false });

  type Payroll = {
    id: string;
    gross_amount: number;
    net_amount: number;
    deductions: Record<string, number>;
    status: string;
    school_users: { full_name_bn: string | null; full_name_en: string | null; role: string } | null;
  };
  const list = (payrolls ?? []) as Payroll[];
  const sumDeductions = (d: Record<string, number> | null) =>
    d ? Object.values(d).reduce((s, v) => s + Number(v || 0), 0) : 0;

  const totalGross = list.reduce((s, p) => s + Number(p.gross_amount), 0);
  const totalNet = list.reduce((s, p) => s + Number(p.net_amount), 0);
  const paid = list.filter((p) => p.status === "paid").length;

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Link href={`/admin/reports`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> রিপোর্ট
          </Link>
        }
        title={<>বেতন সারসংক্ষেপ — {monthLabels[month - 1]} <BanglaDigit value={year} /></>}
        subtitle="সকল কর্মীর বেতন তালিকা ও পরিশোধ অবস্থা।"
        impact={[
          { label: <>মোট Gross · ৳ <BanglaDigit value={totalGross.toLocaleString("en-IN")} /></>, tone: "default" },
          { label: <>Net পরিশোধ · ৳ <BanglaDigit value={totalNet.toLocaleString("en-IN")} /></>, tone: "success" },
          { label: <><BanglaDigit value={paid} /> / <BanglaDigit value={list.length} /> পরিশোধ</>, tone: paid === list.length ? "success" : "warning" },
        ]}
      />

      {list.length === 0 ? (
        <p className="text-muted-foreground text-sm">এই মাসে কোন বেতন রেকর্ড নেই।</p>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>কর্মী</TableHead>
                  <TableHead>পদ</TableHead>
                  <TableHead className="text-right">Gross (৳)</TableHead>
                  <TableHead className="text-right">কাটা (৳)</TableHead>
                  <TableHead className="text-right">Net (৳)</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm">{p.school_users?.full_name_bn ?? p.school_users?.full_name_en ?? "—"}</TableCell>
                    <TableCell className="text-xs"><Badge variant="outline">{p.school_users?.role ?? "—"}</Badge></TableCell>
                    <TableCell className="text-right"><BanglaDigit value={Number(p.gross_amount).toLocaleString("en-IN")} /></TableCell>
                    <TableCell className="text-right text-destructive"><BanglaDigit value={sumDeductions(p.deductions).toLocaleString("en-IN")} /></TableCell>
                    <TableCell className="text-right font-medium"><BanglaDigit value={Number(p.net_amount).toLocaleString("en-IN")} /></TableCell>
                    <TableCell>
                      <Badge variant={p.status === "paid" ? "default" : "secondary"}>
                        {p.status === "paid" ? "পরিশোধ" : p.status === "approved" ? "অনুমোদিত" : "ড্রাফট"}
                      </Badge>
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
