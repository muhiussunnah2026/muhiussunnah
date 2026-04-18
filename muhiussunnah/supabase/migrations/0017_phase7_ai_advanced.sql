-- =====================================================================
-- 0017 — Phase 7: AI & Advanced (dropout risk, smart SMS, audit, 2FA)
-- =====================================================================

-- Student risk scores (computed by cron or on-demand) ----------------
create table if not exists public.student_risk_scores (
  id              uuid primary key default gen_random_uuid(),
  school_id       uuid not null references public.schools(id) on delete cascade,
  student_id      uuid not null references public.students(id) on delete cascade,
  computed_at     timestamptz not null default now(),
  risk_level      text not null check (risk_level in ('low', 'medium', 'high', 'critical')),
  score           numeric(5, 2) not null check (score >= 0 and score <= 100),
  attendance_pct  numeric(5, 2),
  avg_marks_pct   numeric(5, 2),
  fee_overdue_days integer,
  factors         jsonb not null default '{}'::jsonb,
  suggestion      text,
  unique (student_id)
);

create index if not exists idx_risk_scores_school on public.student_risk_scores(school_id, risk_level);
create index if not exists idx_risk_scores_computed on public.student_risk_scores(computed_at desc);

-- Smart SMS templates (AI-generated or manual) -----------------------
create table if not exists public.sms_templates (
  id            uuid primary key default gen_random_uuid(),
  school_id     uuid not null references public.schools(id) on delete cascade,
  name          text not null,
  category      text check (category in ('fee_reminder', 'absent_alert', 'exam_reminder', 'result_announce', 'holiday', 'general', 'custom')),
  body          text not null,
  variables     jsonb not null default '[]'::jsonb,
  language      text not null default 'bn',
  is_ai_generated boolean not null default false,
  use_count     integer not null default 0,
  last_used_at  timestamptz,
  created_by    uuid references public.school_users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (school_id, name)
);

create index if not exists idx_sms_templates_school on public.sms_templates(school_id, category);
create trigger set_updated_at_sms_templates
  before update on public.sms_templates
  for each row execute function public.set_updated_at();

-- TOTP 2FA secrets ---------------------------------------------------
create table if not exists public.user_totp_secrets (
  user_id       uuid primary key,   -- auth.users(id)
  secret        text not null,       -- base32-encoded TOTP secret
  recovery_codes jsonb not null default '[]'::jsonb,
  verified_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger set_updated_at_user_totp_secrets
  before update on public.user_totp_secrets
  for each row execute function public.set_updated_at();

-- RLS policies -------------------------------------------------------
alter table public.student_risk_scores enable row level security;
alter table public.sms_templates enable row level security;
alter table public.user_totp_secrets enable row level security;

-- Risk scores: school members can read; only TEACHER+ can read, only SUPER/PRINCIPAL write
do $$ begin
  create policy "Risk scores readable by school members"
    on public.student_risk_scores for select
    using (public.is_school_member(school_id));
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Risk scores writable by admins"
    on public.student_risk_scores for all
    using (public.user_has_any_role(school_id, array['SUPER_ADMIN', 'SCHOOL_ADMIN', 'VICE_PRINCIPAL', 'CLASS_TEACHER', 'SUBJECT_TEACHER']::public.user_role[]))
    with check (public.user_has_any_role(school_id, array['SUPER_ADMIN', 'SCHOOL_ADMIN', 'VICE_PRINCIPAL', 'CLASS_TEACHER', 'SUBJECT_TEACHER']::public.user_role[]));
exception when duplicate_object then null;
end $$;

-- SMS templates: admins manage
do $$ begin
  create policy "SMS templates readable by school members"
    on public.sms_templates for select
    using (public.is_school_member(school_id));
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "SMS templates writable by admins"
    on public.sms_templates for all
    using (public.user_has_any_role(school_id, array['SUPER_ADMIN', 'SCHOOL_ADMIN', 'VICE_PRINCIPAL']::public.user_role[]))
    with check (public.user_has_any_role(school_id, array['SUPER_ADMIN', 'SCHOOL_ADMIN', 'VICE_PRINCIPAL']::public.user_role[]));
exception when duplicate_object then null;
end $$;

-- TOTP: user sees only their own
do $$ begin
  create policy "TOTP self only"
    on public.user_totp_secrets for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;
