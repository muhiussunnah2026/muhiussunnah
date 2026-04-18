-- =====================================================================
-- 0001 — Extensions, enums, helper functions (RLS scaffolding)
-- Shikkha Platform — multi-tenant school/madrasa management
-- Ref: PROJECT_PLAN §3 (permissions), §5.1 (tenant)
-- =====================================================================

-- Extensions -----------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- Role enum (PROJECT_PLAN §3.1) ----------------------------------------
do $$ begin
  create type public.user_role as enum (
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'VICE_PRINCIPAL',
    'ACCOUNTANT',
    'BRANCH_ADMIN',
    'CLASS_TEACHER',
    'SUBJECT_TEACHER',
    'MADRASA_USTADH',
    'LIBRARIAN',
    'TRANSPORT_MANAGER',
    'HOSTEL_WARDEN',
    'CANTEEN_MANAGER',
    'COUNSELOR',
    'STUDENT',
    'PARENT'
  );
exception when duplicate_object then null; end $$;

-- Tenant/school type
do $$ begin
  create type public.school_type as enum ('school', 'madrasa', 'both');
exception when duplicate_object then null; end $$;

-- Class stream (mixed school + madrasa)
do $$ begin
  create type public.class_stream as enum (
    'general', 'hifz', 'kitab', 'nazera',
    'science', 'commerce', 'arts'
  );
exception when duplicate_object then null; end $$;

-- Subscription status
do $$ begin
  create type public.subscription_status as enum (
    'trial', 'active', 'past_due', 'canceled', 'suspended'
  );
exception when duplicate_object then null; end $$;

-- Student status
do $$ begin
  create type public.student_status as enum (
    'active', 'transferred', 'passed_out', 'dropped', 'suspended'
  );
exception when duplicate_object then null; end $$;

-- Generic entry/status enums used across tables
do $$ begin
  create type public.attendance_status as enum ('present', 'absent', 'late', 'leave', 'holiday');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.sabaq_quality as enum ('excellent', 'good', 'average', 'weak');
exception when duplicate_object then null; end $$;

-- Helper: updated_at trigger function ----------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Helper: current user's school memberships (used by RLS policies)
-- Returns rows from school_users for the authenticated user.
-- NOTE: school_users is created in the next migration; this function
-- is left for reference. The actual security-definer helpers live in
-- 0013_rls.sql after all tables exist.

comment on function public.set_updated_at() is
  'Trigger function to maintain updated_at columns on tenant tables.';
