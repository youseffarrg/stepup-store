-- STEPUP admin dashboard security setup
-- Run after creating your first manager user in Supabase Authentication > Users.
create table if not exists public.stepup_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.stepup_admins enable row level security;

-- Admins can only read their own role row. No public role assignment policy exists.
drop policy if exists "Admins can read own role" on public.stepup_admins;
create policy "Admins can read own role"
on public.stepup_admins for select
to authenticated
using (user_id = auth.uid());

alter table public.customer_leads enable row level security;
drop policy if exists "Admins can read STEPUP leads" on public.customer_leads;
create policy "Admins can read STEPUP leads"
on public.customer_leads for select
to authenticated
using (
  exists (select 1 from public.stepup_admins a where a.user_id = auth.uid())
);

-- IMPORTANT: after creating the manager in Authentication > Users, copy their UUID
-- and run this separately, replacing UUID_HERE:
-- insert into public.stepup_admins (user_id) values ('UUID_HERE');
