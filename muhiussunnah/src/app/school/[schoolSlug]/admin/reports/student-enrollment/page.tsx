import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";

type PageProps = { params: Promise<{ schoolSlug: string }> };

export default async function StudentEnrollmentPage({ params }: PageProps) {
  const { schoolSlug } = await params;
  const membership = await requireRole(schoolSlug, [...ADMIN_ROLES]);

  const supabase = await supabaseServer();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: students } = await (supabase as any)
    .from("students")
    .select("id, gender, is_active, sections ( name_bn, classes ( name_bn, display_order ) )")
    .eq("school_id", membership.school_id);

  type Student = { id: string; gender: string | null; is_active: boolean; sections: { name_bn: string; classes: { name_bn: string; display_order: number } } | null };
  const list = (students ?? []) as Student[];

  const active = list.filter((s) => s.is_active);
  const classMap = new Map<string, { class_bn: string; order: number; total: number; boys: number; girls: number; inactive: number }>();

  for (const s of list) {
    const key = s.sections?.classes?.name_bn ?? "শ্রেণিহীন";
    const order = s.sections?.classes?.display_order ?? 99;
    const existing = classMap.get(key) ?? { class_bn: key, order, total: 0, boys: 0, girls: 0, inactive: 0 };
    if (s.is_active) {
      existing.total++;
      if (s.gender === "male") existing.boys++;
      else if (s.gender === "female") existing.girls++;
    } else {
      existing.inactive++;
    }
    classMap.set(key, existing);
  }

  const rows = Array.from(classMap.values()).sort((a, b) => a.order - b.order);

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Link href={`/school/${schoolSlug}/admin/reports`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> রিপোর্ট
          </Link>
        }
        title="শিক্ষার্থী ভর্তি রিপোর্ট"
        subtitle="শ্রেণি অনুযায়ী ছাত্র সংখ্যা — সক্রিয়, ছেলে, মেয়ে ব্রেকডাউন।"
        impact={[
          { label: <>মোট সক্রিয় · <BanglaDigit value={active.length} /></>, tone: "success" },
          { label: <>ছেলে · <BanglaDigit value={active.filter((s) => s.gender === "male").length} /></>, tone: "accent" },
          { label: <>মেয়ে · <BanglaDigit value={active.filter((s) => s.gender === "female").length} /></>, tone: "accent" },
          { label: <>বাদ দেওয়া · <BanglaDigit value={list.filter((s) => !s.is_active).length} /></>, tone: "default" },
        ]}
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>শ্রেণি</TableHead>
                <TableHead className="text-right">মোট (সক্রিয়)</TableHead>
                <TableHead className="text-right">ছেলে</TableHead>
                <TableHead className="text-right">মেয়ে</TableHead>
                <TableHead className="text-right">বাদ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.class_bn}>
                  <TableCell className="font-medium">{r.class_bn}</TableCell>
                  <TableCell className="text-right"><BanglaDigit value={r.total} /></TableCell>
                  <TableCell className="text-right"><BanglaDigit value={r.boys} /></TableCell>
                  <TableCell className="text-right"><BanglaDigit value={r.girls} /></TableCell>
                  <TableCell className="text-right text-muted-foreground"><BanglaDigit value={r.inactive} /></TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold bg-muted/50">
                <TableCell>মোট</TableCell>
                <TableCell className="text-right"><BanglaDigit value={rows.reduce((s, r) => s + r.total, 0)} /></TableCell>
                <TableCell className="text-right"><BanglaDigit value={rows.reduce((s, r) => s + r.boys, 0)} /></TableCell>
                <TableCell className="text-right"><BanglaDigit value={rows.reduce((s, r) => s + r.girls, 0)} /></TableCell>
                <TableCell className="text-right"><BanglaDigit value={rows.reduce((s, r) => s + r.inactive, 0)} /></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
