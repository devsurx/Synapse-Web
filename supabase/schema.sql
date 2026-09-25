-- Run this in the Supabase SQL editor to set up Synapse storage.
-- Safe to re-run: tables are created if missing, columns added if missing,
-- and policies are dropped + recreated.
--
-- Data model:
-- * Guests (signed out) share open access, but ONLY to rows with auth_id IS NULL.
-- * Signed-in users own rows where users.auth_id = their auth id — private to them.
-- * The /admin dashboard reads everything server-side with the service-role key
--   (which bypasses RLS), gated by ADMIN_KEY.

create table if not exists public.users (
  id bigint generated always as identity primary key,
  name text not null default 'Learner',
  focus_minutes bigint not null default 0,
  sessions bigint not null default 0,
  shadow_color text not null default '#a3e635',
  created_at timestamptz not null default now()
);

-- Link a device row to a Supabase Auth account (set on first sign-in).
alter table public.users add column if not exists auth_id uuid unique;

create table if not exists public.sessions_log (
  id bigint generated always as identity primary key,
  user_id bigint not null references public.users (id) on delete cascade,
  minutes integer not null,
  completed_at timestamptz not null default now()
);

create table if not exists public.squads (
  id bigint generated always as identity primary key,
  code text not null unique,
  name text not null,
  owner_id bigint not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.squad_members (
  squad_id bigint not null references public.squads (id) on delete cascade,
  user_id bigint not null references public.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (squad_id, user_id)
);

-- Focus planner blocks (one row per block, replaced on each plan save).
create table if not exists public.planner_blocks (
  id bigint generated always as identity primary key,
  user_id bigint not null references public.users (id) on delete cascade,
  title text not null,
  duration_minutes integer not null default 25,
  note text not null default '',
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.sessions_log enable row level security;
alter table public.squads enable row level security;
alter table public.squad_members enable row level security;
alter table public.planner_blocks enable row level security;

-- Clean up the old fully-open policies from before accounts existed.
drop policy if exists "public read users" on public.users;
drop policy if exists "public write users" on public.users;
drop policy if exists "public read sessions" on public.sessions_log;
drop policy if exists "public write sessions" on public.sessions_log;
drop policy if exists "public read planner_blocks" on public.planner_blocks;
drop policy if exists "public write planner_blocks" on public.planner_blocks;

-- ── users ────────────────────────────────────────────────────────────────
-- Guests: full access to unclaimed device rows only.
drop policy if exists "guest read device users" on public.users;
create policy "guest read device users" on public.users for select using (auth_id is null);

drop policy if exists "guest insert device users" on public.users;
create policy "guest insert device users" on public.users for insert with check (auth_id is null);

drop policy if exists "guest update device users" on public.users;
create policy "guest update device users" on public.users
  for update using (auth_id is null) with check (auth_id is null);

-- Owners: full access to their own rows.
drop policy if exists "owner read own user" on public.users;
create policy "owner read own user" on public.users
  for select to authenticated using (auth.uid() = auth_id);

drop policy if exists "owner insert own user" on public.users;
create policy "owner insert own user" on public.users
  for insert to authenticated with check (auth.uid() = auth_id);

drop policy if exists "owner update own user" on public.users;
create policy "owner update own user" on public.users
  for update to authenticated using (auth.uid() = auth_id) with check (auth.uid() = auth_id);

-- Claiming: a signed-in user may link one unclaimed device row to themselves
-- by setting its auth_id to their own id.
drop policy if exists "claim device user" on public.users;
create policy "claim device user" on public.users
  for update to authenticated using (auth_id is null) with check (auth.uid() = auth_id);

-- ── sessions_log ─────────────────────────────────────────────────────────
-- A row is visible/writable when its parent user row is an unclaimed device
-- row, or is owned by the caller.
drop policy if exists "read own sessions" on public.sessions_log;
create policy "read own sessions" on public.sessions_log for select using (
  exists (
    select 1 from public.users u
    where u.id = sessions_log.user_id
      and (u.auth_id is null or u.auth_id = auth.uid())
  )
);

drop policy if exists "insert own sessions" on public.sessions_log;
create policy "insert own sessions" on public.sessions_log for insert with check (
  exists (
    select 1 from public.users u
    where u.id = sessions_log.user_id
      and (u.auth_id is null or u.auth_id = auth.uid())
  )
);

-- ── planner_blocks ───────────────────────────────────────────────────────
drop policy if exists "read own planner blocks" on public.planner_blocks;
create policy "read own planner blocks" on public.planner_blocks for select using (
  exists (
    select 1 from public.users u
    where u.id = planner_blocks.user_id
      and (u.auth_id is null or u.auth_id = auth.uid())
  )
);

drop policy if exists "insert own planner blocks" on public.planner_blocks;
create policy "insert own planner blocks" on public.planner_blocks for insert with check (
  exists (
    select 1 from public.users u
    where u.id = planner_blocks.user_id
      and (u.auth_id is null or u.auth_id = auth.uid())
  )
);

-- Plan re-saves replace all of a user's blocks, so owners and guests need
-- delete on their own rows.
drop policy if exists "delete own planner blocks" on public.planner_blocks;
create policy "delete own planner blocks" on public.planner_blocks for delete using (
  exists (
    select 1 from public.users u
    where u.id = planner_blocks.user_id
      and (u.auth_id is null or u.auth_id = auth.uid())
  )
);

-- ── squads (unchanged, still open — out of scope for accounts) ───────────
drop policy if exists "public read squads" on public.squads;
create policy "public read squads" on public.squads for select using (true);

drop policy if exists "public write squads" on public.squads;
create policy "public write squads" on public.squads for all using (true) with check (true);

drop policy if exists "public read members" on public.squad_members;
create policy "public read members" on public.squad_members for select using (true);

drop policy if exists "public write members" on public.squad_members;
create policy "public write members" on public.squad_members for all using (true) with check (true);
