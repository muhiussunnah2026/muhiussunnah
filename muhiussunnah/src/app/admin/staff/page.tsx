import Link from "next/link";
import { Users2, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { supabaseServer } from "@/lib/supabase/server";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { InviteStaffForm } from "./invite-staff-form";

const roleLabels: Record<string, string> = {
  SCHOOL_ADMIN: "প্রিন্সিপাল",
  VICE_PRINCIPAL: "ভাইস প্রিন্সিপাল",
  ACCOUNTANT: "হিসাবরক্ষক",
  BRANCH_ADMIN: "শাখা প্রধান",
  CLASS_TEACHER: "শ্রেণি শিক্ষক",
  SUBJECT_TEACHER: "বিষয় শিক্ষক",
  MADRASA_USTADH: "উস্তাদ",
  LIBRARIAN: "গ্রন্থাগারিক",
  TRANSPORT_MANAGER: "পরিবহন ব্যবস্থাপক",
  HOSTEL_WARDEN: "হোস্টেল ওয়ার্ডেন",
  CANTEEN_MANAGER: "ক্যান্টিন ব্যবস্থাপক",
  COUNSELOR: "কাউন্সেলর",
};

export default async function StaffPage() {
  const membership = await requireActiveRole(ADMIN_ROLES);

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();
  // Fire both queries concurrently — they're independent. Collapsing
  // two sequential round-trips saves ~200-500ms on every page load.
  const [staffRes, branchesRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("school_users")
      .select("id, full_name_bn, full_name_en, email, phone, role, status, employee_code, branch_id, joined_at")
      .eq("school_id", membership.school_id)
      .not("role", "in", "(STUDENT,PARENT)")
      .order("joined_at", { ascending: false }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("school_branches")
      .select("id, name")
      .eq("school_id", membership.school_id),
  ]);
  const { data: staff } = staffRes;
  const { data: branches } = branchesRes;

  const staffList = (staff ?? []) as Array<{
    id: string; full_name_bn: string | null; full_name_en: string | null;
    email: string | null; phone: string | null; role: string; status: string;
    employee_code: string | null; branch_id: string | null; joined_at: string;
  }>;

  const active = staffList.filter((s) => s.status === "active").length;
  const teachers = staffList.filter((s) => ["CLASS_TEACHER", "SUBJECT_TEACHER", "MADRASA_USTADH"].includes(s.role)).length;

  return (
    <>
      <PageHeader
        title="শিক্ষক ও স্টাফ"
        subtitle="শিক্ষক, হিসাবরক্ষক, লাইব্রেরিয়ান, পরিবহন ব্যবস্থাপক — সবাইকে এখান থেকে যোগ ও ব্যবস্থাপনা করুন।"
        impact={[
          { label: <>মোট · <BanglaDigit value={staffList.length} /></>, tone: "accent" },
          { label: <>সক্রিয় · <BanglaDigit value={active} /></>, tone: "success" },
          { label: <>শিক্ষক · <BanglaDigit value={teachers} /></>, tone: "default" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section>
          {staffList.length === 0 ? (
            <EmptyState
              icon={<Users2 className="size-8" />}
              title="👨‍🏫 প্রথম শিক্ষক যোগ করুন"
              body="ডান পাশের ফর্ম থেকে শিক্ষক বা স্টাফ আমন্ত্রণ জানান। তাদের ইমেইলে পাসওয়ার্ড সেট করার লিংক চলে যাবে।"
              proTip="আপনি নিজেও SCHOOL_ADMIN হিসেবে সিস্টেমে আছেন। একাধিক অ্যাডমিন থাকলে কাজ ভাগাভাগি হয়, backup থাকে।"
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>নাম</TableHead>
                      <TableHead className="hidden md:table-cell">ভূমিকা</TableHead>
                      <TableHead className="hidden lg:table-cell">যোগাযোগ</TableHead>
                      <TableHead className="hidden md:table-cell">স্ট্যাটাস</TableHead>
                      <TableHead className="text-right">কার্যক্রম</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffList.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarFallback className="bg-primary/10 text-xs text-primary">
                                {(s.full_name_bn ?? s.full_name_en ?? "?").charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{s.full_name_bn ?? s.full_name_en}</div>
                              {s.employee_code ? <div className="text-xs text-muted-foreground font-mono">{s.employee_code}</div> : null}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
                            {roleLabels[s.role] ?? s.role}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                          {s.email ? <div>{s.email}</div> : null}
                          {s.phone ? <div>{s.phone}</div> : null}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className={`rounded-full px-2 py-0.5 text-xs ${s.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                            {s.status === "active" ? "সক্রিয়" : s.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/admin/staff/${s.id}/permissions`}
                            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                          >
                            অনুমতি
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
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <UserPlus className="size-4" />
                নতুন স্টাফ আমন্ত্রণ
              </h2>
              <InviteStaffForm branches={branches ?? []} schoolSlug={schoolSlug} />
            </CardContent>
          </Card>
          <Link
            href={`/admin/settings`}
            className={buttonVariants({ variant: "ghost", size: "sm", className: "mt-2 w-full" })}
          >
            সেটিংস
          </Link>
        </aside>
      </div>
    </>
  );
}
