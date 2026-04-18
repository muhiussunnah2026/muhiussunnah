-- =====================================================================
-- 0016 — Phase 6 helpers (library copy counters, realtime enabling)
-- =====================================================================

-- Library book copy counters (atomic) ---------------------------------
create or replace function public.decrement_book_copies(p_book_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.library_books
  set copies_available = greatest(0, copies_available - 1)
  where id = p_book_id;
$$;

create or replace function public.increment_book_copies(p_book_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.library_books
  set copies_available = least(copies_total, copies_available + 1)
  where id = p_book_id;
$$;

grant execute on function public.decrement_book_copies(uuid) to authenticated;
grant execute on function public.increment_book_copies(uuid) to authenticated;

-- Enable realtime on tenant tables (Phase 6 live dashboard) ----------
-- Wrap each in a DO block so re-runs don't fail if already added.
do $$
begin
  begin
    alter publication supabase_realtime add table public.payments;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.students;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.admission_inquiries;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.attendance;
  exception when duplicate_object then null;
  end;
end $$;
