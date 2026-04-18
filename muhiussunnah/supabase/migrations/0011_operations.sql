-- =====================================================================
-- 0011 — Library, Transport, Hostel, Canteen, Inventory, Health, Counseling
-- Ref: PROJECT_PLAN §5.11
-- =====================================================================

-- Library ------------------------------------------------------------
create table if not exists public.library_books (
  id              uuid primary key default gen_random_uuid(),
  school_id       uuid not null references public.schools(id) on delete cascade,
  title           text not null,
  author          text,
  isbn            text,
  category        text,
  publisher       text,
  language        text,
  copies_total    integer not null default 1,
  copies_available integer not null default 1,
  shelf           text,
  price           numeric(10, 2),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_library_books_school on public.library_books(school_id);
create index if not exists idx_library_books_title on public.library_books using gin(to_tsvector('simple', coalesce(title, '')));
create trigger set_updated_at_library_books
  before update on public.library_books
  for each row execute function public.set_updated_at();

create table if not exists public.library_issues (
  id           uuid primary key default gen_random_uuid(),
  book_id      uuid not null references public.library_books(id) on delete restrict,
  student_id   uuid references public.students(id) on delete set null,
  school_user_id uuid references public.school_users(id) on delete set null,
  issued_on    date not null default current_date,
  due_on       date not null,
  returned_on  date,
  fine         numeric(10, 2) not null default 0,
  issued_by    uuid references public.school_users(id) on delete set null,
  notes        text,
  check (student_id is not null or school_user_id is not null)
);

create index if not exists idx_library_issues_book on public.library_issues(book_id);
create index if not exists idx_library_issues_student on public.library_issues(student_id);

-- Transport ----------------------------------------------------------
create table if not exists public.transport_routes (
  id              uuid primary key default gen_random_uuid(),
  school_id       uuid not null references public.schools(id) on delete cascade,
  name            text not null,
  start_point     text,
  end_point       text,
  fare_per_month  numeric(10, 2),
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger set_updated_at_transport_routes
  before update on public.transport_routes
  for each row execute function public.set_updated_at();

create table if not exists public.transport_vehicles (
  id             uuid primary key default gen_random_uuid(),
  route_id       uuid not null references public.transport_routes(id) on delete cascade,
  reg_no         text not null,
  driver_name    text,
  driver_phone   text,
  capacity       integer,
  gps_device_id  text,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (route_id, reg_no)
);

create trigger set_updated_at_transport_vehicles
  before update on public.transport_vehicles
  for each row execute function public.set_updated_at();

create table if not exists public.transport_students (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.students(id) on delete cascade,
  route_id     uuid not null references public.transport_routes(id) on delete cascade,
  vehicle_id   uuid references public.transport_vehicles(id) on delete set null,
  pickup_stop  text,
  pickup_time  time,
  drop_time    time,
  from_date    date not null default current_date,
  to_date      date,
  unique (student_id, route_id)
);

create index if not exists idx_transport_students_student on public.transport_students(student_id);

-- GPS pings (append-only; high volume — partition later if needed) ---
create table if not exists public.transport_gps_pings (
  id           uuid primary key default gen_random_uuid(),
  vehicle_id   uuid not null references public.transport_vehicles(id) on delete cascade,
  lat          numeric(10, 7) not null,
  lng          numeric(10, 7) not null,
  speed        numeric(5, 2),
  heading      numeric(5, 2),
  recorded_at  timestamptz not null default now()
);

create index if not exists idx_transport_gps_pings_vehicle_time on public.transport_gps_pings(vehicle_id, recorded_at desc);

-- Hostel -------------------------------------------------------------
create table if not exists public.hostels (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools(id) on delete cascade,
  branch_id   uuid references public.school_branches(id) on delete set null,
  name        text not null,
  gender      text check (gender in ('male', 'female', 'mixed')),
  capacity    integer,
  address     text,
  warden_id   uuid references public.school_users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger set_updated_at_hostels
  before update on public.hostels
  for each row execute function public.set_updated_at();

create table if not exists public.hostel_rooms (
  id         uuid primary key default gen_random_uuid(),
  hostel_id  uuid not null references public.hostels(id) on delete cascade,
  room_no    text not null,
  capacity   integer not null default 1,
  unique (hostel_id, room_no)
);

create table if not exists public.hostel_allocations (
  id          uuid primary key default gen_random_uuid(),
  room_id     uuid not null references public.hostel_rooms(id) on delete cascade,
  student_id  uuid not null references public.students(id) on delete cascade,
  from_date   date not null default current_date,
  to_date     date,
  bed_no      text
);

create index if not exists idx_hostel_allocations_student on public.hostel_allocations(student_id);

-- Canteen (prepaid wallet) ------------------------------------------
create table if not exists public.canteen_wallet (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools(id) on delete cascade,
  student_id  uuid not null references public.students(id) on delete cascade,
  balance     numeric(10, 2) not null default 0,
  updated_at  timestamptz not null default now(),
  unique (student_id)
);

create trigger set_updated_at_canteen_wallet
  before update on public.canteen_wallet
  for each row execute function public.set_updated_at();

create table if not exists public.canteen_transactions (
  id           uuid primary key default gen_random_uuid(),
  school_id    uuid not null references public.schools(id) on delete cascade,
  student_id   uuid not null references public.students(id) on delete cascade,
  amount       numeric(10, 2) not null,
  type         text not null check (type in ('topup', 'spend', 'refund', 'adjustment')),
  item_name    text,
  merchant_id  uuid,
  at           timestamptz not null default now()
);

create index if not exists idx_canteen_transactions_student on public.canteen_transactions(student_id, at desc);

-- Inventory ---------------------------------------------------------
create table if not exists public.inventory_items (
  id             uuid primary key default gen_random_uuid(),
  school_id      uuid not null references public.schools(id) on delete cascade,
  name           text not null,
  category       text,
  unit           text,
  stock          numeric(10, 2) not null default 0,
  reorder_level  numeric(10, 2),
  unit_price     numeric(10, 2),
  supplier       text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger set_updated_at_inventory_items
  before update on public.inventory_items
  for each row execute function public.set_updated_at();

create table if not exists public.inventory_movements (
  id          uuid primary key default gen_random_uuid(),
  item_id     uuid not null references public.inventory_items(id) on delete cascade,
  type        text not null check (type in ('in', 'out', 'adjustment', 'waste', 'transfer')),
  qty         numeric(10, 2) not null,
  reference   text,
  date        date not null default current_date,
  by_user     uuid references public.school_users(id) on delete set null,
  notes       text
);

create index if not exists idx_inventory_movements_item on public.inventory_movements(item_id, date desc);

-- Health ------------------------------------------------------------
create table if not exists public.student_health (
  id                  uuid primary key default gen_random_uuid(),
  student_id          uuid not null references public.students(id) on delete cascade,
  blood_group         text,
  allergies           text,
  chronic_conditions  text,
  medications         text,
  emergency_contact   text,
  doctor_name         text,
  doctor_phone        text,
  vaccinations        jsonb not null default '[]'::jsonb,
  last_checkup_date   date,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (student_id)
);

create trigger set_updated_at_student_health
  before update on public.student_health
  for each row execute function public.set_updated_at();

-- Counseling logs (confidential — principal + counselor only) -------
create table if not exists public.counseling_logs (
  id              uuid primary key default gen_random_uuid(),
  school_id       uuid not null references public.schools(id) on delete cascade,
  student_id      uuid not null references public.students(id) on delete cascade,
  date            date not null default current_date,
  type            text check (type in ('academic', 'behavioral', 'personal', 'parental', 'disciplinary', 'other')),
  summary         text not null,
  action_taken    text,
  confidential    boolean not null default true,
  created_by      uuid references public.school_users(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_counseling_logs_student on public.counseling_logs(student_id, date desc);
