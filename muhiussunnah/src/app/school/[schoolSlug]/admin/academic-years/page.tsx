import { CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BengaliDate } from "@/components/ui/bengali-date";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { AddYearForm } from "./add-year-form";

type PageProps = { params: Promise<{ schoolSlug: string }> };

export default async function AcademicYearsPage({ params }: PageProps) {
  const { schoolSlug } = await params;
  const membership = await requireRole(schoolSlug, ADMIN_ROLES);

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("academic_years")
    .select("id, name, start_date, end_date, is_active")
    .eq("school_id", membership.school_id)
    .order("start_date", { ascending: false });

  const list = (data ?? []) as { id: string; name: string; start_date: string; end_date: string; is_active: boolean }[];

  return (
    <>
      <PageHeader
        title="শিক্ষাবর্ষ"
        subtitle="প্রতিটি সেশন/বছর এখানে তৈরি করুন। পরীক্ষা, ফি invoice, report card সবাই একটি Academic Year-এর সাথে যুক্ত থাকে।"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section>
          {list.length === 0 ? (
            <EmptyState
              icon={<CalendarDays className="size-8" />}
              title="এখনও কোন শিক্ষাবর্ষ নেই"
              body="ডান পাশ থেকে প্রথম শিক্ষাবর্ষ যোগ করুন। যেমন: '২০২৫-২০২৬'।"
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>নাম</TableHead>
                      <TableHead>শুরু</TableHead>
                      <TableHead>শেষ</TableHead>
                      <TableHead>স্ট্যাটাস</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.map((y) => (
                      <TableRow key={y.id}>
                        <TableCell className="font-medium">{y.name}</TableCell>
                        <TableCell><BengaliDate value={y.start_date} /></TableCell>
                        <TableCell><BengaliDate value={y.end_date} /></TableCell>
                        <TableCell>
                          {y.is_active ? (
                            <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">সক্রিয়</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
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
              <h2 className="mb-4 text-lg font-semibold">নতুন শিক্ষাবর্ষ</h2>
              <AddYearForm schoolSlug={schoolSlug} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
