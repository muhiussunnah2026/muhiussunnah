import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
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
import { GrantPermissionForm } from "./grant-form";
import { RevokeButton } from "./revoke-button";

type PageProps = { params: Promise<{ id: string }> };

export default async function StaffPermissionsPage({ params }: PageProps) {
  const { id } = await params;
  const membership = await requireActiveRole(ADMIN_ROLES);

  const schoolSlug = membership.school_slug;
  const supabase = await supabaseServer();
  // Independent queries — staff, permissions, classes, sections all keyed off id/school_id.
  const [staffRes, permissionsRes, classesRes, sectionsRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("school_users")
      .select("id, full_name_bn, full_name_en, email, role, status")
      .eq("id", id)
      .eq("school_id", membership.school_id)
      .single(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("user_permissions")
      .select("id, action, resource, scope_type, scope_id, granted_at, expires_at")
      .eq("school_user_id", id)
      .order("granted_at", { ascending: false }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("classes")
      .select("id, name_bn")
      .eq("school_id", membership.school_id)
      .order("display_order"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("sections")
      .select("id, name, class_id, classes!inner(name_bn, school_id)")
      .eq("classes.school_id", membership.school_id),
  ]);
  const { data: staff } = staffRes;
  const { data: permissions } = permissionsRes;
  const { data: classes } = classesRes;
  const { data: sections } = sectionsRes;

  if (!staff) notFound();

  const perms = (permissions ?? []) as Array<{
    id: string; action: string; resource: string; scope_type: string; scope_id: string | null;
    granted_at: string; expires_at: string | null;
  }>;

  const staffData = staff as { full_name_bn: string | null; full_name_en: string | null; email: string | null; role: string; status: string };

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Link href={`/admin/staff`} className="inline-flex items-center gap-1 text-sm hover:text-foreground">
            <ArrowLeft className="size-3.5" /> স্টাফ তালিকা
          </Link>
        }
        title={`অনুমতি — ${staffData.full_name_bn ?? staffData.full_name_en}`}
        subtitle="এই স্টাফের জন্য গ্রানুলার অনুমতি সেট করুন। ভূমিকা ভিত্তিক অনুমতি স্বয়ংক্রিয়ভাবে কাজ করে; এখান থেকে অতিরিক্ত অনুমতি দেওয়া যায়।"
        impact={[
          { label: `ভূমিকা: ${staffData.role}`, tone: "accent" },
          { label: `${perms.length} টি explicit grant`, tone: "default" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section>
          <Card>
            <CardContent className="p-0">
              {perms.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  কোন explicit অনুমতি নেই। ভূমিকা ভিত্তিক অনুমতি কাজ করছে।
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>কাজ</TableHead>
                      <TableHead>রিসোর্স</TableHead>
                      <TableHead>স্কোপ</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {perms.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs">{p.action}</TableCell>
                        <TableCell>{p.resource}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {p.scope_type}{p.scope_id ? `:${p.scope_id.slice(0, 8)}…` : ""}
                        </TableCell>
                        <TableCell className="text-right">
                          <RevokeButton
                            permissionId={p.id}
                            schoolUserId={id} schoolSlug={schoolSlug}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </section>

        <aside>
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-lg font-semibold">নতুন অনুমতি</h2>
              <GrantPermissionForm
                schoolUserId={id}
                classes={classes ?? []}
                sections={sections ?? []} schoolSlug={schoolSlug}
              />
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
