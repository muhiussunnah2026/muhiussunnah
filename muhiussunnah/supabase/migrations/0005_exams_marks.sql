-- =====================================================================
-- 0005 — Exams, subjects, seating, marks, grading, report cards
-- Ref: PROJECT_PLAN §5.4
-- =====================================================================

create table if not exists public.exams (
  id                uuid primary key default gen_random_uuid(),
  school_id         uuid not null references public.schools(id) on delete cascade,
  academic_year_id  uuid not null references public.academic_years(id) on delete cascade,
  name              text not null,
  type              text not null default 'term' check (type in ('term', 'annual', 'model_test', 'monthly', 'other')),
  start_date        date,
  end_date          date,
  is_published      boolean not null default false,
  published_at      timestamptz,
  settings          jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_exams_school_year on public.exams(school_id, academic_year_id);
create trigger set_updated_at_exams
  before update on public.exams
  for each row execute function public.set_updated_at();

-- Exam × subject × section (routine row)
create table if not exists public.exam_subjects (
  id             uuid primary key default gen_random_uuid(),
  exam_id        uuid not null references public.exams(id) on delete cascade,
  subject_id     uuid not null references public.subjects(id) on delete cascade,
  section_id     uuid not null references public.sections(id) on delete cascade,
  date           date,
  start_time     time,
  duration_mins  integer,
  full_marks     integer not null default 100,
  pass_marks     integer not null default 33,
  created_at     timestamptz not null default now(),
  unique (exam_id, subject_id, section_id)
);

create index if not exists idx_exam_subjects_exam on public.exam_subjects(exam_id);

-- Exam rooms (for seating arrangement) -------------------------------
create table if not exists public.exam_rooms (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools(id) on delete cascade,
  branch_id   uuid references public.school_branches(id) on delete set null,
  name        text not null,
  capacity    integer not null,
  rows        integer not null default 1,
  cols        integer not null default 1,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger set_updated_at_exam_rooms
  before update on public.exam_rooms
  for each row execute function public.set_updated_at();

create table if not exists public.exam_seating (
  id               uuid primary key default gen_random_uuid(),
  exam_subject_id  uuid not null references public.exam_subjects(id) on delete cascade,
  room_id          uuid not null references public.exam_rooms(id) on delete cascade,
  student_id       uuid not null references public.students(id) on delete cascade,
  seat_row         integer,
  seat_col         integer,
  unique (exam_subject_id, student_id),
  unique (exam_subject_id, room_id, seat_row, seat_col)
);

-- Marks --------------------------------------------------------------
create table if not exists public.marks (
  id               uuid primary key default gen_random_uuid(),
  school_id        uuid not null references public.schools(id) on delete cascade,
  exam_subject_id  uuid not null references public.exam_subjects(id) on delete cascade,
  student_id       uuid not null references public.students(id) on delete cascade,
  marks_obtained   numeric(6, 2),
  grade            text,
  is_absent        boolean not null default false,
  entered_by       uuid references public.school_users(id) on delete set null,
  entered_at       timestamptz not null default now(),
  locked           boolean not null default false,
  approved_by      uuid references public.school_users(id) on delete set null,
  approved_at      timestamptz,
  remarks          text,
  unique (exam_subject_id, student_id)
);

create index if not exists idx_marks_student on public.marks(student_id);
create index if not exists idx_marks_school on public.marks(school_id);

-- Grading scales -----------------------------------------------------
create table if not exists public.grading_scales (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools(id) on delete cascade,
  name        text not null,
  is_default  boolean not null default false,
  rules       jsonb not null,            -- e.g. [{min:80, max:100, grade:'A+', gpa:5.0}, ...]
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (school_id, name)
);

create unique index if not exists uq_grading_scales_default
  on public.grading_scales(school_id)
  where is_default = true;

create trigger set_updated_at_grading_scales
  before update on public.grading_scales
  for each row execute function public.set_updated_at();

-- Report cards (one per student per exam) ----------------------------
create table if not exists public.report_cards (
  id                      uuid primary key default gen_random_uuid(),
  school_id               uuid not null references public.schools(id) on delete cascade,
  student_id              uuid not null references public.students(id) on delete cascade,
  exam_id                 uuid not null references public.exams(id) on delete cascade,
  overall_gpa             numeric(4, 2),
  overall_grade           text,
  total_marks_obtained    numeric(8, 2),
  total_full_marks        numeric(8, 2),
  position_in_class       integer,
  attendance_pct          numeric(5, 2),
  teacher_comment         text,
  ai_generated_comment    text,
  principal_remark        text,
  pdf_url                 text,
  published_at            timestamptz,
  published_by            uuid references public.school_users(id) on delete set null,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  unique (student_id, exam_id)
);

create index if not exists idx_report_cards_school_exam on public.report_cards(school_id, exam_id);
create trigger set_updated_at_report_cards
  before update on public.report_cards
  for each row execute function public.set_updated_at();
