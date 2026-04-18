-- =====================================================================
-- Shikkha Platform — platform-level seed data
--
-- This runs after migrations. It seeds PLATFORM tables (subscription
-- plans). Per-tenant seeding (fee heads, expense heads, etc.) happens
-- in the `seed_new_school()` server function (see scripts/seed.ts),
-- not here, because we need a school_id.
--
-- Ref: PROJECT_PLAN §6 (default seed data), §10 (subscription plans)
-- =====================================================================

insert into public.subscription_plans (code, name_bn, name_en, price_bdt, max_students, max_branches, max_sms, max_storage_mb, features, display_order)
values
  ('free_trial',   'ফ্রি ট্রায়াল',     'Free Trial',    0,      50,    1,    100,   500,   '{"core":true}'::jsonb,                                                                                                1),
  ('basic',        'বেসিক',           'Basic',         1500,   300,   1,    1000,  5000,  '{"core":true,"parent_portal":true,"sms":true}'::jsonb,                                                                2),
  ('pro',          'প্রো',             'Pro',           3500,   1000,  2,    5000,  20000, '{"core":true,"parent_portal":true,"sms":true,"online_payments":true,"whatsapp":true,"ai_reports":true}'::jsonb,      3),
  ('madrasa_pro',  'মাদ্রাসা প্রো',     'Madrasa Pro',   3500,   1000,  2,    5000,  20000, '{"core":true,"parent_portal":true,"sms":true,"online_payments":true,"whatsapp":true,"madrasa":true,"hijri":true}'::jsonb, 4),
  ('enterprise',   'এন্টারপ্রাইজ',      'Enterprise',    0,      null,  null, null,  null,  '{"all":true,"biometric":true,"gps":true,"custom_domain":true,"api":true,"sla":true}'::jsonb,                         5)
on conflict (code) do update set
  name_bn       = excluded.name_bn,
  name_en       = excluded.name_en,
  price_bdt     = excluded.price_bdt,
  max_students  = excluded.max_students,
  max_branches  = excluded.max_branches,
  max_sms       = excluded.max_sms,
  max_storage_mb = excluded.max_storage_mb,
  features      = excluded.features,
  display_order = excluded.display_order,
  updated_at    = now();
