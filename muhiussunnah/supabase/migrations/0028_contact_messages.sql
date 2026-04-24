-- =====================================================================
-- 0028 — Contact-form inbox
-- =====================================================================
-- Marketing /contact page's form was cosmetic only — submissions went
-- nowhere. Persist every inquiry so the platform owner has a single
-- inbox to review (and optionally fire an email notification when the
-- Resend API key is configured).
-- =====================================================================

create table if not exists public.contact_messages (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  school        text,
  email         citext not null,
  phone         text,
  subject       text,
  message       text not null,
  status        text not null default 'new' check (status in ('new', 'read', 'archived')),
  user_agent    text,
  ip_address    inet,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_contact_messages_status_created
  on public.contact_messages(status, created_at desc);

-- RLS: table is platform-level, only super admins can read/write.
-- Inserts from the public contact form go through the service-role
-- admin client (bypasses RLS), so the public can submit without an
-- account — but nobody can read except super admins.
alter table public.contact_messages enable row level security;

drop policy if exists contact_messages_super_admin_all on public.contact_messages;
create policy contact_messages_super_admin_all on public.contact_messages
  for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());
