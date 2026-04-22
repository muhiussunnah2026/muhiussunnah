-- =====================================================================
-- 0025 — Platform-owned school flag
-- =====================================================================
-- Some schools on the platform belong to the platform owner (that's
-- you, Mustaqeem). Those schools should:
--   • get whatever plan access we want (usually Growth)
--   • never count towards platform revenue analytics
--   • never get marked past_due / canceled due to expiry
--
-- A tiny boolean flag on schools is the simplest way to express that.
-- =====================================================================

alter table public.schools
  add column if not exists is_platform_owned boolean not null default false;

create index if not exists idx_schools_platform_owned
  on public.schools(is_platform_owned)
  where is_platform_owned = true;
