import { Award } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { AddScholarshipForm, AssignScholarshipForm } from "./forms";

export default async function ScholarshipsPage() {
  const membership = await requireActiveRole(ADMIN_ROLES);

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();
  // All three independent — scholarships + students by school_id, assignments by granted_at ordering.
  const [scholarshipsRes, assignmentsRes, studentsRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("scholarships")
      .select("id, name, description, amount_type, amount, student_scholarships(id)")
      .eq("school_id", membership.school_id)
      .order("name"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("student_scholarships")
      .select(`
        id, granted_at, valid_until, notes,
        scholarships ( name, amount_type, amount ),
        students ( id, name_bn, student_code, sections ( name, classes ( name_bn ) ) )
      `)
      .order("granted_at", { ascending: false })
      .limit(100),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("students")
      .select("id, name_bn, student_code")
      .eq("school_id", membership.school_id)
      .eq("status", "active")
      .order("name_bn")
      .limit(500),
  ]);
  const { data: scholarships } = scholarshipsRes;
  const { data: assignments } = assignmentsRes;
  const { data: students } = studentsRes;

  const schList = (scholarships ?? []) as { id: string; name: string; description: string | null; amount_type: string; amount: number; student_scholarships: { id: string }[] }[];
  const assignmentList = (assignments ?? []) as Array<{
    id: string; granted_at: string; valid_until: string | null; notes: string | null;
    scholarships: { name: string; amount_type: string; amount: number };
    students: { id: string; name_bn: string; student_code: string; sections: { name: string; classes: { name_bn: string } } | null };
  }>;

  return (
    <>
      <PageHeader
        title="বৃত্তি ব্যবস্থাপনা"
        subtitle="যোগ্য শিক্ষার্থীদের জন্য বৃত্তি তৈরি করুন, তারপর নির্দিষ্ট ছাত্রকে assign করুন। ফি invoice-এ amount স্বয়ংক্রিয়ভাবে adjust হবে (Phase 4-এ wire হবে)।"
        impact={[
          { label: <>বৃত্তি · <BanglaDigit value={schList.length} /></>, tone: "accent" },
          { label: <>প্রদত্ত · <BanglaDigit value={assignmentList.length} /></>, tone: "success" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="flex flex-col gap-4">
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">সক্রিয় বৃত্তি</h3>
              {schList.length === 0 ? (
                <EmptyState title="এখনও কোন বৃত্তি নেই" body="ডান পাশ থেকে প্রথম বৃত্তি তৈরি করুন।" />
              ) : (
                <ul className="divide-y divide-border/60">
                  {schList.map((s) => (
                    <li key={s.id} className="flex items-center justify-between py-3">
                      <div>
                        <div className="font-medium">{s.name}</div>
                        {s.description ? <div className="text-xs text-muted-foreground">{s.description}</div> : null}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {s.amount_type === "fixed" ? <>৳ <BanglaDigit value={Number(s.amount).toLocaleString("en-IN")} /></> : <><BanglaDigit value={s.amount} />%</>}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <BanglaDigit value={s.student_scholarships.length} /> জন পেয়েছে
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <h3 className="p-5 pb-3 text-sm font-semibold text-muted-foreground">প্রদানের ইতিহাস</h3>
              {assignmentList.length === 0 ? (
                <p className="px-5 pb-5 text-sm text-muted-foreground">এখনও কেউ বৃত্তি পায়নি।</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ছাত্র</TableHead>
                      <TableHead>বৃত্তি</TableHead>
                      <TableHead>ক্লাস</TableHead>
                      <TableHead className="text-right">amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignmentList.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>
                          <div className="font-medium">{a.students.name_bn}</div>
                          <div className="text-xs text-muted-foreground">{a.students.student_code}</div>
                        </TableCell>
                        <TableCell>{a.scholarships.name}</TableCell>
                        <TableCell className="text-xs">
                          {a.students.sections ? `${a.students.sections.classes.name_bn} — ${a.students.sections.name}` : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {a.scholarships.amount_type === "fixed" ? (
                            <>৳ <BanglaDigit value={Number(a.scholarships.amount).toLocaleString("en-IN")} /></>
                          ) : (
                            <><BanglaDigit value={a.scholarships.amount} />%</>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </section>

        <aside className="flex flex-col gap-4">
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Award className="size-4" /> নতুন বৃত্তি
              </h2>
              <AddScholarshipForm  schoolSlug={schoolSlug}/>
            </CardContent>
          </Card>

          {schList.length > 0 && (students?.length ?? 0) > 0 ? (
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-4 text-lg font-semibold">ছাত্রকে বৃত্তি দিন</h2>
                <AssignScholarshipForm
                  scholarships={schList.map((s) => ({ id: s.id, name: s.name }))}
                  students={(students ?? []) as { id: string; name_bn: string; student_code: string }[]}
                schoolSlug={schoolSlug} />
              </CardContent>
            </Card>
          ) : null}
        </aside>
      </div>
    </>
  );
}
