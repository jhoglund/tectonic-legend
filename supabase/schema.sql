-- Tectonic — Supabase schema (ADR-0013, docs/accounts-plan.md §2).
--
-- Apply this to the Supabase project once, via the SQL editor in the
-- dashboard or `supabase db push` with the CLI. It is idempotent —
-- safe to re-run.
--
-- One table: `profiles`. Identity lives in Supabase's managed
-- `auth.users`; this holds the player's game state as a single jsonb
-- blob (the PlayerProfile shape from src/lib/profile.ts), kept whole so
-- the table stays schema-stable as the profile evolves.

create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  data       jsonb       not null,
  updated_at timestamptz not null default now()
);

-- Row-Level Security is the security boundary. The anon key shipped in
-- the client grants nothing these policies don't — every row is
-- reachable only by its owner (auth.uid() = id).
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No delete policy: account/profile deletion is deliberately not a
-- client-side action. A profile row is removed only when the auth user
-- is deleted (on delete cascade above).

-- Keep updated_at honest server-side, so last-write-wins sync cannot be
-- skewed by a client clock. The client also carries updatedAt inside
-- the blob; this trigger stamps the column the sync layer compares on.
create or replace function public.touch_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before insert or update on public.profiles
  for each row execute function public.touch_profiles_updated_at();
