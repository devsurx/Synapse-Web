-- Run this in the Supabase SQL editor to set up Synapse storage.
-- Tables use a single shared anonymous user until real auth is added.

create table if not exists public.users (
  id bigint generated always as identity primary key,
  name text not null default 'Learner',
  focus_minutes bigint not null default 0,
  sessions bigint not null default 0,
  shadow_color text not null default '#a3e635',
  created_at timestamptz not null default now()
);

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

alter table public.users enable row level security;
alter table public.sessions_log enable row level security;
alter table public.squads enable row level security;
alter table public.squad_members enable row level security;

drop policy if exists "public read users" on public.users;
create policy "public read users" on public.users for select using (true);

drop policy if exists "public write users" on public.users;
create policy "public write users" on public.users for all using (true) with check (true);

drop policy if exists "public read sessions" on public.sessions_log;
create policy "public read sessions" on public.sessions_log for select using (true);

drop policy if exists "public write sessions" on public.sessions_log;
create policy "public write sessions" on public.sessions_log for all using (true) with check (true);

drop policy if exists "public read squads" on public.squads;
create policy "public read squads" on public.squads for select using (true);

drop policy if exists "public write squads" on public.squads;
create policy "public write squads" on public.squads for all using (true) with check (true);

drop policy if exists "public read members" on public.squad_members;
create policy "public read members" on public.squad_members for select using (true);

drop policy if exists "public write members" on public.squad_members;
create policy "public write members" on public.squad_members for all using (true) with check (true);