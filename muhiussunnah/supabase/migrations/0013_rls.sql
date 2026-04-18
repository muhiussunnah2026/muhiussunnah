-- =====================================================================
-- 0013 — Row Level Security scaffolding (baseline policies)
--
-- Phase 0 goal (PROJECT_PLAN §13): enable RLS on EVERY tenant table so
-- we fail closed. Baseline policies grant access to members of the
-- tenant (school). Detailed per-role/scope policies land alongside
-- the feature work in Phase 1+.
--
-- Helpers are SECURITY DEFINER so they can read from school_users
-- without triggering the same RLS they gate (avoids infinite recursion
-- inside policies).
-- =====================================================================

-- Helper: is current user a platform super admin? -------------------
create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.school_users su
    where su.user_id = auth.uid()
      and su.role = 'SUPER_ADMIN'
      and su.status = 'active'
  );
$$;

comment on function public.is_super_admin() is
  'Returns true if the authenticated user holds a SUPER_ADMIN membership.';

-- Helper: is the current user a member of this school? ---------------
create or replace function public.is_school_member(target_school uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.school_users su
    where su.user_id = auth.uid()
      and su.school_id = target_school
      and su.status = 'active'
  ) or public.is_super_admin();
$$;

-- Helper: does the current user hold any of the given roles in a school?
create or replace function public.user_has_any_role(target_school uuid, roles public.user_role[])
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.school_users su
    where su.user_id = auth.uid()
      and su.school_id = target_school
      and su.role = any(roles)
      and su.status = 'active'
  ) or public.is_super_admin();
$$;

-- Helper: list of school_ids the current user belongs to -----------
create or replace function public.user_school_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select su.school_id
  from public.school_users su
  where su.user_id = auth.uid()
    and su.status = 'active';
$$;

grant execute on function public.is_super_admin() to authenticated, anon;
grant execute on function public.is_school_member(uuid) to authenticated, anon;
grant execute on function public.user_has_any_role(uuid, public.user_role[]) to authenticated, anon;
grant execute on function public.user_school_ids() to authenticated, anon;

-- =====================================================================
-- Enable RLS on every tenant-owned table and add a baseline policy
-- that allows authenticated school members read/write on rows scoped
-- by school_id. Super admins always pass.
--
-- We intentionally start with a single permissive "school_member"
-- policy per table. Feature work will layer stricter per-role
-- policies on top (or replace these).
-- =====================================================================

do $$
declare
  t record;
begin
  for t in
    select unnest(array[
      'schools',
      'school_branches',
      'school_users',
      'user_permissions',
      'audit_logs',
      'academic_years',
      'classes',
      'sections',
      'subjects',
      'class_subject_assignments',
      'teacher_assignments',
      'students',
      'student_guardians',
      'admission_inquiries',
      'student_shifts',
      'attendance',
      'attendance_devices',
      'exams',
      'exam_subjects',
      'exam_rooms',
      'exam_seating',
      'marks',
      'grading_scales',
      'report_cards',
      'fee_heads',
      'fee_structures',
      'fee_invoices',
      'fee_invoice_items',
      'payments',
      'student_ledger_entries',
      'scholarships',
      'student_scholarships',
      'expense_heads',
      'expenses',
      'cash_receive_heads',
      'cash_receives',
      'investments',
      'investment_returns',
      'donation_campaigns',
      'donations',
      'staff_salaries',
      'notices',
      'message_queue',
      'sms_logs',
      'whatsapp_logs',
      'push_logs',
      'conversations',
      'conversation_participants',
      'messages',
      'certificate_templates',
      'certificates_issued',
      'support_tickets',
      'support_messages',
      'hifz_progress',
      'kitab_curriculum',
      'student_kitab_progress',
      'daily_sabaq',
      'library_books',
      'library_issues',
      'transport_routes',
      'transport_vehicles',
      'transport_students',
      'transport_gps_pings',
      'hostels',
      'hostel_rooms',
      'hostel_allocations',
      'canteen_wallet',
      'canteen_transactions',
      'inventory_items',
      'inventory_movements',
      'student_health',
      'counseling_logs',
      'assignments',
      'assignment_submissions',
      'online_classes',
      'public_pages',
      'public_gallery',
      'public_news'
    ]) as name
  loop
    execute format('alter table public.%I enable row level security;', t.name);
    execute format('alter table public.%I force row level security;', t.name);
  end loop;
end $$;

-- subscription_plans is platform-level — super admin only writes, everyone reads
alter table public.subscription_plans enable row level security;
drop policy if exists subscription_plans_read_all on public.subscription_plans;
create policy subscription_plans_read_all on public.subscription_plans
  for select using (true);
drop policy if exists subscription_plans_super_admin_write on public.subscription_plans;
create policy subscription_plans_super_admin_write on public.subscription_plans
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- schools: members of the school can read; super admins manage
drop policy if exists schools_member_read on public.schools;
create policy schools_member_read on public.schools
  for select using (public.is_school_member(id));
drop policy if exists schools_super_admin_write on public.schools;
create policy schools_super_admin_write on public.schools
  for all using (public.is_super_admin()) with check (public.is_super_admin());
