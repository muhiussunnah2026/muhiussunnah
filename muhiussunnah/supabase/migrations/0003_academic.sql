-- =====================================================================
-- 0003 — Academic: years, classes, sections, subjects, assignments,
--        students, guardians, admission inquiries, transfer shifts
-- Ref: PROJECT_PLAN §5.2
-- =====================================================================

-- Academic years -----------------------------------------------------
create table if not exists public.academic_years (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools(id) on delete cascade,
  name        text not null,             -- e.g. '2025-2026' or '১৪৪৭ হি.'
  start_date  date not null,
  end_date    date not null,
  is_active   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (school_id, name),
  check (end_date > start_date)
);

-- Only one active year per school
create unique index if not exists uq_academic_years_active
  on public.academic_years(school_id)
  where is_active = true;

create trigger set_updated_at_academic_years
  before update on public.academic_years
  for each row execute function public.set_updated_at();

-- Classes ------------------------------------------------------------
create table if not exists public.classes (
  id             uuid primary key default gen_random_uuid(),
  school_id      uuid not null references public.schools(id) on delete cascade,
  branch_id      uuid references public.school_branches(id) on delete set null,
  name_bn        text not null,
  name_en        text,
  display_order  integer not null default 0,
  stream         public.class_stream not null default 'general',
  metadata       jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_classes_school on public.classes(school_id, display_order);
create trigger set_updated_at_classes
  before update on public.classes
  for each row execute function public.set_updated_at();

-- Sections -----------------------------------------------------------
create table if not exists public.sections (
  id                uuid primary key default gen_random_uuid(),
  class_id          uuid not null references public.classes(id) on delete cascade,
  name              text not null,
  capacity          integer,
  class_teacher_id  uuid references public.school_users(id) on delete set null,
  room              text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (class_id, name)
);

create index if not exists idx_sections_class on public.sections(class_id);
create trigger set_updated_at_sections
  before update on public.sections
  for each row execute function public.set_updated_at();

-- Subjects -----------------------------------------------------------
create table if not exists public.subjects (
  id            uuid primary key default gen_random_uuid(),
  school_id     uuid not null references public.schools(id) on delete cascade,
  class_id      uuid references public.classes(id) on delete cascade,
  name_bn       text not null,
  name_en       text,
  name_ar       text,
  code          text,
  full_marks    integer not null default 100,
  pass_marks    integer not null default 33,
  is_optional   boolean not null default false,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_subjects_school on public.subjects(school_id);
create index if not exists idx_subjects_class on public.subjects(class_id);
create trigger set_updated_at_subjects
  before update on public.subjects
  for each row execute function public.set_updated_at();

-- Class-subject assignment (which subjects are taught in which class/year)
create table if not exists public.class_subject_assignments (
  id                uuid primary key default gen_random_uuid(),
  class_id          uuid not null references public.classes(id) on delete cascade,
  subject_id        uuid not null references public.subjects(id) on delete cascade,
  academic_year_id  uuid not null references public.academic_years(id) on delete cascade,
  created_at        timestamptz not null default now(),
  unique (class_id, subject_id, academic_year_id)
);

-- Teacher assignments ------------------------------------------------
create table if not exists public.teacher_assignments (
  id                uuid primary key default gen_random_uuid(),
  school_user_id    uuid not null references public.school_users(id) on delete cascade,
  section_id        uuid not null references public.sections(id) on delete cascade,
  subject_id        uuid references public.subjects(id) on delete cascade,  -- null = class teacher
  academic_year_id  uuid not null references public.academic_years(id) on delete cascade,
  role_type         text not null check (role_type in ('class_teacher', 'subject', 'assistant')),
  created_at        timestamptz not null default now(),
  unique (school_user_id, section_id, subject_id, academic_year_id)
);

create index if not exists idx_teacher_assignments_user on public.teacher_assignments(school_user_id);
create index if not exists idx_teacher_assignments_section on public.teacher_assignments(section_id);

-- Students -----------------------------------------------------------
create table if not exists public.students (
  id                 uuid primary key default gen_random_uuid(),
  school_id          uuid not null references public.schools(id) on delete cascade,
  branch_id          uuid references public.school_branches(id) on delete set null,
  student_code       text not null,        -- unique within school (e.g. STU-1249)
  name_bn            text not null,
  name_en            text,
  name_ar            text,
  roll               integer,
  section_id         uuid references public.sections(id) on delete set null,
  admission_date     date,
  date_of_birth      date,
  gender             text check (gender in ('male', 'female', 'other')),
  blood_group        text,
  religion           text,
  nationality        text default 'Bangladeshi',
  nid_birth_cert     text,
  photo_url          text,
  guardian_phone     text,
  address_present    text,
  address_permanent  text,
  previous_school    text,
  status             public.student_status not null default 'active',
  metadata           jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (school_id, student_code)
);

create index if not exists idx_students_school_section on public.students(school_id, section_id);
create index if not exists idx_students_school_status on public.students(school_id, status);
create index if not exists idx_students_name_bn on public.students using gin(to_tsvector('simple', coalesce(name_bn, '')));
create trigger set_updated_at_students
  before update on public.students
  for each row execute function public.set_updated_at();

-- Student guardians --------------------------------------------------
create table if not exists public.student_guardians (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references public.students(id) on delete cascade,
  user_id         uuid,                          -- auth.users(id) if parent registered
  name_bn         text not null,
  name_en         text,
  phone           text,
  email           citext,
  relation        text not null,                 -- 'father' | 'mother' | 'guardian' | ...
  is_primary      boolean not null default false,
  can_pay_fees    boolean not null default false,
  occupation      text,
  monthly_income  numeric(12, 2),
  nid             text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_student_guardians_student on public.student_guardians(student_id);
create index if not exists idx_student_guardians_user on public.student_guardians(user_id);
create trigger set_updated_at_student_guardians
  before update on public.student_guardians
  for each row execute function public.set_updated_at();

-- Admission inquiries (lead funnel) ---------------------------------
create table if not exists public.admission_inquiries (
  id                uuid primary key default gen_random_uuid(),
  school_id         uuid not null references public.schools(id) on delete cascade,
  branch_id         uuid references public.school_branches(id) on delete set null,
  student_name      text not null,
  guardian_name     text,
  guardian_phone    text not null,
  guardian_email    citext,
  class_interested  uuid references public.classes(id) on delete set null,
  source            text not null default 'walk_in' check (source in ('walk_in', 'phone', 'online', 'referral', 'other')),
  status            text not null default 'new' check (status in ('new', 'contacted', 'visited', 'admitted', 'lost')),
  followup_date     date,
  assigned_to       uuid references public.school_users(id) on delete set null,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_admission_inquiries_school_status on public.admission_inquiries(school_id, status);
create index if not exists idx_admission_inquiries_followup on public.admission_inquiries(followup_date)
  where status in ('new', 'contacted', 'visited');
create trigger set_updated_at_admission_inquiries
  before update on public.admission_inquiries
  for each row execute function public.set_updated_at();

-- Student shifts (transfer history) ---------------------------------
create table if not exists public.student_shifts (
  id                 uuid primary key default gen_random_uuid(),
  student_id         uuid not null references public.students(id) on delete cascade,
  from_section_id    uuid references public.sections(id) on delete set null,
  to_section_id      uuid references public.sections(id) on delete set null,
  from_academic_year uuid references public.academic_years(id) on delete set null,
  to_academic_year   uuid references public.academic_years(id) on delete set null,
  reason             text,
  shifted_by         uuid references public.school_users(id) on delete set null,
  shifted_at         timestamptz not null default now()
);

create index if not exists idx_student_shifts_student on public.student_shifts(student_id, shifted_at desc);
