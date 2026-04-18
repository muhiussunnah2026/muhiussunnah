-- =====================================================================
-- 0002 — Tenant: schools, branches, users, permissions, audit log
-- Ref: PROJECT_PLAN §5.1, §4 (multi-tenancy + multi-branch)
-- =====================================================================

-- Subscription plans (platform-level, managed by Super Admin) ---------
create table if not exists public.subscription_plans (
  id            uuid primary key default gen_random_uuid(),
  code          text unique not null,        -- 'free_trial' | 'basic' | 'pro' | 'madrasa_pro' | 'enterprise'
  name_bn       text not null,
  name_en       text not null,
  price_bdt     numeric(10, 2) not null default 0,
  max_students  integer,
  max_branches  integer,
  max_sms       integer,
  max_storage_mb integer,
  features      jsonb not null default '{}'::jsonb,
  is_active     boolean not null default true,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger set_updated_at_subscription_plans
  before update on public.subscription_plans
  for each row execute function public.set_updated_at();

-- Schools (tenants) ---------------------------------------------------
create table if not exists public.schools (
  id                    uuid primary key default gen_random_uuid(),
  slug                  citext unique not null,
  name_bn               text not null,
  name_en               text,
  eiin                  text,                 -- Bangladesh EIIN code (nullable)
  type                  public.school_type not null default 'school',
  address               text,
  phone                 text,
  email                 citext,
  logo_url              text,
  website               text,
  subscription_plan_id  uuid references public.subscription_plans(id) on delete set null,
  subscription_status   public.subscription_status not null default 'trial',
  trial_ends_at         timestamptz,
  subscription_expires_at timestamptz,
  settings              jsonb not null default '{}'::jsonb,
  created_by            uuid,                 -- references auth.users(id), set on creation
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_schools_subscription_status on public.schools(subscription_status);
create trigger set_updated_at_schools
  before update on public.schools
  for each row execute function public.set_updated_at();

-- School branches ----------------------------------------------------
create table if not exists public.school_branches (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools(id) on delete cascade,
  name        text not null,
  address     text,
  phone       text,
  is_primary  boolean not null default false,
  settings    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (school_id, name)
);

-- Only one primary branch per school
create unique index if not exists uq_school_branches_primary
  on public.school_branches(school_id)
  where is_primary = true;

create index if not exists idx_school_branches_school on public.school_branches(school_id);
create trigger set_updated_at_school_branches
  before update on public.school_branches
  for each row execute function public.set_updated_at();

-- School users (membership + role in a tenant) ------------------------
create table if not exists public.school_users (
  id              uuid primary key default gen_random_uuid(),
  school_id       uuid not null references public.schools(id) on delete cascade,
  branch_id       uuid references public.school_branches(id) on delete set null,
  user_id         uuid not null,              -- auth.users(id)
  role            public.user_role not null,
  employee_code   text,
  full_name_bn    text,
  full_name_en    text,
  phone           text,
  email           citext,
  photo_url       text,
  joined_at       date not null default current_date,
  status          text not null default 'active',  -- active | inactive | suspended
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (school_id, user_id, branch_id)
);

create index if not exists idx_school_users_school on public.school_users(school_id);
create index if not exists idx_school_users_user on public.school_users(user_id);
create index if not exists idx_school_users_role on public.school_users(school_id, role);
create trigger set_updated_at_school_users
  before update on public.school_users
  for each row execute function public.set_updated_at();

-- Granular permissions (PROJECT_PLAN §3.2) ----------------------------
create table if not exists public.user_permissions (
  id              uuid primary key default gen_random_uuid(),
  school_user_id  uuid not null references public.school_users(id) on delete cascade,
  action          text not null,        -- view | create | update | delete | approve | export
  resource        text not null,        -- student | attendance | marks | fee | exam | salary | ...
  scope_type      text not null,        -- school | branch | class | section | subject | student | self
  scope_id        uuid,                 -- references the relevant entity by id (null for 'school' scope)
  granted_by      uuid,                 -- references auth.users(id)
  granted_at      timestamptz not null default now(),
  expires_at      timestamptz,
  metadata        jsonb not null default '{}'::jsonb,
  unique (school_user_id, action, resource, scope_type, scope_id)
);

create index if not exists idx_user_permissions_school_user on public.user_permissions(school_user_id);
create index if not exists idx_user_permissions_resource on public.user_permissions(resource, action);

-- Audit log ----------------------------------------------------------
create table if not exists public.audit_logs (
  id             uuid primary key default gen_random_uuid(),
  school_id      uuid references public.schools(id) on delete cascade,
  user_id        uuid,
  action         text not null,
  resource_type  text not null,
  resource_id    uuid,
  meta           jsonb not null default '{}'::jsonb,
  ip             inet,
  user_agent     text,
  created_at     timestamptz not null default now()
);

create index if not exists idx_audit_logs_school_created on public.audit_logs(school_id, created_at desc);
create index if not exists idx_audit_logs_resource on public.audit_logs(resource_type, resource_id);
create index if not exists idx_audit_logs_user on public.audit_logs(user_id);
