-- =====================================================================
-- 0015 — SMS credit tracking + notice templates (Phase 4)
-- Ref: PROJECT_PLAN §5.7 + FEATURE_COMPARISON §1.7 (SMS balance tracking)
-- =====================================================================

-- SMS credit balance lives on schools for simplicity. A ledger of topups
-- in `sms_credit_topups` lets Super Admin reconcile and charge back.

alter table public.schools
  add column if not exists sms_credit_balance_bdt numeric(12, 2) not null default 0,
  add column if not exists sms_per_msg_bdt_en numeric(5, 3) not null default 0.25,
  add column if not exists sms_per_msg_bdt_bn numeric(5, 3) not null default 0.40,
  add column if not exists whatsapp_per_msg_bdt numeric(5, 3) not null default 0.50,
  add column if not exists messaging_default_channels jsonb not null default '["inapp","push"]'::jsonb,
  add column if not exists allow_parent_teacher_dm boolean not null default true;

create table if not exists public.sms_credit_topups (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools(id) on delete cascade,
  amount_bdt  numeric(12, 2) not null,
  method      text not null default 'manual' check (method in ('manual', 'bkash', 'nagad', 'card', 'bank_transfer', 'free')),
  reference   text,
  note        text,
  added_by    uuid,                                   -- auth.users(id) super admin
  balance_after numeric(12, 2) not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_sms_credit_topups_school on public.sms_credit_topups(school_id, created_at desc);
alter table public.sms_credit_topups enable row level security;
alter table public.sms_credit_topups force row level security;
drop policy if exists sms_topups_super_admin on public.sms_credit_topups;
create policy sms_topups_super_admin on public.sms_credit_topups
  for all using (public.is_super_admin()) with check (public.is_super_admin());
drop policy if exists sms_topups_school_read on public.sms_credit_topups;
create policy sms_topups_school_read on public.sms_credit_topups
  for select using (public.is_school_member(school_id));

-- Notice templates (reusable SMS/WhatsApp/Email skeletons) ----------
create table if not exists public.notice_templates (
  id            uuid primary key default gen_random_uuid(),
  school_id     uuid not null references public.schools(id) on delete cascade,
  name          text not null,
  subject       text,
  body          text not null,
  channels      jsonb not null default '["sms","inapp"]'::jsonb,
  variables     jsonb not null default '[]'::jsonb,       -- [{name, example}]
  whatsapp_template_name text,                            -- Meta pre-approved template name
  created_by    uuid,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (school_id, name)
);

create trigger set_updated_at_notice_templates
  before update on public.notice_templates
  for each row execute function public.set_updated_at();

alter table public.notice_templates enable row level security;
alter table public.notice_templates force row level security;
drop policy if exists notice_templates_member_all on public.notice_templates;
create policy notice_templates_member_all on public.notice_templates
  for all using (public.is_school_member(school_id))
  with check (public.is_school_member(school_id));

-- Helper: deduct from SMS credit + insert topup row (called by server action)
create or replace function public.debit_sms_credit(
  target_school uuid,
  amount_bdt numeric,
  note_text text default null
)
returns numeric
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_balance numeric;
begin
  select sms_credit_balance_bdt into current_balance
  from public.schools
  where id = target_school
  for update;

  if current_balance is null then
    raise exception 'School % not found', target_school;
  end if;

  if current_balance < amount_bdt then
    raise exception 'Insufficient SMS credit. Balance: %, required: %', current_balance, amount_bdt;
  end if;

  update public.schools
  set sms_credit_balance_bdt = sms_credit_balance_bdt - amount_bdt
  where id = target_school;

  return current_balance - amount_bdt;
end;
$$;

grant execute on function public.debit_sms_credit(uuid, numeric, text) to authenticated, service_role;
