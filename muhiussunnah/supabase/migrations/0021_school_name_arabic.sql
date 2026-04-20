-- 0021_school_name_arabic.sql
-- Madrasas almost always have an Arabic-script institution name alongside
-- the Bangla one. Adding that to schools so it can appear on certificates,
-- marksheets, invoices, and optionally the admin header.

alter table public.schools
  add column if not exists name_ar text;

comment on column public.schools.name_ar is
  'Arabic script institution name. Optional. Used on certificates / marksheets and available as a header display field.';
