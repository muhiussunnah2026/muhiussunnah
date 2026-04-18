-- =====================================================================
-- 0008 — Notices, unified messaging queue, SMS/WhatsApp/Push logs,
--        conversations, messages
-- Ref: PROJECT_PLAN §5.7
-- =====================================================================

create table if not exists public.notices (
  id            uuid primary key default gen_random_uuid(),
  school_id     uuid not null references public.schools(id) on delete cascade,
  branch_id     uuid references public.school_branches(id) on delete set null,
  title         text not null,
  body          text not null,
  audience      text not null default 'all' check (audience in ('all', 'staff', 'teachers', 'students', 'parents', 'class', 'section', 'individual')),
  target_ids    jsonb not null default '[]'::jsonb,
  attachments   jsonb not null default '[]'::jsonb,
  channels      jsonb not null default '["inapp"]'::jsonb,  -- ['inapp','sms','whatsapp','push','email']
  scheduled_for timestamptz,
  sent_at       timestamptz,
  created_by    uuid references public.school_users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_notices_school_sent on public.notices(school_id, sent_at desc nulls first);
create trigger set_updated_at_notices
  before update on public.notices
  for each row execute function public.set_updated_at();

-- Unified messaging queue (cross-channel) ----------------------------
create table if not exists public.message_queue (
  id             uuid primary key default gen_random_uuid(),
  school_id      uuid not null references public.schools(id) on delete cascade,
  notice_id      uuid references public.notices(id) on delete set null,
  channel        text not null check (channel in ('sms', 'whatsapp', 'push', 'email', 'inapp')),
  recipient      text not null,           -- phone number, email, user_id depending on channel
  recipient_user uuid,                    -- auth.users id if applicable
  body           text not null,
  template_name  text,
  variables      jsonb,
  status         text not null default 'queued' check (status in ('queued', 'sending', 'sent', 'failed', 'delivered', 'read', 'bounced')),
  provider       text,
  cost           numeric(8, 4),
  scheduled_for  timestamptz,
  sent_at        timestamptz,
  error          text,
  retry_count    integer not null default 0,
  created_at     timestamptz not null default now()
);

create index if not exists idx_message_queue_status on public.message_queue(status, scheduled_for)
  where status in ('queued', 'failed');
create index if not exists idx_message_queue_school on public.message_queue(school_id, created_at desc);

-- SMS log (provider-agnostic) ----------------------------------------
create table if not exists public.sms_logs (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools(id) on delete cascade,
  recipient   text not null,
  message     text not null,
  status      text not null default 'queued',
  provider    text,
  cost        numeric(8, 4),
  sent_at     timestamptz,
  error       text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists idx_sms_logs_school_sent on public.sms_logs(school_id, sent_at desc);

-- WhatsApp log --------------------------------------------------------
create table if not exists public.whatsapp_logs (
  id             uuid primary key default gen_random_uuid(),
  school_id      uuid not null references public.schools(id) on delete cascade,
  recipient      text not null,
  template_name  text,
  variables      jsonb,
  status         text not null default 'queued',
  provider       text,
  cost           numeric(8, 4),
  sent_at        timestamptz,
  error          text,
  metadata       jsonb,
  created_at     timestamptz not null default now()
);

create index if not exists idx_whatsapp_logs_school_sent on public.whatsapp_logs(school_id, sent_at desc);

-- Push log ------------------------------------------------------------
create table if not exists public.push_logs (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools(id) on delete cascade,
  user_id     uuid,
  title       text,
  body        text,
  status      text not null default 'queued',
  sent_at     timestamptz,
  error       text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists idx_push_logs_school_sent on public.push_logs(school_id, sent_at desc);

-- Conversations + messages (in-app direct messaging) ------------------
create table if not exists public.conversations (
  id                    uuid primary key default gen_random_uuid(),
  school_id             uuid not null references public.schools(id) on delete cascade,
  subject               text,
  kind                  text not null default 'direct' check (kind in ('direct', 'group', 'teacher_parent', 'broadcast')),
  created_by            uuid,
  allow_parent_teacher  boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create trigger set_updated_at_conversations
  before update on public.conversations
  for each row execute function public.set_updated_at();

create table if not exists public.conversation_participants (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.conversations(id) on delete cascade,
  user_id          uuid not null,
  school_user_id   uuid references public.school_users(id) on delete set null,
  joined_at        timestamptz not null default now(),
  last_read_at     timestamptz,
  unique (conversation_id, user_id)
);

create index if not exists idx_conversation_participants_user on public.conversation_participants(user_id);

create table if not exists public.messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.conversations(id) on delete cascade,
  sender_id        uuid not null,              -- auth.users id
  body             text not null,
  attachments      jsonb not null default '[]'::jsonb,
  sent_at          timestamptz not null default now(),
  read_by          jsonb not null default '[]'::jsonb,   -- array of {user_id, read_at}
  edited_at        timestamptz,
  deleted_at       timestamptz
);

create index if not exists idx_messages_conversation_sent on public.messages(conversation_id, sent_at desc);
