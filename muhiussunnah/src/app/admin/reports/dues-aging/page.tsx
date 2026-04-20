import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";

function agingBucket(dueDate: string | null, issueDate: string | null): "0-30" | "31-60" | "61-90" | "90+" {
  const ref = dueDate ?? issueDate ?? new Date().toISOString();
  const days = Math.floor((Date.now() - new Date(ref).getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 30) return "0-30";
  if (days <= 60) return "31-60";
  if (days <= 90) return "61-90";
  return "90+";
}

export default async function DuesAgingReportPage() {
  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: invoices } = await (supabase as any)
    .from("fee_invoices")
    .select(`
      id, invoice_no, month, year, due_date, issue_date, due_amount, status,
      students(id, name_bn, guardian_phone, sections(name, classes(name_bn)))
    `)
    .eq("school_id", membership.school_id)
    .in("status", ["unpaid", "partial", "overdue"])
    .gt("due_amount", 0)
    .order("issue_date", { ascending: true })
    .limit(500);

  const list = (invoices ?? []) as Array<{
    id: string; invoice_no: string; month: number; year: number;
    due_date: string | null; issue_date: string | null; due_amount: number; status: string;
    students: { id: string; name_bn: string; guardian_phone: string | null;
      sections: { name: string; classes: { name_bn: string } } | null } | null;
  }>;

  const buckets: Record<"0-30" | "31-60" | "61-90" | "90+", typeof list> = {
    "0-30": [], "31-60": [], "61-90": [], "90+": [],
  };
  for (const inv of list) {
    const b = agingBucket(inv.due_date, inv.issue_date);
    buckets[b].push(inv);
  }
  const totals = {
    "0-30": buckets["0-30"].reduce((s, i) => s + Number(i.due_amount), 0),
    "31-60": buckets["31-60"].reduce((s, i) => s + Number(i.due_amount), 0),
    "61-90": buckets["61-90"].reduce((s, i) => s + Number(i.due_amount), 0),
    "90+": buckets["90+"].reduce((s, i) => s + Number(i.due_amount), 0),
  };
  const grand = totals["0-30"] + totals["31-60"] + totals["61-90"] + totals["90+"];

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Link href={`/admin/reports`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> রিপোর্ট
          </Link>
        }
        title="বকেয়া Aging রিপোর্ট"
        subtitle="বকেয়া কতদিনের পুরাত ো — 0-30, 31-60, 61-90, 90+ দিন ব্যাকেটে ভাগ করা। প্রতিটি সারিতে ক্লিক করে অভিভাবককে সরাসরি ফোন/SMS করতে পারবেন।"
        impact={[
          { label: <>মোট বকেয়া · ৳ <BanglaDigit value={grand.toLocaleString("en-IN")} /></>, tone: grand > 0 ? "warning" : "success" },
          { label: <>৯০+ দিন · ৳ <BanglaDigit value={totals["90+"].toLocaleString("en-IN")} /></>, tone: totals["90+"] > 0 ? "warning" : "default" },
        ]}
      />

      <div className="grid gap-3 md:grid-cols-4 mb-6">
        {(["0-30", "31-60", "61-90", "90+"] as const).map((b) => (
          <Card key={b} className={b === "90+" ? "border-destructive/30" : b === "61-90" ? "border-warning/30" : ""}>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{b} দিন</div>
              <div className="mt-1 text-xl font-bold">৳ <BanglaDigit value={totals[b].toLocaleString("en-IN")} /></div>
              <div className="text-xs text-muted-foreground"><BanglaDigit value={buckets[b].length} /> টি ইনভয়েস</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(["90+", "61-90", "31-60", "0-30"] as const).map((b) => buckets[b].length > 0 ? (
        <Card key={b} className="mt-4">
          <CardContent className="p-0">
            <h3 className="p-5 pb-3 text-sm font-semibold">{b} দিনের বকেয়া · ৳ <BanglaDigit value={totals[b].toLocaleString("en-IN")} /></h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ইনভয়েস</TableHead>
                  <TableHead>ছাত্র</TableHead>
                  <TableHead>ক্লাস</TableHead>
                  <TableHead>অভিভাবক</TableHead>
                  <TableHead className="text-right">বাকি</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buckets[b].map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>
                      <Link href={`/admin/fees/invoices/${inv.id}`} className="font-mono text-xs text-primary hover:underline">
                        {inv.invoice_no}
                      </Link>
                    </TableCell>
                    <TableCell>{inv.students?.name_bn ?? "—"}</TableCell>
                    <TableCell className="text-xs">
                      {inv.students?.sections ? `${inv.students.sections.classes.name_bn} — ${inv.students.sections.name}` : "—"}
                    </TableCell>
                    <TableCell>
                      {inv.students?.guardian_phone ? (
                        <a href={`tel:${inv.students.guardian_phone}`} className="text-xs text-primary hover:underline">
                          📞 {inv.students.guardian_phone}
                        </a>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ৳ <BanglaDigit value={Number(inv.due_amount).toLocaleString("en-IN")} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null)}
    </>
  );
}
