import Link from "next/link";
import { FileSpreadsheet, UserPlus, Users2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { supabaseServer } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { StudentsFilters } from "./filters";

type PageProps = {
  params: Promise<{ schoolSlug: string }>;
  searchParams: Promise<{ class_id?: string; section_id?: string; status?: string; q?: string }>;
};

const statusLabel: Record<string, string> = {
  active: "সক্রিয়",
  transferred: "বদলি হয়েছে",
  passed_out: "পাশ করেছে",
  dropped: "বাদ",
  suspended: "স্থগিত",
};

export default async function StudentsListPage({ params, searchParams }: PageProps) {
  const { schoolSlug } = await params;
  const search = await searchParams;
  const membership = await requireRole(schoolSlug, [...ADMIN_ROLES, "ACCOUNTANT"]);

  const supabase = await supabaseServer();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("students")
    .select(`
      id, student_code, name_bn, name_en, roll, gender, photo_url, status, guardian_phone,
      section_id, sections ( id, name, class_id, classes ( id, name_bn ) )
    `)
    .eq("school_id", membership.school_id)
    .order("created_at", { ascending: false })
    .limit(500);

  if (search.status) query = query.eq("status", search.status);
  if (search.section_id) query = query.eq("section_id", search.section_id);
  if (search.q) query = query.ilike("name_bn", `%${search.q}%`);

  const { data } = await query;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: classes } = await (supabase as any)
    .from("classes")
    .select("id, name_bn, sections(id, name)")
    .eq("school_id", membership.school_id)
    .order("display_order");

  const students = (data ?? []) as Array<{
    id: string; student_code: string; name_bn: string; name_en: string | null;
    roll: number | null; gender: string | null; photo_url: string | null; status: string;
    guardian_phone: string | null; section_id: string | null;
    sections: { id: string; name: string; classes: { name_bn: string } } | null;
  }>;

  const stats = {
    total: students.length,
    active: students.filter((s) => s.status === "active").length,
  };

  return (
    <>
      <PageHeader
        title="ছাত্র-ছাত্রী ব্যবস্থাপনা"
        subtitle={
          stats.total > 0
            ? `${stats.total.toString()} জনের মধ্যে ${stats.active.toString()} সক্রিয়`
            : "এখনই প্রথম শিক্ষার্থী ভর্তি করুন — ৩০ সেকেন্ডে হয়ে যাবে।"
        }
        impact={[
          { label: <>মোট · <BanglaDigit value={stats.total} /></>, tone: "accent" },
          { label: <>সক্রিয় · <BanglaDigit value={stats.active} /></>, tone: "success" },
        ]}
        actions={
          <div className="flex gap-2">
            <Link
              href={`/school/${schoolSlug}/admin/students/bulk-import`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <FileSpreadsheet className="me-1 size-3.5" />
              Excel Import
            </Link>
            <Link
              href={`/school/${schoolSlug}/admin/students/new`}
              className={buttonVariants({ size: "sm", className: "bg-gradient-primary text-white" })}
            >
              <UserPlus className="me-1 size-3.5" />
              নতুন ভর্তি
            </Link>
          </div>
        }
      />

      <StudentsFilters
        schoolSlug={schoolSlug}
        classes={classes ?? []}
        initial={search}
      />

      {students.length === 0 ? (
        <EmptyState
          icon={<Users2 className="size-8" />}
          title="🎓 প্রথম শিক্ষার্থী ভর্তি করুন"
          body="একজন ছাত্র যোগ করতে মাত্র ৩০ সেকেন্ড লাগবে। বাল্ক import করলে ১০০+ ছাত্র একসাথে ১ মিনিটে!"
          primaryAction={
            <Link href={`/school/${schoolSlug}/admin/students/new`} className={buttonVariants({ className: "bg-gradient-primary text-white" })}>
              নতুন ভর্তি
            </Link>
          }
          secondaryAction={
            <Link href={`/school/${schoolSlug}/admin/students/bulk-import`} className={buttonVariants({ variant: "outline" })}>
              Excel থেকে import
            </Link>
          }
          proTip="Excel template ডাউনলোড করে পূরণ করে upload করলে পুর ো ক্লাসের ডেটা মুহূর্তে ঢুকে যাবে।"
        />
      ) : (
        <Card className="mt-4">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ছাত্র/ছাত্রী</TableHead>
                  <TableHead className="hidden md:table-cell">কোড</TableHead>
                  <TableHead className="hidden md:table-cell">ক্লাস</TableHead>
                  <TableHead className="hidden lg:table-cell">অভিভাবক</TableHead>
                  <TableHead className="hidden md:table-cell">স্ট্যাটাস</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id} className="cursor-pointer">
                    <TableCell>
                      <Link href={`/school/${schoolSlug}/admin/students/${s.id}`} className="flex items-center gap-3 hover:underline-offset-4 hover:underline">
                        <Avatar className="size-8">
                          {s.photo_url ? <AvatarImage src={s.photo_url} alt={s.name_bn} /> : null}
                          <AvatarFallback className="bg-primary/10 text-xs text-primary">
                            {s.name_bn.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{s.name_bn}</div>
                          {s.roll ? (
                            <div className="text-xs text-muted-foreground">
                              রোল: <BanglaDigit value={s.roll} />
                            </div>
                          ) : null}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-xs">{s.student_code}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {s.sections ? (
                        <span>{s.sections.classes.name_bn} — {s.sections.name}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                      {s.guardian_phone ?? "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${
                        s.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                      }`}>
                        {statusLabel[s.status] ?? s.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
