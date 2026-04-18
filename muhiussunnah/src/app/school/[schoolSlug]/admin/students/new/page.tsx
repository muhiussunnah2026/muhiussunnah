import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { supabaseServer } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { NewStudentForm } from "./new-student-form";

type PageProps = { params: Promise<{ schoolSlug: string }> };

export default async function NewStudentPage({ params }: PageProps) {
  const { schoolSlug } = await params;
  const membership = await requireRole(schoolSlug, [...ADMIN_ROLES, "ACCOUNTANT"]);

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sections } = await (supabase as any)
    .from("sections")
    .select("id, name, class_id, classes!inner(name_bn, school_id, display_order)")
    .eq("classes.school_id", membership.school_id)
    .order("classes(display_order)", { ascending: true });

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Link href={`/school/${schoolSlug}/admin/students`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> ছাত্র তালিকা
          </Link>
        }
        title="নতুন শিক্ষার্থী ভর্তি"
        subtitle="ফর্ম পূরণ করতে প্রায় ২ মিনিট লাগবে। পরে সকল তথ্য edit করা যাবে।"
        impact={[
          { label: "⏱️ ~২ মিনিট", tone: "accent" },
          { label: "💾 ছাত্র কোড স্বয়ংক্রিয়ভাবে তৈরি হবে", tone: "default" },
        ]}
      />

      <Card>
        <CardContent className="p-5 md:p-6">
          <NewStudentForm schoolSlug={schoolSlug} sections={sections ?? []} />
        </CardContent>
      </Card>
    </>
  );
}
