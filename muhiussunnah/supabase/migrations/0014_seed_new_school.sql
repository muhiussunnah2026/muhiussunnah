-- =====================================================================
-- 0014 — seed_new_school(): per-tenant default data
--
-- Called whenever a new school is registered. Seeds:
--   • 30 default fee heads (PROJECT_PLAN §6.1 — Bornomala-compatible)
--   • 24 default expense heads (§6.2)
--   • 8 default cash receive heads (§6.3)
--   • Bangladesh standard GPA 5.0 grading scale (§6.4)
--   • Primary school branch
--   • Kitab stages (for madrasa tenants — §6.5)
--
-- Usage:
--   select public.seed_new_school('<school_id>'::uuid);
--
-- Idempotent: running twice will not duplicate rows (uses unique
-- constraints on (school_id, name_bn) for heads).
-- =====================================================================

create or replace function public.seed_new_school(target_school uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_is_madrasa  boolean;
begin
  if not exists (select 1 from public.schools where id = target_school) then
    raise exception 'School % does not exist', target_school;
  end if;

  select type in ('madrasa', 'both') into v_is_madrasa
  from public.schools
  where id = target_school;

  -- Primary branch (if none) --------------------------------------
  insert into public.school_branches (school_id, name, is_primary)
  select target_school, 'প্রধান শাখা', true
  where not exists (
    select 1 from public.school_branches where school_id = target_school and is_primary = true
  );

  -- Fee heads (30 — matches Bornomala's 27 + 3 Shikkha extras) ---
  insert into public.fee_heads (school_id, name_bn, name_en, type, default_amount, is_recurring, frequency, display_order)
  values
    (target_school, 'টিউশন ফি',                 'Tuition Fee',            'general',   0, true,  'monthly',    10),
    (target_school, 'টিউশন ফি বকেয়া',             'Tuition Fee Due',        'general',   0, false, 'one_time',  11),
    (target_school, 'ভর্তি ফরম',                 'Admission Form',         'admission', 0, false, 'one_time',  12),
    (target_school, 'ভর্তি ফি',                   'Admission Fee',          'admission', 0, false, 'one_time',  13),
    (target_school, 'ভর্তি ফি বকেয়া',             'Admission Fee Due',      'admission', 0, false, 'one_time',  14),
    (target_school, 'সেশন ফি',                   'Session Fee',            'session',   0, false, 'annual',    15),
    (target_school, 'সেশন ফি বকেয়া',             'Session Fee Due',        'session',   0, false, 'one_time',  16),
    (target_school, 'রেজিস্ট্রেশন ফি',             'Registration Fee',       'session',   0, false, 'one_time',  17),
    (target_school, 'প্যাকেজ ফি',                 'Package Fee',            'general',   0, false, 'annual',    18),
    (target_school, 'পরীক্ষার ফি — ১ম সাময়িক',    'Exam Fee — 1st Term',    'exam',      0, false, 'one_time',  19),
    (target_school, 'পরীক্ষার ফি — ২য় সাময়িক',    'Exam Fee — 2nd Term',    'exam',      0, false, 'one_time',  20),
    (target_school, 'পরীক্ষার ফি — ৩য় সাময়িক',    'Exam Fee — 3rd Term',    'exam',      0, false, 'one_time',  21),
    (target_school, 'বার্ষিক পরীক্ষার ফি',          'Exam Fee — Final',       'exam',      0, false, 'annual',    22),
    (target_school, 'যাতায়াত ফি',                 'Transport Fee',          'transport', 0, true,  'monthly',   23),
    (target_school, 'জরিমানা',                    'Fine',                   'other',     0, false, 'one_time',  24),
    (target_school, 'আইডি কার্ড ফি',              'ID Card Fee',            'general',   0, false, 'one_time',  25),
    (target_school, 'অনলাইন চার্জ',               'Online Charge',          'other',     0, false, 'one_time',  26),
    (target_school, 'খাবার খরচ',                  'Food Expense',           'canteen',   0, true,  'monthly',   27),
    (target_school, 'প্রশংসাপত্র ফি',              'Testimonial Fee',        'other',     0, false, 'one_time',  28),
    (target_school, 'ক্রীড়া ফি',                   'Sports Fee',             'general',   0, false, 'annual',    29),
    (target_school, 'কম্পিউটার ল্যাব ফি',          'Computer Lab Fee',       'general',   0, true,  'monthly',   30),
    (target_school, 'ব্যবহারিক ফি',               'Practical Fee',          'general',   0, false, 'annual',    31),
    (target_school, 'ট্রান্সফার সার্টিফিকেট ফি',     'TC Fee',                 'other',     0, false, 'one_time',  32),
    (target_school, 'সিলেবাস ফি',                 'Syllabus Fee',           'general',   0, false, 'annual',    33),
    (target_school, 'সার্টিফিকেট ফি',              'Certificate Fee',        'other',     0, false, 'one_time',  34),
    (target_school, 'বই ফি',                      'Books Fee',              'general',   0, false, 'annual',    35),
    (target_school, 'নোট বই ফি',                  'Note Book Fee',          'general',   0, false, 'annual',    36),
    (target_school, 'স্টেশনারি ফি',                'Stationeries Fee',       'general',   0, false, 'annual',    37),
    (target_school, 'ডেভেলপমেন্ট ফি',              'Development Fee',        'general',   0, false, 'annual',    38),
    (target_school, 'ড্রেস ফি',                    'Dress Fee',              'general',   0, false, 'annual',    39)
  on conflict (school_id, name_bn) do nothing;

  -- Expense heads (24 — PROJECT_PLAN §6.2) -------------------------
  insert into public.expense_heads (school_id, name_bn, name_en, category, display_order)
  values
    (target_school, 'অ্যাডমিন পার্সোনাল',         'Admin Personal',         'general',      10),
    (target_school, 'অগ্রিম পরিশোধ',              'Advance Payment',        'general',      11),
    (target_school, 'সম্পদ',                       'Asset',                  'asset',        12),
    (target_school, 'ব্যাংক জমা',                 'Bank Deposit',           'general',      13),
    (target_school, 'বোনাস পরিশোধ',              'Bonus Pay',              'salary',       14),
    (target_school, 'ভাউচার বিল',                 'Voucher Bill',           'general',      15),
    (target_school, 'বিদ্যুৎ বিল',                'Electricity Bill',       'utility',      16),
    (target_school, 'আপ্যায়ন',                    'Entertainment',          'event',        17),
    (target_school, 'সাধারণ ক্রয়',                'General Purchase',       'purchase',     18),
    (target_school, 'সম্মানী পরিশোধ',             'Honorarium Pay',         'salary',       19),
    (target_school, 'ইন্টারনেট বিল',              'Internet Bill',          'utility',      20),
    (target_school, 'বিনিয়োগ রিটার্ন',            'Investment Return',      'general',      21),
    (target_school, 'শ্রমিক বিল',                 'Labour Bill',            'general',      22),
    (target_school, 'ঋণ পরিশোধ',                 'Loan Paid',              'loan',         23),
    (target_school, 'অফিস খরচ',                   'Office Expense',         'general',      24),
    (target_school, 'অফিস ভাড়া',                  'Office Rent',            'utility',      25),
    (target_school, 'ওভারটাইম বিল',               'Overtime Bill',          'salary',       26),
    (target_school, 'পণ্য ক্রয়',                  'Product Purchase',       'purchase',     27),
    (target_school, 'বেতন পরিশোধ',                'Salary Pay',             'salary',       28),
    (target_school, 'সফটওয়্যার বিল',              'Software Bill',          'utility',      29),
    (target_school, 'স্টেশনারি',                   'Stationery',             'purchase',     30),
    (target_school, 'মোট বেতন',                    'Total Salary',           'salary',       31),
    (target_school, 'যানবাহন',                     'Transport',              'travel',       32),
    (target_school, 'অন্যান্য',                    'Others',                 'misc',         33)
  on conflict (school_id, name_bn) do nothing;

  -- Cash receive heads (8 — PROJECT_PLAN §6.3) ---------------------
  insert into public.cash_receive_heads (school_id, name_bn, name_en, display_order)
  values
    (target_school, 'অ্যাডমিন গ্রহণ',             'Admin Receive',          10),
    (target_school, 'বস পার্সোনাল',               'Boss Personal',          11),
    (target_school, 'ব্যাংক উত্তোলন',             'Bank Withdraw',          12),
    (target_school, 'ঋণ গ্রহণ',                   'Loan Receive',           13),
    (target_school, 'ঋণ ফেরত',                    'Loan Return',            14),
    (target_school, 'প্রারম্ভিক জের',              'Opening Balance',        15),
    (target_school, 'প্রজেক্ট বিনিয়োগ',           'Project Investment',     16),
    (target_school, 'অন্যান্য',                   'Others',                 17)
  on conflict (school_id, name_bn) do nothing;

  -- Grading scale (Bangladesh GPA 5.0 — PROJECT_PLAN §6.4) ---------
  insert into public.grading_scales (school_id, name, is_default, rules)
  values (
    target_school,
    'Bangladesh GPA 5.0',
    true,
    '[
      {"grade":"A+","min":80,"max":100,"gpa":5.00,"remark":"Outstanding"},
      {"grade":"A","min":70,"max":79.99,"gpa":4.00,"remark":"Excellent"},
      {"grade":"A-","min":60,"max":69.99,"gpa":3.50,"remark":"Very Good"},
      {"grade":"B","min":50,"max":59.99,"gpa":3.00,"remark":"Good"},
      {"grade":"C","min":40,"max":49.99,"gpa":2.00,"remark":"Satisfactory"},
      {"grade":"D","min":33,"max":39.99,"gpa":1.00,"remark":"Pass"},
      {"grade":"F","min":0,"max":32.99,"gpa":0.00,"remark":"Fail"}
    ]'::jsonb
  )
  on conflict (school_id, name) do nothing;

  -- Kitab stages for madrasa tenants (PROJECT_PLAN §6.5) -----------
  if v_is_madrasa then
    insert into public.kitab_curriculum (school_id, stage, kitab_name, display_order)
    values
      (target_school, 'ibtedaiyyah',        'ইবতিদাইয়্যাহ (প্রাথমিক)',   10),
      (target_school, 'mutawassita',        'মুতাওয়াসসিতাহ (মাধ্যমিক)',  20),
      (target_school, 'sanaweeya_aamma',    'সানাবিয়্যাহ আম্মা',          30),
      (target_school, 'sanaweeya_khassa',   'সানাবিয়্যাহ খাসসা',          40),
      (target_school, 'fazilat',            'ফযিলাত',                     50),
      (target_school, 'kamil',              'কামিল',                      60)
    on conflict (school_id, stage, kitab_name) do nothing;
  end if;
end;
$$;

comment on function public.seed_new_school(uuid) is
  'Seed per-tenant defaults: primary branch, 30 fee heads, 24 expense heads, 8 cash receive heads, GPA 5.0 scale, kitab stages (madrasa). Idempotent.';

grant execute on function public.seed_new_school(uuid) to authenticated, service_role;
