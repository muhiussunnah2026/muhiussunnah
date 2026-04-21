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

export default async function SchoolAdminDashboardPage({ searchParams }: PageProps) {
  const search = await searchParams;
  const range = resolveDateRange(search);

  const membership = await requireActiveRole([...ADMIN_ROLES, "ACCOUNTANT"]);
  const showHijri = membership.school_type === "madrasa" || membership.school_type === "both";
  const today = formatDualDate(new Date(), { withWeekday: true, withHijri: showHijri });

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
    sb.from("classes").select("id, name_bn, display_order, sections(id)").eq("school_id", schoolId).order("display_order"),
    sb.from("subjects").select("id", { count: "exact", head: true }).eq("school_id", schoolId),
    sb.from("fee_invoices").select("total_amount, paid_amount, status").eq("school_id", schoolId),
    // Payments in current period
    sb.from("fee_payments").select("amount").eq("school_id", schoolId)
      .gte("payment_date", range.from).lte("payment_date", range.to),
    // Payments in previous period
    sb.from("fee_payments").select("amount").eq("school_id", schoolId)
      .gte("payment_date", range.prevFrom).lte("payment_date", range.prevTo),
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
    // Student-per-section → group client-side by class name
    sb.from("students")
      .select("id, section_id, sections ( id, name, class_id, classes ( id, name_bn, display_order ) )")
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
    sections: { id: string }[];
  }>;
  const classCount = classList.length;
  const sectionCount = classList.reduce((s, c) => s + (c.sections?.length ?? 0), 0);
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

  // Group students by class for the donut
  type ClassBucket = { id: string; name: string; order: number; count: number };
  const classBuckets = new Map<string, ClassBucket>();
  const rawStudents = (studentsByClassRes.data ?? []) as Array<{
    id: string;
    sections: { id: string; class_id: string; classes: { id: string; name_bn: string; display_order: number | null } | null } | null;
  }>;
  let unassigned = 0;
  for (const s of rawStudents) {
    const cls = s.sections?.classes;
    if (!cls) {
      unassigned++;
      continue;
    }
    const b = classBuckets.get(cls.id);
    if (b) b.count++;
    else classBuckets.set(cls.id, { id: cls.id, name: cls.name_bn, order: cls.display_order ?? 999, count: 1 });
  }
  const donutSlices: ClassBucket[] = [...classBuckets.values()].sort((a, b) => a.order - b.order);
  if (unassigned > 0) {
    donutSlices.push({
      id: "__unassigned__",
      name: "⚠️ ক্লাস নির্ধারিত নেই",
      order: 9999,
      count: unassigned,
    });
  }

  // ───────────────────────────────────────────────────────────
  return (
    <>
      <PageHeader
        title={`স্বাগতম, ${membership.full_name_bn ?? "প্রিন্সিপাল"} সাহেব`}
        subtitle={`আজ ${today} · আপনার স্কুলের সম্পূর্ণ চিত্র এক নজরে`}
        impact={[
          { label: <RealtimeDashboardIndicator schoolId={schoolId} />, tone: "success" },
        ]}
        actions={
          <DateRangeFilter
            currentRange={range.preset}
            currentLabel={range.label}
            currentFrom={range.from}
            currentTo={range.to}
            prevLabel={range.prevLabel}
          />
        }
      />

      {/* Period context strip */}
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-gradient-to-r from-primary/5 via-card to-accent/5 px-4 py-2.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-primary" />
          <span className="font-semibold text-foreground">{range.label}</span>
          <span className="text-muted-foreground">({range.from} → {range.to})</span>
        </span>
        <span className="text-muted-foreground/50">·</span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-muted-foreground/40" />
          তুলনা: <span className="font-medium">{range.prevLabel}</span>
        </span>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground/70">
          প্রতিটা কার্ডে ↗↘ চিহ্ন আগের পিরিয়ডের সাথে তুলনা
        </span>
      </div>

      {/* Hero metric row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="মোট ছাত্র-ছাত্রী"
          value={totalStudents}
          icon={<Users2 className="size-4" />}
          tone="accent"
          trendPct={newAdmissionsTrend}
          trendLabel={`${toBn(newAdmissions)} নতুন ভর্তি`}
          target={activeStudents > 0 ? `সক্রিয়: ${toBn(activeStudents)}` : "প্রথম শিক্ষার্থী ভর্তি করুন"}
        />
        <MetricCard
          label="আজকের উপস্থিতি"
          value={todayAttPct}
          valueSuffix={<span className="text-muted-foreground text-base">%</span>}
          icon={<CalendarDays className="size-4" />}
          tone={todayAttPct >= 80 ? "success" : todayAttPct >= 50 ? "default" : "warning"}
          target={todayAttRows.length > 0 ? `${toBn(presentToday)}/${toBn(todayAttRows.length)} উপস্থিত` : undefined}
        />
        <MetricCard
          label={`${range.label}-এর আয়`}
          value={Math.round(curIncome)}
          valuePrefix="৳ "
          icon={<Wallet className="size-4" />}
          tone="success"
          trendPct={incomeTrend}
          trendLabel={`vs ${range.prevLabel}`}
        />
        <MetricCard
          label="বাকি ফি"
          value={Math.round(pendingAmount)}
          valuePrefix="৳ "
          icon={<TrendingUp className="size-4" />}
          tone={pendingAmount > 0 ? "warning" : "success"}
          target={`${toBn(invoiceCount)} ইনভয়েস`}
        />
      </div>

      {/* Class-wise student distribution donut */}
      <div className="mt-8">
        <ClassDonut
          classes={donutSlices.map((c) => ({ id: c.id, name: c.name, count: c.count }))}
        />
      </div>

      {/* একাডেমিক ব্যবস্থাপনা */}
      <Section title="📚 একাডেমিক ব্যবস্থাপনা">
        <MetricCard
          label="শ্রেণি"
          value={classCount}
          icon={<BookOpen className="size-4" />}
          target={`${toBn(sectionCount)} শাখা`}
        />
        <MetricCard
          label="বিষয়"
          value={subjectCount}
          icon={<ScrollText className="size-4" />}
        />
        <MetricCard
          label={`${range.label} উপস্থিতি হার`}
          value={curAttPct}
          valueSuffix={<span className="text-muted-foreground text-base">%</span>}
          icon={<CalendarDays className="size-4" />}
          tone={curAttPct >= 80 ? "success" : curAttPct >= 50 ? "default" : "warning"}
          trendPct={attTrend}
          trendLabel={`vs ${range.prevLabel}`}
        />
        <MetricCard
          label={`${range.label} নোটিশ`}
          value={curNotices}
          icon={<Megaphone className="size-4" />}
          trendPct={noticesTrend}
          trendLabel={`vs ${range.prevLabel}`}
          target={`মোট ${toBn(noticesCount)}`}
        />
      </Section>

      {/* আর্থিক ব্যবস্থাপনা */}
      <Section title="💰 আর্থিক ব্যবস্থাপনা">
        <MetricCard
          label={`${range.label}-এর আয়`}
          value={Math.round(curIncome)}
          valuePrefix="৳ "
          icon={<Wallet className="size-4" />}
          tone="success"
          trendPct={incomeTrend}
          trendLabel={`vs ${range.prevLabel}`}
        />
        <MetricCard
          label={`${range.label}-এর ব্যয়`}
          value={Math.round(curExpense)}
          valuePrefix="৳ "
          icon={<CreditCard className="size-4" />}
          tone="warning"
          trendPct={expenseTrendFlipped}
          trendLabel={`আসল: ${expenseTrend !== null ? (expenseTrend > 0 ? "+" : "") + expenseTrend + "%" : "—"}`}
        />
        <MetricCard
          label="মোট ইনভয়েস"
          value={invoiceCount}
          icon={<Receipt className="size-4" />}
          target={`৳ ${toBnCurrency(Math.round(paidInvoiceAmount))} আদায়`}
        />
        <MetricCard
          label="ক্যাশ ফ্লো"
          value={Math.round(Math.abs(curCashFlow))}
          valuePrefix={curCashFlow >= 0 ? "৳ +" : "৳ -"}
          icon={curCashFlow >= 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
          tone={curCashFlow >= 0 ? "success" : "danger"}
          trendPct={cashFlowTrend}
          trendLabel={`vs ${range.prevLabel}`}
        />
      </Section>

      {/* এইচআর + অন্যান্য */}
      <Section title="👥 এইচআর + অন্যান্য">
        <MetricCard
          label="শিক্ষক"
          value={teacherCount}
          icon={<Users className="size-4" />}
          tone="accent"
        />
        <MetricCard
          label="অন্যান্য কর্মচারী"
          value={staffCount}
          icon={<UserCog className="size-4" />}
        />
        <MetricCard
          label="সিস্টেম ব্যবহারকারী"
          value={userCount}
          icon={<FileText className="size-4" />}
          target={`${toBn(activeStaff.length)} সক্রিয়`}
        />
        <MetricCard
          label={`${range.label}-এ নতুন ভর্তি`}
          value={newAdmissions}
          icon={<UserPlus className="size-4" />}
          tone="accent"
          trendPct={newAdmissionsTrend}
          trendLabel={`vs ${range.prevLabel}`}
        />
      </Section>

      <div className="mt-8 rounded-xl border border-dashed border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground">
        <p>
          💡 <strong className="text-foreground">বুঝবেন কীভাবে:</strong>{" "}
          <span className="inline-flex items-center gap-0.5 text-success">↗ সবুজ</span>
          {" "}মানে আগের পিরিয়ডের চেয়ে ভালো হচ্ছে,{" "}
          <span className="inline-flex items-center gap-0.5 text-destructive">↘ লাল</span>
          {" "}মানে অবনতি হচ্ছে। ব্যয়ের ক্ষেত্রে কম খরচ = সবুজ, বেশি খরচ = লাল।
          সময়সীমা উপরের ফিল্টার থেকে পরিবর্তন করুন — custom তারিখ ও তুলনা সব সম্ভব।
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
