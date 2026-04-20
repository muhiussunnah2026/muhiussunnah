import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { BengaliDate } from "@/components/ui/bengali-date";
import { supabaseServer } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { PrintButton } from "./print-button";

type PageProps = { params: Promise<{ schoolSlug: string; id: string }> };

/** Replace {{variable}} with values. Ignores unknown placeholders. */
function fillTemplate(html: string, vars: Record<string, string>): string {
  return html.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, name) => vars[name] ?? "");
}

export default async function CertificatePrintPage({ params }: PageProps) {
  const { schoolSlug, id } = await params;
  const membership = await requireRole(schoolSlug, ADMIN_ROLES);

  const supabase = await supabaseServer();
  // Independent — cert lookup by id, school lookup by membership.school_id (known pre-query).
  const [certRes, schoolRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("certificates_issued")
      .select(`
        id, serial_no, issued_on, data,
        school_id,
        students ( id, name_bn, name_en, student_code, date_of_birth, sections(name, classes(name_bn)) ),
        certificate_templates ( name, type, html_template, orientation, paper_size, variables )
      `)
      .eq("id", id)
      .single(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("schools")
      .select("name_bn, name_en, eiin")
      .eq("id", membership.school_id)
      .single(),
  ]);
  const { data: cert } = certRes;
  const { data: school } = schoolRes;

  if (!cert || cert.school_id !== membership.school_id) notFound();

  const student = cert.students as { id: string; name_bn: string; name_en: string | null; student_code: string; date_of_birth: string | null; sections: { name: string; classes: { name_bn: string } } | null } | null;
  const template = cert.certificate_templates as { name: string; type: string; html_template: string; orientation: string; paper_size: string } | null;

  const extra = (cert.data ?? {}) as Record<string, unknown>;
  const vars: Record<string, string> = {
    student_name: student?.name_bn ?? "",
    student_name_en: student?.name_en ?? "",
    student_code: student?.student_code ?? "",
    class: student?.sections ? `${student.sections.classes.name_bn} — ${student.sections.name}` : "",
    date_of_birth: student?.date_of_birth ?? "",
    school_name: school?.name_bn ?? "",
    school_name_en: school?.name_en ?? "",
    eiin: school?.eiin ?? "",
    date: new Date(cert.issued_on).toLocaleDateString("bn-BD"),
    serial_no: cert.serial_no,
    ...Object.fromEntries(Object.entries(extra).map(([k, v]) => [k, String(v ?? "")])),
  };

  const html = template ? fillTemplate(template.html_template, vars) : "";

  return (
    <>
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link href={`/school/${schoolSlug}/admin/certificates`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
          <ArrowLeft className="size-3.5" /> সার্টিফিকেট তালিকা
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono">{cert.serial_no}</span>
          <span>·</span>
          <BengaliDate value={cert.issued_on} />
          <PrintButton />
        </div>
      </div>

      <article
        className="certificate mx-auto rounded-lg border border-border/60 bg-white p-8 shadow-soft print:shadow-none print:border-0"
        style={{ color: "#000", maxWidth: template?.orientation === "landscape" ? "1100px" : "800px" }}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <div className="mt-4 text-center text-xs text-muted-foreground print:hidden">
        সিরিয়াল: <span className="font-mono">{cert.serial_no}</span> · ইস্যু তারিখ: <BengaliDate value={cert.issued_on} />
      </div>
    </>
  );
}
