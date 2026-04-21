import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { resolveStudentId } from "@/lib/students/resolve";
import { EditStudentForm } from "./edit-form";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditStudentPage({ params }: PageProps) {
  const { id: idOrCode } = await params;
  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);
  const schoolSlug = membership.school_slug;

  // Admin client: requireActiveRole() already verified this user is an admin
  // of this school, and all queries are scoped by school_id. Needed because
  // RLS on `sections` blocks the nested join when using a user-session client.
  const supabase = supabaseAdmin();
  // Accept either a UUID or a student_code in the URL segment.
  const id = await resolveStudentId(idOrCode, membership.school_id);
  if (!id) notFound();
  const [studentRes, classesRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("students")
      .select(`
        id, student_code, name_bn, name_en, name_ar, roll, gender, photo_url,
        blood_group, religion, date_of_birth, admission_date, guardian_phone,
        address_present, address_permanent, previous_school, status,
        admission_fee, tuition_fee, transport_fee, rf_id_card, nid_birth_cert,
        section_id,
        sections ( id, name, classes ( id, name_bn ) ),
        student_guardians ( id, name_bn, phone, relation, is_primary )
      `)
      .eq("id", id)
      .eq("school_id", membership.school_id)
      .single(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("classes")
      .select("id, name_bn, sections ( id, name )")
      .eq("school_id", membership.school_id)
      .order("display_order"),
  ]);

  const { data: s } = studentRes;
  const { data: classes } = classesRes;

  if (!s) notFound();

  const student = s as {
    id: string; student_code: string; name_bn: string; name_en: string | null; name_ar: string | null;
    roll: number | null; gender: string | null; photo_url: string | null;
    blood_group: string | null; religion: string | null; date_of_birth: string | null;
    admission_date: string | null; guardian_phone: string | null;
    address_present: string | null; address_permanent: string | null; previous_school: string | null;
    status: string;
    admission_fee: number | null; tuition_fee: number | null; transport_fee: number | null;
    rf_id_card: string | null; nid_birth_cert: string | null;
    section_id: string | null;
    sections: { id: string; name: string; classes: { id: string; name_bn: string } } | null;
    student_guardians: { id: string; name_bn: string; phone: string | null; relation: string; is_primary: boolean }[];
  };

  const classList = (classes ?? []) as Array<{
    id: string;
    name_bn: string;
    sections: { id: string; name: string }[];
  }>;

  const father = student.student_guardians?.find((g) => g.relation === "father") ?? null;
  const mother = student.student_guardians?.find((g) => g.relation === "mother") ?? null;
  const extra = student.student_guardians?.find((g) => g.relation !== "father" && g.relation !== "mother") ?? null;

  const t = await getTranslations("editStudent");
  const tStatus = await getTranslations("studentsFilters");

  return (
    <>
      <Link
        href={`/students/${student.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3"
      >
        <ArrowLeft className="size-3.5" /> {t("back_link")}
      </Link>

      <PageHeader
        title={t("page_title", { name: student.name_bn })}
        subtitle={
          student.sections
            ? t("page_subtitle_with_class", {
                code: student.student_code,
                classname: student.sections.classes.name_bn,
                section: student.sections.name,
              })
            : t("page_subtitle_no_class", { code: student.student_code })
        }
        impact={[
          {
            label: t("impact_status", {
              status: (() => {
                try { return tStatus(`status_${student.status}`); }
                catch { return student.status; }
              })(),
            }),
            tone: student.status === "active" ? "success" : "default",
          },
        ]}
      />

      <Card>
        <CardContent className="p-5 md:p-6">
          <EditStudentForm
            schoolSlug={schoolSlug}
            student={student}
            father={father}
            mother={mother}
            extra={extra}
            classes={classList}
          />
        </CardContent>
      </Card>
    </>
  );
}
