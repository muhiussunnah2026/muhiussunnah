import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { BanglaDigit } from "@/components/ui/bangla-digit";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/auth/session";

type SchoolRow = {
  id: string;
  slug: string;
  name_bn: string;
  name_en: string | null;
  type: "school" | "madrasa" | "both";
  eiin: string | null;
  phone: string | null;
  email: string | null;
  subscription_status: string;
  created_at: string;
};

const TYPE_TONES: Record<string, string> = {
  school: "bg-primary/10 text-primary",
  madrasa: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  both: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
};

export default async function SchoolsPage() {
  await requireSuperAdmin();
  const t = await getTranslations("superAdmin");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = supabaseAdmin() as any;

  const { data: schoolsData } = await admin
    .from("schools")
    .select(
      "id, slug, name_bn, name_en, type, eiin, phone, email, subscription_status, created_at",
    )
    .order("created_at", { ascending: false });
  const schools: SchoolRow[] = (schoolsData ?? []) as SchoolRow[];

  // Per-school student counts in one grouped read
  const { data: studentsData } = await admin
    .from("students")
    .select("school_id")
    .eq("status", "active")
    .limit(50000);
  const studentCount = new Map<string, number>();
  for (const s of (studentsData ?? []) as { school_id: string }[]) {
    studentCount.set(s.school_id, (studentCount.get(s.school_id) ?? 0) + 1);
  }

  const total = schools.length;
  const schoolsOnly = schools.filter((s) => s.type === "school").length;
  const madrasaOnly = schools.filter((s) => s.type === "madrasa").length;
  const both = schools.filter((s) => s.type === "both").length;

  return (
    <>
      <PageHeader
        title={t("schools_page_title")}
        subtitle={t("schools_page_subtitle")}
        impact={[
          {
            label: (
              <>
                {t("schools_impact_total")} · <BanglaDigit value={total} />
              </>
            ),
            tone: "accent",
          },
        ]}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label={t("schools_metric_total")} value={total} />
        <MetricCard label={t("schools_metric_school")} value={schoolsOnly} tone="accent" />
        <MetricCard label={t("schools_metric_madrasa")} value={madrasaOnly} tone="success" />
        <MetricCard label={t("schools_metric_both")} value={both} />
      </div>

      {schools.length === 0 ? (
        <EmptyState
          icon={<Building2 className="size-8" />}
          title={t("schools_empty_title")}
          body={t("schools_empty_body")}
          primaryAction={
            <Link
              href="/register-school"
              className={buttonVariants({ variant: "default", size: "sm" })}
            >
              {t("schools_empty_cta")}
            </Link>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("schools_col_school")}</TableHead>
                  <TableHead>{t("schools_col_type")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("schools_col_eiin")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("schools_col_contact")}</TableHead>
                  <TableHead className="text-right">{t("schools_col_students")}</TableHead>
                  <TableHead>{t("schools_col_status")}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t("schools_col_created")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Link
                        href={`/school/${s.slug}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {s.name_bn}
                      </Link>
                      <div className="font-mono text-xs text-muted-foreground">/{s.slug}</div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_TONES[s.type] ?? ""}`}
                      >
                        {t(`schools_type_${s.type}` as Parameters<typeof t>[0])}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-xs">
                      {s.eiin ?? "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs">
                      <div>{s.phone ?? "—"}</div>
                      <div className="text-muted-foreground">{s.email ?? ""}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <BanglaDigit value={studentCount.get(s.id) ?? 0} />
                    </TableCell>
                    <TableCell>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                        {s.subscription_status}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {new Date(s.created_at).toLocaleDateString()}
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
