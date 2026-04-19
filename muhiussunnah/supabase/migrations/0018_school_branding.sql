-- 0018_school_branding.sql
-- Adds branding fields to the schools table:
--   • logo_url              — URL to the institution's logo (shown in header, receipts, marksheets)
--   • display_name_locale   — which name variant to display in UI chrome (bn | en)

alter table public.schools
  add column if not exists logo_url text,
  add column if not exists display_name_locale varchar(2) default 'bn'
    check (display_name_locale in ('bn', 'en'));

comment on column public.schools.logo_url is
  'URL to the institution logo used in header, certificates, invoices, marksheets.';
comment on column public.schools.display_name_locale is
  'Which name variant (bn or en) to display as the primary school name in UI chrome.';
