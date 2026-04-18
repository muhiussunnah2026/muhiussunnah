-- =====================================================================
-- 0007 — Expenses, cash receives, investments, donations, salaries
-- Ref: PROJECT_PLAN §5.6, §6.2 (24 expense heads), §6.3 (8 cash receive heads)
-- =====================================================================

-- Expense heads -----------------------------------------------------
create table if not exists public.expense_heads (
  id             uuid primary key default gen_random_uuid(),
  school_id      uuid not null references public.schools(id) on delete cascade,
  name_bn        text not null,
  name_en        text,
  category       text not null default 'general' check (category in ('general', 'utility', 'salary', 'asset', 'loan', 'maintenance', 'purchase', 'travel', 'event', 'misc')),
  display_order  integer not null default 0,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (school_id, name_bn)
);

create trigger set_updated_at_expense_heads
  before update on public.expense_heads
  for each row execute function public.set_updated_at();

-- Expenses ----------------------------------------------------------
create table if not exists public.expenses (
  id              uuid primary key default gen_random_uuid(),
  school_id       uuid not null references public.schools(id) on delete cascade,
  branch_id       uuid references public.school_branches(id) on delete set null,
  date            date not null default current_date,
  head_id         uuid not null references public.expense_heads(id) on delete restrict,
  amount          numeric(12, 2) not null,
  paid_to         text,
  payment_method  text not null default 'cash' check (payment_method in ('cash', 'bkash', 'nagad', 'rocket', 'card', 'bank_transfer', 'cheque', 'other')),
  reference_no    text,
  description     text,
  approved_by     uuid references public.school_users(id) on delete set null,
  approved_at     timestamptz,
  attachment_url  text,
  created_by      uuid references public.school_users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_expenses_school_date on public.expenses(school_id, date desc);
create index if not exists idx_expenses_head on public.expenses(head_id);
create trigger set_updated_at_expenses
  before update on public.expenses
  for each row execute function public.set_updated_at();

-- Cash receive heads (admin receive, bank withdraw, loan, etc.) -----
create table if not exists public.cash_receive_heads (
  id             uuid primary key default gen_random_uuid(),
  school_id      uuid not null references public.schools(id) on delete cascade,
  name_bn        text not null,
  name_en        text,
  display_order  integer not null default 0,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (school_id, name_bn)
);

create trigger set_updated_at_cash_receive_heads
  before update on public.cash_receive_heads
  for each row execute function public.set_updated_at();

create table if not exists public.cash_receives (
  id             uuid primary key default gen_random_uuid(),
  school_id      uuid not null references public.schools(id) on delete cascade,
  branch_id      uuid references public.school_branches(id) on delete set null,
  date           date not null default current_date,
  head_id        uuid not null references public.cash_receive_heads(id) on delete restrict,
  amount         numeric(12, 2) not null,
  received_from  text,
  method         text not null default 'cash' check (method in ('cash', 'bkash', 'nagad', 'rocket', 'card', 'bank_transfer', 'cheque', 'other')),
  reference_no   text,
  received_by    uuid references public.school_users(id) on delete set null,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_cash_receives_school_date on public.cash_receives(school_id, date desc);
create trigger set_updated_at_cash_receives
  before update on public.cash_receives
  for each row execute function public.set_updated_at();

-- Investments -------------------------------------------------------
create table if not exists public.investments (
  id               uuid primary key default gen_random_uuid(),
  school_id        uuid not null references public.schools(id) on delete cascade,
  title            text not null,
  principal        numeric(12, 2) not null,
  return_expected  numeric(12, 2),
  start_date       date not null,
  maturity_date    date,
  status           text not null default 'active' check (status in ('active', 'matured', 'withdrawn', 'defaulted')),
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger set_updated_at_investments
  before update on public.investments
  for each row execute function public.set_updated_at();

create table if not exists public.investment_returns (
  id             uuid primary key default gen_random_uuid(),
  investment_id  uuid not null references public.investments(id) on delete cascade,
  date           date not null default current_date,
  amount         numeric(12, 2) not null,
  note           text,
  created_at     timestamptz not null default now()
);

create index if not exists idx_investment_returns_investment on public.investment_returns(investment_id, date desc);

-- Donations (চাঁদা) -------------------------------------------------
create table if not exists public.donation_campaigns (
  id            uuid primary key default gen_random_uuid(),
  school_id     uuid not null references public.schools(id) on delete cascade,
  title         text not null,
  description   text,
  target_amount numeric(12, 2),
  start_date    date,
  end_date      date,
  status        text not null default 'active' check (status in ('active', 'completed', 'canceled')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger set_updated_at_donation_campaigns
  before update on public.donation_campaigns
  for each row execute function public.set_updated_at();

create table if not exists public.donations (
  id              uuid primary key default gen_random_uuid(),
  school_id       uuid not null references public.schools(id) on delete cascade,
  campaign_id     uuid references public.donation_campaigns(id) on delete set null,
  donor_name      text,
  donor_phone     text,
  donor_email     citext,
  donor_address   text,
  amount          numeric(12, 2) not null,
  method          text not null default 'cash' check (method in ('cash', 'bkash', 'nagad', 'rocket', 'card', 'bank_transfer', 'cheque', 'other')),
  received_by     uuid references public.school_users(id) on delete set null,
  received_at     timestamptz not null default now(),
  receipt_no      text,
  is_anonymous    boolean not null default false,
  notes           text,
  unique (school_id, receipt_no)
);

create index if not exists idx_donations_school_date on public.donations(school_id, received_at desc);
create index if not exists idx_donations_campaign on public.donations(campaign_id);

-- Staff salaries (basic v1 payroll) --------------------------------
create table if not exists public.staff_salaries (
  id              uuid primary key default gen_random_uuid(),
  school_user_id  uuid not null references public.school_users(id) on delete cascade,
  month           integer not null check (month between 1 and 12),
  year            integer not null,
  basic           numeric(10, 2) not null default 0,
  allowances      jsonb not null default '{}'::jsonb,
  deductions      jsonb not null default '{}'::jsonb,
  gross_amount    numeric(10, 2) not null default 0,
  net_amount      numeric(10, 2) not null default 0,
  status          text not null default 'draft' check (status in ('draft', 'approved', 'paid')),
  paid_on         date,
  paid_by         uuid references public.school_users(id) on delete set null,
  payment_method  text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (school_user_id, month, year)
);

create trigger set_updated_at_staff_salaries
  before update on public.staff_salaries
  for each row execute function public.set_updated_at();
