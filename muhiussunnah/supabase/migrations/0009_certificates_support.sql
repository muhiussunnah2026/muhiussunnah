-- =====================================================================
-- 0009 — Certificates + support tickets
-- Ref: PROJECT_PLAN §5.8, §5.9
-- =====================================================================

create table if not exists public.certificate_templates (
  id             uuid primary key default gen_random_uuid(),
  school_id      uuid not null references public.schools(id) on delete cascade,
  type           text not null check (type in ('testimonial', 'tc', 'character', 'completion', 'hifz_sanad', 'other')),
  name           text not null,
  html_template  text not null,
  variables      jsonb not null default '[]'::jsonb,
  orientation    text not null default 'portrait' check (orientation in ('portrait', 'landscape')),
  paper_size     text not null default 'A4',
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (school_id, type, name)
);

create trigger set_updated_at_certificate_templates
  before update on public.certificate_templates
  for each row execute function public.set_updated_at();

create table if not exists public.certificates_issued (
  id           uuid primary key default gen_random_uuid(),
  school_id    uuid not null references public.schools(id) on delete cascade,
  student_id   uuid not null references public.students(id) on delete cascade,
  template_id  uuid not null references public.certificate_templates(id) on delete restrict,
  issued_on    date not null default current_date,
  serial_no    text not null,
  issued_by    uuid references public.school_users(id) on delete set null,
  pdf_url      text,
  signed_qr    text,
  data         jsonb not null default '{}'::jsonb,
  unique (school_id, serial_no)
);

create index if not exists idx_certificates_student on public.certificates_issued(student_id);
create index if not exists idx_certificates_school on public.certificates_issued(school_id, issued_on desc);

-- Support tickets ----------------------------------------------------
create table if not exists public.support_tickets (
  id           uuid primary key default gen_random_uuid(),
  school_id    uuid not null references public.schools(id) on delete cascade,
  created_by   uuid not null,                         -- auth.users id
  subject      text not null,
  body         text not null,
  priority     text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  status       text not null default 'open' check (status in ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
  category     text,
  assigned_to  uuid,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  resolved_at  timestamptz
);

create index if not exists idx_support_tickets_school_status on public.support_tickets(school_id, status);
create trigger set_updated_at_support_tickets
  before update on public.support_tickets
  for each row execute function public.set_updated_at();

create table if not exists public.support_messages (
  id          uuid primary key default gen_random_uuid(),
  ticket_id   uuid not null references public.support_tickets(id) on delete cascade,
  user_id     uuid not null,
  body        text not null,
  attachments jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists idx_support_messages_ticket on public.support_messages(ticket_id, created_at);
