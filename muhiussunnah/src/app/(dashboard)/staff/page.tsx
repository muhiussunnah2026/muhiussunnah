import Link from "next/link";
import { getTranslations } from "next-intl/server";
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

export default async function StaffPage() {
  const membership = await requireActiveRole(ADMIN_ROLES);
  const t = await getTranslations("staff");

  const roleLabels: Record<string, string> = {
    SCHOOL_ADMIN: t("role_SCHOOL_ADMIN"),
    VICE_PRINCIPAL: t("role_VICE_PRINCIPAL"),
    ACCOUNTANT: t("role_ACCOUNTANT"),
    BRANCH_ADMIN: t("role_BRANCH_ADMIN"),
    CLASS_TEACHER: t("role_CLASS_TEACHER"),
    SUBJECT_TEACHER: t("role_SUBJECT_TEACHER"),
    MADRASA_USTADH: t("role_MADRASA_USTADH"),
    LIBRARIAN: t("role_LIBRARIAN"),
    TRANSPORT_MANAGER: t("role_TRANSPORT_MANAGER"),
    HOSTEL_WARDEN: t("role_HOSTEL_WARDEN"),
    CANTEEN_MANAGER: t("role_CANTEEN_MANAGER"),
    COUNSELOR: t("role_COUNSELOR"),
  };

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();
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
        title={t("page_title")}
        subtitle={t("page_subtitle")}
        impact={[
          { label: <>{t("tally_total")} · <BanglaDigit value={staffList.length} /></>, tone: "accent" },
          { label: <>{t("tally_active")} · <BanglaDigit value={active} /></>, tone: "success" },
          { label: <>{t("tally_teachers")} · <BanglaDigit value={teachers} /></>, tone: "default" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section>
          {staffList.length === 0 ? (
            <EmptyState
              icon={<Users2 className="size-8" />}
              title={t("empty_title")}
              body={t("empty_body")}
              proTip={t("empty_tip")}
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("col_name")}</TableHead>
                      <TableHead className="hidden md:table-cell">{t("col_role")}</TableHead>
                      <TableHead className="hidden lg:table-cell">{t("col_contact")}</TableHead>
                      <TableHead className="hidden md:table-cell">{t("col_status")}</TableHead>
                      <TableHead className="text-right">{t("col_actions")}</TableHead>
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
                            {s.status === "active" ? t("status_active") : s.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/staff/${s.id}/permissions`}
                            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                          >
                            {t("action_permissions")}
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
                {t("invite_heading")}
              </h2>
              <InviteStaffForm branches={branches ?? []} schoolSlug={schoolSlug} />
            </CardContent>
          </Card>
          <Link
            href={`/settings`}
            className={buttonVariants({ variant: "ghost", size: "sm", className: "mt-2 w-full" })}
          >
            {t("settings_cta")}
          </Link>
        </aside>
      </div>
    </>
  );
}
