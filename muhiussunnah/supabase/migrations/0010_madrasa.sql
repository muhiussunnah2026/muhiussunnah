-- =====================================================================
-- 0010 — Madrasa-specific: Hifz, Kitab, Daily Sabaq-Sabqi-Manzil
-- Ref: PROJECT_PLAN §5.10 (feature-flagged for madrasa tenants)
-- =====================================================================

-- Hifz progress (Quran memorization, para 1..30) ---------------------
create table if not exists public.hifz_progress (
  id              uuid primary key default gen_random_uuid(),
  school_id       uuid not null references public.schools(id) on delete cascade,
  student_id      uuid not null references public.students(id) on delete cascade,
  para_no         integer not null check (para_no between 1 and 30),
  sipara_no       integer,                             -- pages within para
  status          text not null default 'learning' check (status in ('learning', 'revising', 'completed', 'tested')),
  tested_on       date,
  tested_by       uuid references public.school_users(id) on delete set null,
  mark            numeric(5, 2),
  grade           text,
  mistakes_count  integer not null default 0,
  note            text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (student_id, para_no)
);

create index if not exists idx_hifz_progress_school_student on public.hifz_progress(school_id, student_id);
create trigger set_updated_at_hifz_progress
  before update on public.hifz_progress
  for each row execute function public.set_updated_at();

-- Kitab curriculum (Ibtedaiyyah → Kamil) -----------------------------
create table if not exists public.kitab_curriculum (
  id             uuid primary key default gen_random_uuid(),
  school_id      uuid not null references public.schools(id) on delete cascade,
  class_id       uuid references public.classes(id) on delete set null,
  stage          text not null check (stage in ('ibtedaiyyah', 'mutawassita', 'sanaweeya_aamma', 'sanaweeya_khassa', 'fazilat', 'kamil')),
  kitab_name     text not null,
  author         text,
  display_order  integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (school_id, stage, kitab_name)
);

create trigger set_updated_at_kitab_curriculum
  before update on public.kitab_curriculum
  for each row execute function public.set_updated_at();

create table if not exists public.student_kitab_progress (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references public.students(id) on delete cascade,
  kitab_id         uuid not null references public.kitab_curriculum(id) on delete cascade,
  started_on       date,
  current_chapter  text,
  completed_on     date,
  grade            text,
  teacher_id       uuid references public.school_users(id) on delete set null,
  notes            text,
  updated_at       timestamptz not null default now(),
  unique (student_id, kitab_id)
);

create trigger set_updated_at_student_kitab_progress
  before update on public.student_kitab_progress
  for each row execute function public.set_updated_at();

-- Daily Sabaq-Sabqi-Manzil log (the core madrasa daily record) -------
create table if not exists public.daily_sabaq (
  id               uuid primary key default gen_random_uuid(),
  school_id        uuid not null references public.schools(id) on delete cascade,
  student_id       uuid not null references public.students(id) on delete cascade,
  date             date not null default current_date,

  -- Sabaq (new lesson)
  sabaq_para       integer,
  sabaq_from       text,          -- start reference (ayah/line)
  sabaq_to         text,
  sabaq_quality    public.sabaq_quality,

  -- Sabqi (previous day revision)
  sabqi_para       integer,
  sabqi_quality    public.sabaq_quality,

  -- Manzil (full Quran revision rotation, usually multiple paras)
  manzil_paras     jsonb not null default '[]'::jsonb,
  manzil_quality   public.sabaq_quality,

  tajweed_notes    text,
  teacher_id       uuid references public.school_users(id) on delete set null,
  created_at       timestamptz not null default now(),
  unique (student_id, date)
);

create index if not exists idx_daily_sabaq_school_date on public.daily_sabaq(school_id, date desc);
create index if not exists idx_daily_sabaq_student_date on public.daily_sabaq(student_id, date desc);
