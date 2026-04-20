-- 0020_header_display_fields.sql
-- Multi-select "what appears in the admin header" preference. Admins can
-- compose their header out of any subset of name_bn / name_en / address /
-- phone / email / website — stored as a comma-separated list so no array
-- type gymnastics are needed.

alter table public.schools
  add column if not exists header_display_fields text default 'name_bn';

comment on column public.schools.header_display_fields is
  'Comma-separated list of fields to show in the admin header. Allowed values: name_bn, name_en, address, phone, email, website. Order matters: first value gets the big H1, rest render as the subtitle.';
