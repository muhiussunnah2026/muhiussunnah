import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";

export default async function TeacherAssignmentsPage() {
  const membership = await requireActiveRole(["CLASS_TEACHER", "SUBJECT_TEACHER", "MADRASA_USTADH"]);

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();

  // Teacher's sections via teacher_assignments
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: teachings } = await (supabase as any)
    .from("teacher_assignments")
    .select("section_id")
    .eq("school_user_id", membership.school_user_id);

  const sectionIds = [...new Set(((teachings ?? []) as { section_id: string }[]).map((t) => t.section_id))];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: assignments } = sectionIds.length > 0
    ? await (supabase as any)
        .from("assignments")
        .select("id, title, due_date, max_marks, sections ( name_bn, classes ( name_bn ) ), subjects ( name_bn )")
        .in("section_id", sectionIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  type Row = { id: string; title: string; due_date: string | null; max_marks: number | null; sections: { name_bn: string; classes: { name_bn: string } } | null; subjects: { name_bn: string } | null };
  const list = (assignments ?? []) as Row[];

  return (
    <>
      <PageHeader
        title="আমার অ্যাসাইনমেন্ট"
        subtitle="আপনার শ্রেণিগুলোতে দেওয়া অ্যাসাইনমেন্ট ও জমা ব্যবস্থাপনা।"
        impact={[{ label: <><BanglaDigit value={list.length} /> অ্যাসাইনমেন্ট</>, tone: "default" }]}
        actions={
          <Link href={`/admin/assignments`} className={buttonVariants({ variant: "default", size: "sm" })}>
            নতুন অ্যাসাইনমেন্ট
          </Link>
        }
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck className="size-8" />}
          title="এখনো কোন অ্যাসাইনমেন্ট নেই"
          body="উপরের বাটনে ক্লিক করে প্রথম অ্যাসাইনমেন্ট তৈরি করুন।"
        />
      ) : (
        <div className="grid gap-3">
          {list.map((a) => (
            <Link key={a.id} href={`/admin/assignments/${a.id}`}>
              <Card className="transition hover:shadow-hover">
                <CardContent className="p-4 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="font-medium">{a.title}</h3>
                    <div className="text-xs text-muted-foreground">
                      {a.sections ? `${a.sections.classes?.name_bn} — ${a.sections.name_bn}` : "—"} · {a.subjects?.name_bn ?? "—"}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    {a.due_date && (
                      <Badge variant={new Date(a.due_date) < new Date() ? "destructive" : "secondary"}>
                        শেষ: {new Date(a.due_date).toLocaleDateString("bn-BD")}
                      </Badge>
                    )}
                    {a.max_marks && <Badge variant="outline">মার্কস <BanglaDigit value={a.max_marks} /></Badge>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