drop policy if exists schools_admin_update on public.schools;
create policy schools_admin_update on public.schools
  for update using (
    public.user_has_any_role(id, array['SCHOOL_ADMIN', 'VICE_PRINCIPAL']::public.user_role[])
  ) with check (
    public.user_has_any_role(id, array['SCHOOL_ADMIN', 'VICE_PRINCIPAL']::public.user_role[])
  );

-- school_branches
drop policy if exists school_branches_member_all on public.school_branches;
create policy school_branches_member_all on public.school_branches
  for all using (public.is_school_member(school_id))
  with check (public.is_school_member(school_id));

-- school_users: members can read, only admins can write
drop policy if exists school_users_member_read on public.school_users;
create policy school_users_member_read on public.school_users
  for select using (public.is_school_member(school_id) or user_id = auth.uid());
drop policy if exists school_users_admin_write on public.school_users;
create policy school_users_admin_write on public.school_users
  for all using (
    public.user_has_any_role(school_id, array['SCHOOL_ADMIN', 'VICE_PRINCIPAL']::public.user_role[])
  ) with check (
    public.user_has_any_role(school_id, array['SCHOOL_ADMIN', 'VICE_PRINCIPAL']::public.user_role[])
  );

-- user_permissions: admins manage, affected user reads own
drop policy if exists user_permissions_read_self on public.user_permissions;
create policy user_permissions_read_self on public.user_permissions
  for select using (
    exists (
      select 1 from public.school_users su
      where su.id = user_permissions.school_user_id
        and (su.user_id = auth.uid() or public.user_has_any_role(su.school_id, array['SCHOOL_ADMIN', 'VICE_PRINCIPAL']::public.user_role[]))
    )
  );
drop policy if exists user_permissions_admin_write on public.user_permissions;
create policy user_permissions_admin_write on public.user_permissions
  for all using (
    exists (
      select 1 from public.school_users su
      where su.id = user_permissions.school_user_id
        and public.user_has_any_role(su.school_id, array['SCHOOL_ADMIN', 'VICE_PRINCIPAL']::public.user_role[])
    )
  ) with check (
    exists (
      select 1 from public.school_users su
      where su.id = user_permissions.school_user_id
        and public.user_has_any_role(su.school_id, array['SCHOOL_ADMIN', 'VICE_PRINCIPAL']::public.user_role[])
    )
  );

-- audit_logs: members read (super admin only writes via service role)
drop policy if exists audit_logs_member_read on public.audit_logs;
create policy audit_logs_member_read on public.audit_logs
  for select using (
    school_id is null and public.is_super_admin()
    or (school_id is not null and public.user_has_any_role(school_id, array['SCHOOL_ADMIN', 'VICE_PRINCIPAL', 'ACCOUNTANT']::public.user_role[]))
  );

-- =====================================================================
-- Generic "school member can manage rows scoped by school_id" policy
-- applied to every simple tenant-scoped table. Feature-specific
-- tightening (e.g. teachers only see own sections) is layered later.
-- =====================================================================

do $$
declare
  t text;
  tables_with_school_id text[] := array[
    'academic_years',
    'classes',
    'subjects',
    'admission_inquiries',
    'students',
    'attendance',
    'attendance_devices',
    'exams',
    'exam_rooms',
    'marks',
    'grading_scales',
    'report_cards',
    'fee_heads',
    'fee_structures',
    'fee_invoices',
    'payments',
    'student_ledger_entries',
    'scholarships',
    'expense_heads',
    'expenses',
    'cash_receive_heads',
    'cash_receives',
    'investments',
    'donation_campaigns',
    'donations',
    'notices',
    'message_queue',
    'sms_logs',
    'whatsapp_logs',
    'push_logs',
    'conversations',
    'certificate_templates',
    'certificates_issued',
    'support_tickets',
    'hifz_progress',
    'kitab_curriculum',
    'daily_sabaq',
    'library_books',
    'transport_routes',
    'hostels',
    'canteen_wallet',
    'canteen_transactions',
    'inventory_items',
    'counseling_logs',
    'assignments',
    'online_classes',
    'public_pages',
    'public_gallery',
    'public_news'
  ];
begin
  foreach t in array tables_with_school_id loop
    execute format($p$
      drop policy if exists %I_school_member_all on public.%I;
      create policy %I_school_member_all on public.%I
        for all using (public.is_school_member(school_id))
        with check (public.is_school_member(school_id));
    $p$, t, t, t, t);
  end loop;
end $$;

-- Public-facing pages / news / gallery should be readable publicly
-- but the umbrella policy above limits to members. Add a public read
-- path that bypasses when the parent school record is publicly active.
drop policy if exists public_pages_public_read on public.public_pages;
create policy public_pages_public_read on public.public_pages
  for select using (published = true);
drop policy if exists public_gallery_public_read on public.public_gallery;
create policy public_gallery_public_read on public.public_gallery
  for select using (true);
drop policy if exists public_news_public_read on public.public_news;
create policy public_news_public_read on public.public_news
  for select using (published_at is not null and published_at <= now());
