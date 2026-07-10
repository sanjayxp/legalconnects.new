-- ============================================================
-- LegalConnects — Supabase Setup SQL  (v2, fixed & re-runnable)
-- Run in: Supabase Dashboard → SQL Editor → New query → paste → Run
-- Safe to run again even if you ran the old version — it
-- replaces everything cleanly.
-- ============================================================

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade not null primary key,
  full_name   text,
  role        text not null default 'client'
                check (role in ('client', 'advocate', 'admin')),
  phone       text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

alter table public.profiles enable row level security;

-- 2. ADMIN CHECK FUNCTION
--    (security definer = runs with elevated rights, so checking
--    "is this user an admin?" doesn't re-trigger the row rules
--    on profiles — this avoids the infinite-recursion error)
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 3. ROW-LEVEL SECURITY POLICIES (dropped & recreated cleanly)
drop policy if exists "users_read_own_profile"   on public.profiles;
drop policy if exists "users_update_own_profile" on public.profiles;
drop policy if exists "admins_read_all_profiles" on public.profiles;

create policy "users_read_own_profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "users_update_own_profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "admins_read_all_profiles"
  on public.profiles for select
  using ( public.is_admin() );

-- 4. AUTO-CREATE PROFILE ON SIGNUP
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce(new.raw_user_meta_data ->> 'role', 'client')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. UPDATED_AT AUTO-STAMP
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- DONE. After running:
--   1. Register a user in the app.
--   2. Supabase → Table Editor → profiles — you'll see the row.
--   3. Make yourself admin: edit your row's role cell → 'admin'.
-- ============================================================
