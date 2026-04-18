import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { AssignmentForm } from "./assignment-form";

type PageProps = { params: Promise<{ schoolSlug: string }> };

export default async function AssignmentsPage({ params }: PageProps) {
  const { schoolSlug } = await params;
  const membership = await requireRole(schoolSlug, [...ADMIN_ROLES, "CLASS_TEACHER", "SUBJECT_TEACHER"]);

  const supabase = await supabaseServer();

  const [{ data: assignments }, { data: sections }, { data: subjects }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("assignments")
      .select("id, title, due_date, max_marks, created_at, sections ( name_bn, classes ( name_bn ) ), subjects ( name_bn )")
      .eq("school_id", membership.school_id)
      .order("created_at", { ascending: false })
      .limit(100),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from("sections").select("id, name_bn, classes ( name_bn )").eq("school_id", membership.school_id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from("subjects").select("id, name_bn").eq("school_id", membership.school_id),
  ]);

  type Row = {
    id: string;
    title: string;
    due_date: string | null;
    max_marks: number | null;
    created_at: string;
    sections: { name_bn: string; classes: { name_bn: string } } | null;
    subjects: { name_bn: string } | null;
  };
  const list = (assignments ?? []) as Row[];

  const sectionOpts = ((sections ?? []) as Array<{ id: string; name_bn: string; classes: { name_bn: string } | null }>).map((s) => ({
    id: s.id,
    name_bn: s.name_bn,
    class_bn: s.classes?.name_bn ?? "",
  }));

  return (
    <>
      <PageHeader
        title="অ্যাসাইনমেন্ট"
        subtitle="ছাত্রদের জন্য অ্যাসাইনমেন্ট তৈরি করুন, জমা দেখুন, গ্রেড দিন।"
        impact={[
          { label: <><BanglaDigit value={list.length} /> অ্যাসাইনমেন্ট</>, tone: "default" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section>
          {list.length === 0 ? (
            <EmptyState
              icon={<ClipboardCheck className="size-8" />}
              title="কোন অ্যাসাইনমেন্ট নেই"
              body="ডান পাশের ফর্ম থেকে প্রথম অ্যাসাইনমেন্ট তৈরি করুন। ছাত্ররা portal-এ দেখতে পাবে ও জমা দিতে পারবে।"
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>শিরোনাম</TableHead>
                      <TableHead>শ্রেণি / বিষয়</TableHead>
                      <TableHead>শেষ তারিখ</TableHead>
                      <TableHead className="text-right">মার্কস</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>
                          <Link href={`/school/${schoolSlug}/admin/assignments/${a.id}`} className="font-medium hover:underline">
                            {a.title}
                          </Link>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div>{a.sections ? `${a.sections.classes?.name_bn} — ${a.sections.name_bn}` : "—"}</div>
                          <div className="text-muted-foreground">{a.subjects?.name_bn ?? "—"}</div>
                        </TableCell>
                        <TableCell className="text-xs">
                          {a.due_date ? (
                            <Badge variant={new Date(a.due_date) < new Date() ? "destructive" : "secondary"}>
                              {new Date(a.due_date).toLocaleDateString("bn-BD")}
                            </Badge>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="text-right">{a.max_marks ? <BanglaDigit value={a.max_marks} /> : "—"}</TableCell>
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
              <h2 className="mb-4 text-base font-semibold">নতুন অ্যাসাইনমেন্ট</h2>
              <AssignmentForm
                schoolSlug={schoolSlug}
                sections={sectionOpts}
                subjects={(subjects ?? []) as Array<{ id: string; name_bn: string }>}
              />
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
