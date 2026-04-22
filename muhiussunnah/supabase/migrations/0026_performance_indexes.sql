-- =====================================================================
-- 0026 — Composite indexes for hot dashboard queries
-- =====================================================================
-- The admin dashboard, students list, classes list, fees, and
-- attendance pages all filter by (school_id, <other_col>). Supabase
-- auto-indexes FKs (school_id alone) but PostgreSQL still has to scan
-- many rows to apply the secondary filter.
--
-- Adding narrow composite indexes on the (school_id, filter) pairs
-- we actually use lets the planner go straight to the matching rows.
-- All indexes are IF NOT EXISTS so re-applying is safe.
-- =====================================================================

-- students: every list filters by school_id + status (active/graduated/etc.)
create index if not exists idx_students_school_status
  on public.students(school_id, status);

-- students: admission trends + "new this month" cards
create index if not exists idx_students_school_admission
  on public.students(school_id, admission_date desc);

-- attendance: the admin dashboard pulls current + previous period
create index if not exists idx_attendance_school_date
  on public.attendance(school_id, date desc);

-- fee_invoices: outstanding fees + collection reports
create index if not exists idx_fee_invoices_school_status
  on public.fee_invoices(school_id, status);

-- payments: monthly revenue trend, period totals
create index if not exists idx_payments_school_paid_at
  on public.payments(school_id, paid_at desc);

-- expenses: monthly expense trend
create index if not exists idx_expenses_school_date
  on public.expenses(school_id, date desc);

-- notices: "recent notices" card
create index if not exists idx_notices_school_created
  on public.notices(school_id, created_at desc);

-- school_users: staff table filters by status, role
create index if not exists idx_school_users_school_status
  on public.school_users(school_id, status);

-- classes: ordered by display_order on every /classes render
create index if not exists idx_classes_school_display
  on public.classes(school_id, display_order);

-- admission_inquiries: super-frequent read on its page
create index if not exists idx_admission_inquiries_school_created
  on public.admission_inquiries(school_id, created_at desc);
