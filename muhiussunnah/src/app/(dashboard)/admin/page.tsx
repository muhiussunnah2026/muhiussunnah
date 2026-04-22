import {
  BookOpen,
  CalendarDays,
  CreditCard,
  FileText,
  Megaphone,
  MessageSquare,
  Receipt,
  ScrollText,
  TrendingDown,
  TrendingUp,
  UserCog,
  UserPlus,
  Users,
  Users2,
  Wallet,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { RealtimeDashboardIndicator } from "@/components/dashboard/realtime-dashboard-indicator";
import { ClassDonut } from "@/components/dashboard/class-donut";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireActiveRole } from "@/lib/auth/active-school";
import { ADMIN_ROLES, isTeacherRole, type UserRole } from "@/lib/auth/roles";
import { formatDualDate } from "@/lib/utils/date";
import { resolveDateRange, trendPct } from "@/lib/utils/date-range";

type PageProps = {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
};

/**
 * Cache the admin dashboard for 60s between requests.
 *
 * Reason: the page runs ~19 aggregate queries against Supabase. On a
 * typical dashboard visit the numbers don't need to be fresher than a
 * minute — realtime postgres_changes still triggers `router.refresh()`
 * when new rows land, so edits still feel instant; idle reloads just
 * hit the cached HTML and skip the DB entirely.
 */
export const revalidate = 60;

