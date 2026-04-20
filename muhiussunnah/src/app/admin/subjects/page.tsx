import { BookOpenText } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { AddSubjectForm } from "./add-subject-form";

export default async function SubjectsPage() {
  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();
  // Independent — both keyed off school_id.
  const [subjectsRes, classesRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("subjects")
      .select(`
        id, name_bn, name_en, name_ar, code, full_marks, pass_marks, is_optional, class_id,
        classes ( name_bn, name_en )
      `)
      .eq("school_id", membership.school_id)
      .order("display_order", { ascending: true }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("classes")
      .select("id, name_bn, name_en")
      .eq("school_id", membership.school_id)
      .order("display_order"),
  ]);
  const { data: subjects } = subjectsRes;
  const { data: classes } = classesRes;

  const subjectList = (subjects ?? []) as Array<{
    id: string; name_bn: string; name_en: string | null; name_ar: string | null;
    code: string | null; full_marks: number; pass_marks: number; is_optional: boolean;
    class_id: string | null; classes: { name_bn: string; name_en: string | null } | null;
  }>;

  return (
    <>
      <PageHeader
        title="বিষয় ব্যবস্থাপনা"
        subtitle="প্রতিটি বিষয়ের পূর্ণমান ও পাশমান সেট করুন। পরে মার্ক্স এন্ট্রি ও রিপোর্ট কার্ডে এই মান ব্যবহৃত হবে।"
        impact={[{ label: <>মোট বিষয় · <BanglaDigit value={subjectList.length} /></>, tone: "accent" }]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section>
          {subjectList.length === 0 ? (
            <EmptyState
              icon={<BookOpenText className="size-8" />}
              title="এখনও কোন বিষয় নেই"
              body="ডান পাশের ফর্ম থেকে প্রথম বিষয় যোগ করুন। ক্লাস সিলেক্ট করলে সেই ক্লাসের জন্য নির্দিষ্ট থাকবে, নাহলে সকল ক্লাসে প্রযোজ্য হবে।"
              proTip="সাধারণ বিষয় (বাংলা, ইংরেজি, গণিত) একবার যোগ করে শ্রেণি-বিষয় অ্যাসাইনমেন্ট থেকে বহু শ্রেণিতে ব্যবহার করুন।"
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>নাম</TableHead>
                      <TableHead className="hidden md:table-cell">শ্রেণি</TableHead>
                      <TableHead className="hidden md:table-cell">কোড</TableHead>
                      <TableHead className="text-right">পূর্ণমান</TableHead>
                      <TableHead className="text-right">পাশ</TableHead>
                      <TableHead className="hidden md:table-cell">ধরন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjectList.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div className="font-medium">{s.name_bn}</div>
                          {s.name_en ? <div className="text-xs text-muted-foreground">{s.name_en}</div> : null}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {s.classes?.name_bn ?? "সকল"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{s.code ?? "—"}</TableCell>
                        <TableCell className="text-right"><BanglaDigit value={s.full_marks} /></TableCell>
                        <TableCell className="text-right"><BanglaDigit value={s.pass_marks} /></TableCell>
                        <TableCell className="hidden md:table-cell text-xs">
                          {s.is_optional ? <span className="rounded-full bg-warning/10 px-2 py-0.5 text-warning">ঐচ্ছিক</span> : <span className="text-muted-foreground">বাধ্যতামূলক</span>}
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
              <h2 className="mb-4 text-lg font-semibold">নতুন বিষয়</h2>
              <AddSubjectForm classes={classes ?? []} schoolSlug={schoolSlug} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
