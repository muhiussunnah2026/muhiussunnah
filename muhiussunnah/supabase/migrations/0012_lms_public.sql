-- =====================================================================
-- 0012 — LMS (assignments, online classes) + public school website
-- Ref: PROJECT_PLAN §5.12, §5.13 (v2 — scaffolded in Phase 0)
-- =====================================================================

-- Assignments -------------------------------------------------------
create table if not exists public.assignments (
  id           uuid primary key default gen_random_uuid(),
  school_id    uuid not null references public.schools(id) on delete cascade,
  subject_id   uuid not null references public.subjects(id) on delete cascade,
  section_id   uuid not null references public.sections(id) on delete cascade,
  title        text not null,
  description  text,
  due_date     timestamptz,
  max_marks    integer,
  attachments  jsonb not null default '[]'::jsonb,
  created_by   uuid references public.school_users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_assignments_section on public.assignments(section_id, due_date);
create trigger set_updated_at_assignments
  before update on public.assignments
  for each row execute function public.set_updated_at();

create table if not exists public.assignment_submissions (
  id             uuid primary key default gen_random_uuid(),
  assignment_id  uuid not null references public.assignments(id) on delete cascade,
  student_id     uuid not null references public.students(id) on delete cascade,
  submitted_at   timestamptz,
  file_url       text,
  body           text,
  marks          numeric(5, 2),
  feedback       text,
  graded_by      uuid references public.school_users(id) on delete set null,
  graded_at      timestamptz,
  unique (assignment_id, student_id)
);

create index if not exists idx_assignment_submissions_student on public.assignment_submissions(student_id);

-- Online classes ----------------------------------------------------
create table if not exists public.online_classes (
  id             uuid primary key default gen_random_uuid(),
  school_id      uuid not null references public.schools(id) on delete cascade,
  subject_id     uuid not null references public.subjects(id) on delete cascade,
  section_id     uuid not null references public.sections(id) on delete cascade,
  title          text,
  scheduled_at   timestamptz not null,
  duration_mins  integer,
  meet_url       text,
  provider       text,
  recording_url  text,
  created_by     uuid references public.school_users(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_online_classes_section on public.online_classes(section_id, scheduled_at);
create trigger set_updated_at_online_classes
  before update on public.online_classes
  for each row execute function public.set_updated_at();

-- Public school website per tenant ----------------------------------
create table if not exists public.public_pages (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools(id) on delete cascade,
  slug        text not null,
  title       text not null,
  body_html   text,
  seo_meta    jsonb not null default '{}'::jsonb,
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (school_id, slug)
);

create trigger set_updated_at_public_pages
  before update on public.public_pages
  for each row execute function public.set_updated_at();

create table if not exists public.public_gallery (
  id             uuid primary key default gen_random_uuid(),
  school_id      uuid not null references public.schools(id) on delete cascade,
  album          text,
  image_url      text not null,
  caption        text,
  display_order  integer not null default 0,
  created_at     timestamptz not null default now()
);

create index if not exists idx_public_gallery_school on public.public_gallery(school_id, album, display_order);

create table if not exists public.public_news (
  id            uuid primary key default gen_random_uuid(),
  school_id     uuid not null references public.schools(id) on delete cascade,
  title         text not null,
  body          text,
  image_url     text,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_public_news_school_published on public.public_news(school_id, published_at desc);
create trigger set_updated_at_public_news
  before update on public.public_news
  for each row execute function public.set_updated_at();