export default async function SchoolAdminDashboardPage({ searchParams }: PageProps) {
  const search = await searchParams;
  const range = resolveDateRange(search);

  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);
  const showHijri = membership.school_type === "madrasa" || membership.school_type === "both";
  const today = formatDualDate(new Date(), { withWeekday: true, withHijri: showHijri });

  // Translation helpers — tAdmin for admin-dashboard strings, tDR for
  // date-range preset labels, tDonut for class-donut labels.
  const tAdmin = await getTranslations("adminDashboard");
  const tDR = await getTranslations("dateRange");
  const tDonut = await getTranslations("classDonut");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rangeLabel = tDR(range.labelKey as any, (range.labelArgs ?? {}) as Record<string, string | number>);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prevLabel = tDR(range.prevLabelKey as any, (range.prevLabelArgs ?? {}) as Record<string, string | number>);

  // Admin client: requireActiveRole() already authorized the user, every
  // query below is scoped by school_id. Needed because RLS on `sections`
  // blocks nested joins (same cause that broke class name on students list).
  const supabase = supabaseAdmin();
  const schoolId = membership.school_id;
  const todayIso = new Date().toISOString().slice(0, 10);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  // ── Current + previous period queries run in parallel ──────
  const [
    totalStudentsRes,
    activeStudentsRes,
    newAdmissionsRes,
    prevNewAdmissionsRes,
    attendanceCurRes,
    attendancePrevRes,
    todayAttendanceRes,
    classesRes,
    subjectsRes,
    invoicesAggRes,
    paymentsCurRes,
    paymentsPrevRes,
    expensesCurRes,
    expensesPrevRes,
    staffRes,
    noticesRes,
    noticesCurRes,
    noticesPrevRes,
    studentsByClassRes,
  ] = await Promise.all([
    sb.from("students").select("id", { count: "exact", head: true }).eq("school_id", schoolId),
    sb.from("students").select("id", { count: "exact", head: true }).eq("school_id", schoolId).eq("status", "active"),
    // New admissions in current period
    sb.from("students").select("id", { count: "exact", head: true }).eq("school_id", schoolId)
      .gte("admission_date", range.from).lte("admission_date", range.to),
    // New admissions in previous period
    sb.from("students").select("id", { count: "exact", head: true }).eq("school_id", schoolId)
      .gte("admission_date", range.prevFrom).lte("admission_date", range.prevTo),
    // Attendance in current period
    sb.from("attendance").select("status").eq("school_id", schoolId)
      .gte("date", range.from).lte("date", range.to),
    // Attendance in previous period
    sb.from("attendance").select("status").eq("school_id", schoolId)
      .gte("date", range.prevFrom).lte("date", range.prevTo),
    // Today specifically (for "আজকের উপস্থিতি" card)
    sb.from("attendance").select("status").eq("date", todayIso).eq("school_id", schoolId),
    // Classes + their sections. The nested `sections(id, class_id)` is used
    // both for the section-count metric AND as a lookup map to bucket the
    // donut by class without needing a second heavy join on students.
    sb.from("classes").select("id, name_bn, display_order, sections(id, class_id)").eq("school_id", schoolId).order("display_order"),
    sb.from("subjects").select("id", { count: "exact", head: true }).eq("school_id", schoolId),
    sb.from("fee_invoices").select("total_amount, paid_amount, status").eq("school_id", schoolId),
    // Payments in current period. Table is `payments`, timestamp column
    // is `paid_at` — dashboard was quietly reading a non-existent table
    // and returning zero revenue before.
    sb.from("payments").select("amount").eq("school_id", schoolId)
      .gte("paid_at", range.from).lte("paid_at", range.to + "T23:59:59"),
    // Payments in previous period
    sb.from("payments").select("amount").eq("school_id", schoolId)
      .gte("paid_at", range.prevFrom).lte("paid_at", range.prevTo + "T23:59:59"),
    // Expenses in current period
    sb.from("expenses").select("amount").eq("school_id", schoolId)
      .gte("date", range.from).lte("date", range.to),
    // Expenses in previous period
    sb.from("expenses").select("amount").eq("school_id", schoolId)
      .gte("date", range.prevFrom).lte("date", range.prevTo),
    sb.from("school_users").select("role, status").eq("school_id", schoolId),
    sb.from("notices").select("id", { count: "exact", head: true }).eq("school_id", schoolId),
    // Notices posted in current period
    sb.from("notices").select("id", { count: "exact", head: true }).eq("school_id", schoolId)
      .gte("created_at", range.from).lte("created_at", range.to + "T23:59:59"),
    // Notices posted in previous period
    sb.from("notices").select("id", { count: "exact", head: true }).eq("school_id", schoolId)
      .gte("created_at", range.prevFrom).lte("created_at", range.prevTo + "T23:59:59"),
    // For the donut we only need each active student's class_id
    // (migration 0022 added it as a direct column — works even for
    // section-less students). Fall back to section_id for legacy rows
    // that were inserted before the backfill ran.
    sb.from("students")
      .select("class_id, section_id")
      .eq("school_id", schoolId)
      .eq("status", "active")
      .limit(5000),
  ]);

  const totalStudents = totalStudentsRes.count ?? 0;
  const activeStudents = activeStudentsRes.count ?? 0;

  // New admissions — period-based delta shown on the hero "মোট ছাত্র-ছাত্রী" card
  const newAdmissions = newAdmissionsRes.count ?? 0;
  const prevNewAdmissions = prevNewAdmissionsRes.count ?? 0;
  const newAdmissionsTrend = trendPct(newAdmissions, prevNewAdmissions);

  // Period-average attendance rate (vs previous period)
  const curAttRows = (attendanceCurRes.data ?? []) as { status: string }[];
  const prevAttRows = (attendancePrevRes.data ?? []) as { status: string }[];
  const curAttPct = pctPresent(curAttRows);
  const prevAttPct = pctPresent(prevAttRows);
  const attTrend = trendPct(curAttPct, prevAttPct);

  // Today's attendance (for "আজকের উপস্থিতি" card — always today, no delta)
  const todayAttRows = (todayAttendanceRes.data ?? []) as { status: string }[];
  const presentToday = todayAttRows.filter((r) => r.status === "present" || r.status === "late").length;
  const todayAttPct = todayAttRows.length > 0
    ? Math.round((presentToday / todayAttRows.length) * 100)
    : 0;

  const classList = (classesRes.data ?? []) as Array<{
    id: string;
    name_bn: string;
    display_order: number | null;
    sections: { id: string; class_id: string }[];
  }>;
  const classCount = classList.length;
  const sectionCount = classList.reduce((s, c) => s + (c.sections?.length ?? 0), 0);

  // Build section_id → class lookup once, reused by the donut below.
  const sectionToClass = new Map<string, { id: string; name: string; order: number }>();
  for (const c of classList) {
    for (const sec of c.sections ?? []) {
      sectionToClass.set(sec.id, {
        id: c.id,
        name: c.name_bn,
        order: c.display_order ?? 999,
      });
    }
  }
  const subjectCount = subjectsRes.count ?? 0;

  const invoices = (invoicesAggRes.data ?? []) as Array<{
    total_amount: number;
    paid_amount: number;
    status: string;
  }>;
  const totalInvoiceAmount = invoices.reduce((s, i) => s + (Number(i.total_amount) || 0), 0);
  const paidInvoiceAmount = invoices.reduce((s, i) => s + (Number(i.paid_amount) || 0), 0);
  const pendingAmount = Math.max(0, totalInvoiceAmount - paidInvoiceAmount);
  const invoiceCount = invoices.length;

  // Period income / expense / cash-flow with deltas
  const curIncome = sumAmount(paymentsCurRes.data);
  const prevIncome = sumAmount(paymentsPrevRes.data);
  const incomeTrend = trendPct(curIncome, prevIncome);

  const curExpense = sumAmount(expensesCurRes.data);
  const prevExpense = sumAmount(expensesPrevRes.data);
  const expenseTrend = trendPct(curExpense, prevExpense);
  // Expenses going UP is bad — flip the sign so the colour matches "bad = red"
  const expenseTrendFlipped = expenseTrend !== null ? -expenseTrend : null;

  const curCashFlow = curIncome - curExpense;
  const prevCashFlow = prevIncome - prevExpense;
  const cashFlowTrend = trendPct(curCashFlow, prevCashFlow);

  // Staff / teachers / user accounts
  const staffRows = (staffRes.data ?? []) as Array<{ role: string; status: string }>;
  const activeStaff = staffRows.filter((r) => r.status === "active");
  const teacherCount = activeStaff.filter((r) => isTeacherRole(r.role as UserRole)).length;
  const staffCount = activeStaff.length - teacherCount;
  const userCount = staffRows.length;

  const noticesCount = noticesRes.count ?? 0;
  const curNotices = noticesCurRes.count ?? 0;
  const prevNotices = noticesPrevRes.count ?? 0;
  const noticesTrend = trendPct(curNotices, prevNotices);

  // Group students by class for the donut. Prefer the direct class_id
  // column (migration 0022); fall back to section→class if a legacy row
  // hasn't been backfilled yet.
  type ClassBucket = { id: string; name: string; order: number; count: number };
  const classBuckets = new Map<string, ClassBucket>();
  // Build classId → {name, order} lookup from the already-loaded class list.
  const classMeta = new Map<string, { name: string; order: number }>();
  for (const c of classList) {
    classMeta.set(c.id, { name: c.name_bn, order: c.display_order ?? 999 });
  }
  const rawStudents = (studentsByClassRes.data ?? []) as Array<{
    class_id: string | null;
    section_id: string | null;
  }>;
  let unassigned = 0;
  for (const s of rawStudents) {
    let classId: string | null = s.class_id;
    if (!classId && s.section_id) {
      // Legacy path: resolve via section
      const viaSec = sectionToClass.get(s.section_id);
      if (viaSec) classId = viaSec.id;
    }
    if (!classId) {
      unassigned++;
      continue;
    }
    const meta = classMeta.get(classId);
    if (!meta) {
      unassigned++;
      continue;
    }
    const b = classBuckets.get(classId);
    if (b) b.count++;
    else classBuckets.set(classId, { id: classId, name: meta.name, order: meta.order, count: 1 });
  }
  const donutSlices: ClassBucket[] = [...classBuckets.values()].sort((a, b) => a.order - b.order);
  if (unassigned > 0) {
    donutSlices.push({
      id: "__unassigned__",
      name: tDonut("unassigned_bucket"),
      order: 9999,
      count: unassigned,
    });
  }

  // ───────────────────────────────────────────────────────────
  return (
    <>
      <PageHeader
        title={membership.full_name_bn
          ? tAdmin("welcome_title", { name: membership.full_name_bn })
          : tAdmin("default_title")}
        subtitle={tAdmin("today_subtitle", { today })}
        impact={[
          { label: <RealtimeDashboardIndicator schoolId={schoolId} />, tone: "success" },
        ]}
      />

      {/* Period context strip — filter lives INSIDE this strip on the right
          so the header stays compact and there's no wasted vertical space. */}
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-border/60 bg-gradient-to-r from-primary/5 via-card to-accent/5 px-4 py-2.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-primary" />
          <span className="font-semibold text-foreground">{rangeLabel}</span>
          <span className="text-muted-foreground">({range.from} → {range.to})</span>
        </span>
        <span className="text-muted-foreground/50">·</span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-muted-foreground/40" />
          {tAdmin("context_comparison")} <span className="font-medium">{prevLabel}</span>
        </span>
        <span className="hidden lg:inline text-[10px] uppercase tracking-wider text-muted-foreground/70">
          {tAdmin("context_hint")}
        </span>
        <div className="ml-auto">
          <DateRangeFilter
            currentRange={range.preset}
            currentLabel={rangeLabel}
            currentFrom={range.from}
            currentTo={range.to}
            prevLabel={prevLabel}
          />
        </div>
      </div>

      {/* Hero metric row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label={tAdmin("card_total_students")}
          value={totalStudents}
          icon={<Users2 className="size-4" />}
          tone="accent"
          trendPct={newAdmissionsTrend}
          trendLabel={tAdmin("trend_new_admissions", { count: toBn(newAdmissions) })}
          target={
            activeStudents > 0
              ? tAdmin("target_active", { count: toBn(activeStudents) })
              : tAdmin("target_first_student")
          }
        />
        <MetricCard
          label={tAdmin("card_today_attendance")}
          value={todayAttPct}
          valueSuffix={<span className="text-muted-foreground text-base">%</span>}
          icon={<CalendarDays className="size-4" />}
          tone={todayAttPct >= 80 ? "success" : todayAttPct >= 50 ? "default" : "warning"}
          target={
            todayAttRows.length > 0
              ? tAdmin("target_present_of_total", {
                  present: toBn(presentToday),
                  total: toBn(todayAttRows.length),
                })
              : undefined
          }
        />
        <MetricCard
          label={tAdmin("card_period_income", { range: rangeLabel })}
          value={Math.round(curIncome)}
          valuePrefix="৳ "
          icon={<Wallet className="size-4" />}
          tone="success"
          trendPct={incomeTrend}
          trendLabel={tAdmin("trend_vs_prev", { label: prevLabel })}
        />
        <MetricCard
          label={tAdmin("card_pending_fees")}
          value={Math.round(pendingAmount)}
          valuePrefix="৳ "
          icon={<TrendingUp className="size-4" />}
          tone={pendingAmount > 0 ? "warning" : "success"}
          target={tAdmin("target_invoice_count", { count: toBn(invoiceCount) })}
        />
      </div>

      {/* Class-wise student distribution donut */}
      <div className="mt-8">
        <ClassDonut
          classes={donutSlices.map((c) => ({ id: c.id, name: c.name, count: c.count }))}
        />
      </div>

      {/* Academic */}
      <Section title={tAdmin("section_academic")}>
        <MetricCard
          label={tAdmin("card_classes")}
          value={classCount}
          icon={<BookOpen className="size-4" />}
          target={tAdmin("target_section_count", { count: toBn(sectionCount) })}
        />
        <MetricCard
          label={tAdmin("card_subjects")}
          value={subjectCount}
          icon={<ScrollText className="size-4" />}
        />
        <MetricCard
          label={tAdmin("card_period_attendance_rate", { range: rangeLabel })}
          value={curAttPct}
          valueSuffix={<span className="text-muted-foreground text-base">%</span>}
          icon={<CalendarDays className="size-4" />}
          tone={curAttPct >= 80 ? "success" : curAttPct >= 50 ? "default" : "warning"}
          trendPct={attTrend}
          trendLabel={tAdmin("trend_vs_prev", { label: prevLabel })}
        />
        <MetricCard
          label={tAdmin("card_period_notices", { range: rangeLabel })}
          value={curNotices}
          icon={<Megaphone className="size-4" />}
          trendPct={noticesTrend}
          trendLabel={tAdmin("trend_vs_prev", { label: prevLabel })}
          target={tAdmin("target_total_count", { count: toBn(noticesCount) })}
        />
      </Section>

      {/* Financial */}
      <Section title={tAdmin("section_financial")}>
        <MetricCard
          label={tAdmin("card_period_income", { range: rangeLabel })}
          value={Math.round(curIncome)}
          valuePrefix="৳ "
          icon={<Wallet className="size-4" />}
          tone="success"
          trendPct={incomeTrend}
          trendLabel={tAdmin("trend_vs_prev", { label: prevLabel })}
        />
        <MetricCard
          label={tAdmin("card_period_expense", { range: rangeLabel })}
          value={Math.round(curExpense)}
          valuePrefix="৳ "
          icon={<CreditCard className="size-4" />}
          tone="warning"
          trendPct={expenseTrendFlipped}
          trendLabel={tAdmin("trend_expense_actual", {
            value:
              expenseTrend !== null
                ? (expenseTrend > 0 ? "+" : "") + expenseTrend + "%"
                : "—",
          })}
        />
        <MetricCard
          label={tAdmin("card_total_invoices")}
          value={invoiceCount}
          icon={<Receipt className="size-4" />}
          target={tAdmin("target_collected", { amount: toBnCurrency(Math.round(paidInvoiceAmount)) })}
        />
        <MetricCard
          label={tAdmin("card_cash_flow")}
          value={Math.round(Math.abs(curCashFlow))}
          valuePrefix={curCashFlow >= 0 ? "৳ +" : "৳ -"}
          icon={curCashFlow >= 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
          tone={curCashFlow >= 0 ? "success" : "danger"}
          trendPct={cashFlowTrend}
          trendLabel={tAdmin("trend_vs_prev", { label: prevLabel })}
        />
      </Section>

      {/* HR + other */}
      <Section title={tAdmin("section_hr")}>
        <MetricCard
          label={tAdmin("card_teachers")}
          value={teacherCount}
          icon={<Users className="size-4" />}
          tone="accent"
        />
        <MetricCard
          label={tAdmin("card_other_staff")}
          value={staffCount}
          icon={<UserCog className="size-4" />}
        />
        <MetricCard
          label={tAdmin("card_system_users")}
          value={userCount}
          icon={<FileText className="size-4" />}
          target={tAdmin("target_n_active", { count: toBn(activeStaff.length) })}
        />
        <MetricCard
          label={tAdmin("card_period_new_admissions", { range: rangeLabel })}
          value={newAdmissions}
          icon={<UserPlus className="size-4" />}
          tone="accent"
          trendPct={newAdmissionsTrend}
          trendLabel={tAdmin("trend_vs_prev", { label: prevLabel })}
        />
      </Section>

      <div className="mt-8 rounded-xl border border-dashed border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground">
        <p>
          💡 <strong className="text-foreground">{tAdmin("legend_how_to_read")}</strong>{" "}
          <span className="inline-flex items-center gap-0.5 text-success">{tAdmin("legend_green")}</span>
          {tAdmin("legend_body")}
          <span className="inline-flex items-center gap-0.5 text-destructive">{tAdmin("legend_red")}</span>
          {tAdmin("legend_body_2")}
        </p>
      </div>
    </>
  );
}

// ─── helpers ────────────────────────────────────────────────
function pctPresent(rows: { status: string }[]): number {
  if (rows.length === 0) return 0;
  const present = rows.filter((r) => r.status === "present" || r.status === "late").length;
  return Math.round((present / rows.length) * 100);
}

function sumAmount(rows: unknown): number {
  return ((rows ?? []) as { amount: number }[])
    .reduce((s, r) => s + (Number(r.amount) || 0), 0);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-base font-bold tracking-tight md:text-lg bg-gradient-to-r from-foreground via-foreground to-primary/80 bg-clip-text text-transparent">
        {title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </section>
  );
}

function toBn(n: number): string {
  return String(n).replace(/[0-9]/g, (c) => "০১২৩৪৫৬৭৮৯"[Number(c)]);
}

function toBnCurrency(n: number): string {
  return n.toLocaleString("en-IN").replace(/[0-9]/g, (c) => "০১২৩৪৫৬৭৮৯"[Number(c)]);
}
