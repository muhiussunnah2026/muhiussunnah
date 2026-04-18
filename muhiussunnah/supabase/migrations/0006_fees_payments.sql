-- =====================================================================
-- 0006 — Fees, invoices, payments, per-student ledger, scholarships
-- Ref: PROJECT_PLAN §5.5, §6.1 (27 default fee heads)
-- =====================================================================

-- Fee heads ----------------------------------------------------------
create table if not exists public.fee_heads (
  id              uuid primary key default gen_random_uuid(),
  school_id       uuid not null references public.schools(id) on delete cascade,
  name_bn         text not null,
  name_en         text,
  type            text not null default 'general' check (type in ('general', 'admission', 'session', 'exam', 'transport', 'hostel', 'canteen', 'other')),
  default_amount  numeric(10, 2) not null default 0,
  applies_to      text not null default 'all' check (applies_to in ('all', 'class', 'section', 'stream')),
  is_recurring    boolean not null default false,
  frequency       text check (frequency in ('monthly', 'quarterly', 'annual', 'one_time')),
  display_order   integer not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (school_id, name_bn)
);

create index if not exists idx_fee_heads_school on public.fee_heads(school_id, display_order);
create trigger set_updated_at_fee_heads
  before update on public.fee_heads
  for each row execute function public.set_updated_at();

-- Fee structures (amount per class per head) -------------------------
create table if not exists public.fee_structures (
  id             uuid primary key default gen_random_uuid(),
  school_id      uuid not null references public.schools(id) on delete cascade,
  class_id       uuid references public.classes(id) on delete cascade,
  section_id     uuid references public.sections(id) on delete cascade,
  fee_head_id    uuid not null references public.fee_heads(id) on delete cascade,
  amount         numeric(10, 2) not null,
  frequency      text not null check (frequency in ('monthly', 'quarterly', 'annual', 'one_time')),
  effective_from date,
  effective_to   date,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_fee_structures_school_class on public.fee_structures(school_id, class_id);
create trigger set_updated_at_fee_structures
  before update on public.fee_structures
  for each row execute function public.set_updated_at();

-- Fee invoices (issued per student per period) ------------------------
create table if not exists public.fee_invoices (
  id              uuid primary key default gen_random_uuid(),
  school_id       uuid not null references public.schools(id) on delete cascade,
  student_id      uuid not null references public.students(id) on delete cascade,
  invoice_no      text not null,
  month           integer check (month between 1 and 12),
  year            integer,
  issue_date      date not null default current_date,
  due_date        date,
  total_amount    numeric(10, 2) not null default 0,
  paid_amount     numeric(10, 2) not null default 0,
  due_amount      numeric(10, 2) generated always as (total_amount - paid_amount) stored,
  late_fee        numeric(10, 2) not null default 0,
  status          text not null default 'unpaid' check (status in ('unpaid', 'partial', 'paid', 'overdue', 'canceled')),
  notes           text,
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (school_id, invoice_no)
);

create index if not exists idx_fee_invoices_student on public.fee_invoices(student_id, year, month);
create index if not exists idx_fee_invoices_status on public.fee_invoices(school_id, status);
create trigger set_updated_at_fee_invoices
  before update on public.fee_invoices
  for each row execute function public.set_updated_at();

-- Invoice line items -------------------------------------------------
create table if not exists public.fee_invoice_items (
  id              uuid primary key default gen_random_uuid(),
  invoice_id      uuid not null references public.fee_invoices(id) on delete cascade,
  fee_head_id     uuid not null references public.fee_heads(id) on delete restrict,
  amount          numeric(10, 2) not null,
  waiver          numeric(10, 2) not null default 0,
  waiver_reason   text,
  description     text
);

create index if not exists idx_fee_invoice_items_invoice on public.fee_invoice_items(invoice_id);

-- Payments (against invoices) ---------------------------------------
create table if not exists public.payments (
  id               uuid primary key default gen_random_uuid(),
  school_id        uuid not null references public.schools(id) on delete cascade,
  invoice_id       uuid references public.fee_invoices(id) on delete set null,
  student_id       uuid references public.students(id) on delete set null,
  amount           numeric(10, 2) not null,
  method           text not null check (method in ('cash', 'bkash', 'nagad', 'rocket', 'upay', 'card', 'bank_transfer', 'cheque', 'other')),
  transaction_id   text,
  gateway_ref      text,
  gateway_raw      jsonb,
  paid_at          timestamptz not null default now(),
  received_by      uuid references public.school_users(id) on delete set null,
  status           text not null default 'completed' check (status in ('pending', 'completed', 'failed', 'refunded', 'canceled')),
  receipt_no       text,
  refund_status    text,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (school_id, receipt_no)
);

create index if not exists idx_payments_invoice on public.payments(invoice_id);
create index if not exists idx_payments_student on public.payments(student_id, paid_at desc);
create index if not exists idx_payments_school_method on public.payments(school_id, method);
create trigger set_updated_at_payments
  before update on public.payments
  for each row execute function public.set_updated_at();

-- Per-student ledger snapshot (derived) -----------------------------
create table if not exists public.student_ledger_entries (
  id               uuid primary key default gen_random_uuid(),
  school_id        uuid not null references public.schools(id) on delete cascade,
  student_id       uuid not null references public.students(id) on delete cascade,
  date             date not null default current_date,
  ref_type         text not null check (ref_type in ('invoice', 'payment', 'waiver', 'adjustment', 'scholarship', 'opening_balance')),
  ref_id           uuid,
  debit            numeric(10, 2) not null default 0,
  credit           numeric(10, 2) not null default 0,
  running_balance  numeric(12, 2),
  note             text,
  created_at       timestamptz not null default now()
);

create index if not exists idx_student_ledger_student_date on public.student_ledger_entries(student_id, date desc);

-- Scholarships ------------------------------------------------------
create table if not exists public.scholarships (
  id           uuid primary key default gen_random_uuid(),
  school_id    uuid not null references public.schools(id) on delete cascade,
  name         text not null,
  description  text,
  criteria     jsonb not null default '{}'::jsonb,
  amount_type  text not null check (amount_type in ('fixed', 'percentage')),
  amount       numeric(10, 2) not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger set_updated_at_scholarships
  before update on public.scholarships
  for each row execute function public.set_updated_at();

create table if not exists public.student_scholarships (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references public.students(id) on delete cascade,
  scholarship_id  uuid not null references public.scholarships(id) on delete cascade,
  granted_by      uuid references public.school_users(id) on delete set null,
  granted_at      timestamptz not null default now(),
  valid_until     date,
  notes           text,
  unique (student_id, scholarship_id)
);

create index if not exists idx_student_scholarships_student on public.student_scholarships(student_id);
