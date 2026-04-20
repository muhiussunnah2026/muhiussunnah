import Link from "next/link";
import { FileCheck2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { BengaliDate } from "@/components/ui/bengali-date";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { supabaseServer } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { IssueCertificateForm } from "./issue-form";

type PageProps = { params: Promise<{ schoolSlug: string }> };

const typeLabel: Record<string, string> = {
  testimonial: "প্রশংসাপত্র",
  tc: "ট্রান্সফার সার্টিফিকেট",
  character: "চরিত্র সনদ",
  completion: "কমপ্লিশন",
  hifz_sanad: "হিফজ সনদ",
  other: "অন্যান্য",
};

export default async function CertificatesPage({ params }: PageProps) {
  const { schoolSlug } = await params;
  const membership = await requireRole(schoolSlug, ADMIN_ROLES);

  const supabase = await supabaseServer();
  // Independent — all three keyed off school_id only.
  const [issuedRes, templatesRes, studentsRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("certificates_issued")
      .select(`
        id, serial_no, issued_on,
        students ( id, name_bn, student_code ),
        certificate_templates ( type, name )
      `)
      .eq("school_id", membership.school_id)
      .order("issued_on", { ascending: false })
      .limit(200),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("certificate_templates")
      .select("id, name, type, is_active")
      .eq("school_id", membership.school_id)
      .eq("is_active", true),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("students")
      .select("id, name_bn, student_code")
      .eq("school_id", membership.school_id)
      .order("name_bn")
      .limit(1000),
  ]);
  const { data: issued } = issuedRes;
  const { data: templates } = templatesRes;
  const { data: students } = studentsRes;

  const list = (issued ?? []) as Array<{
    id: string; serial_no: string; issued_on: string;
    students: { id: string; name_bn: string; student_code: string } | null;
    certificate_templates: { type: string; name: string } | null;
  }>;

  const templateList = (templates ?? []) as { id: string; name: string; type: string; is_active: boolean }[];
  const studentList = (students ?? []) as { id: string; name_bn: string; student_code: string }[];

  return (
    <>
      <PageHeader
        title="সার্টিফিকেট"
        subtitle="প্রশংসাপত্র, TC, চরিত্র সনদ, হিফজ সনদ — টেমপ্লেট তৈরি করুন, তারপর ছাত্রকে ইস্যু করুন। প্রতিটির unique serial number হবে।"
        impact={[
          { label: <>ইস্যু হয়েছে · <BanglaDigit value={list.length} /></>, tone: "accent" },
          { label: <>টেমপ্লেট · <BanglaDigit value={templateList.length} /></>, tone: "default" },
        ]}
        actions={
          <Link
            href={`/school/${schoolSlug}/admin/certificates/templates`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            টেমপ্লেট ব্যবস্থাপনা
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section>
          {list.length === 0 ? (
            <EmptyState
              icon={<FileCheck2 className="size-8" />}
              title="এখনও কোন সার্টিফিকেট ইস্যু হয়নি"
              body="ডান পাশ থেকে ছাত্র ও টেমপ্লেট নির্বাচন করে সার্টিফিকেট ইস্যু করুন।"
              proTip={templateList.length === 0 ? "আগে Templates page থেকে অন্তত একটি টেমপ্লেট তৈরি করুন।" : null}
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>সিরিয়াল</TableHead>
                      <TableHead>ছাত্র</TableHead>
                      <TableHead>ধরন</TableHead>
                      <TableHead>তারিখ</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-xs">{c.serial_no}</TableCell>
                        <TableCell>
                          {c.students ? (
                            <>
                              <div className="font-medium">{c.students.name_bn}</div>
                              <div className="text-xs text-muted-foreground">{c.students.student_code}</div>
                            </>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="text-xs">
                          {c.certificate_templates ? (
                            <span className="rounded-full bg-muted px-2 py-0.5">
                              {typeLabel[c.certificate_templates.type] ?? c.certificate_templates.type}
                            </span>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="text-xs"><BengaliDate value={c.issued_on} /></TableCell>
                        <TableCell>
                          <Link
                            href={`/school/${schoolSlug}/admin/certificates/${c.id}`}
                            className="text-xs text-primary hover:underline"
                          >
                            দেখুন →
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </section>

        <aside>
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-lg font-semibold">নতুন সার্টিফিকেট</h2>
              <IssueCertificateForm schoolSlug={schoolSlug} templates={templateList} students={studentList} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
