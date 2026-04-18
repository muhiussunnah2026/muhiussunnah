-- =====================================================================
-- 0004 — Attendance + devices
-- Ref: PROJECT_PLAN §5.3
-- =====================================================================

create table if not exists public.attendance (
  id              uuid primary key default gen_random_uuid(),
  school_id       uuid not null references public.schools(id) on delete cascade,
  student_id      uuid not null references public.students(id) on delete cascade,
  section_id      uuid references public.sections(id) on delete set null,
  date            date not null,
  status          public.attendance_status not null,
  check_in_time   time,
  check_out_time  time,
  marked_by       uuid references public.school_users(id) on delete set null,
  marked_at       timestamptz not null default now(),
  remarks         text,
  source          text not null default 'manual' check (source in ('manual', 'biometric', 'rfid', 'qr', 'import')),
  device_id       uuid,
  metadata        jsonb not null default '{}'::jsonb,
  unique (student_id, date)
);

create index if not exists idx_attendance_school_date on public.attendance(school_id, date desc);
create index if not exists idx_attendance_section_date on public.attendance(section_id, date desc);

create table if not exists public.attendance_devices (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools(id) on delete cascade,
  branch_id   uuid references public.school_branches(id) on delete set null,
  name        text not null,
  type        text not null check (type in ('biometric', 'rfid', 'qr_scanner')),
  device_id   text not null,                  -- hardware identifier
  location    text,
  is_active   boolean not null default true,
  last_seen   timestamptz,
  settings    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (school_id, device_id)
);

create trigger set_updated_at_attendance_devices
  before update on public.attendance_devices
  for each row execute function public.set_updated_at();
