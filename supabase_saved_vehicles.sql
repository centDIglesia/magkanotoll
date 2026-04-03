-- ─────────────────────────────────────────────
-- saved_vehicles table
-- ─────────────────────────────────────────────

create table public.saved_vehicles (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  nickname        text not null,
  year            text not null,
  make            text not null,
  model           text not null,
  trim            text not null default '',
  vehicle_class   smallint not null default 1 check (vehicle_class in (1, 2, 3)),
  fuel_type       text not null default '',
  engine_cc       text not null default '',
  created_at      timestamptz not null default now()
);

-- index for fast per-user queries
create index saved_vehicles_user_id_idx on public.saved_vehicles(user_id);

-- enable RLS
alter table public.saved_vehicles enable row level security;

-- users can only see their own vehicles
create policy "select own vehicles"
  on public.saved_vehicles for select
  using (auth.uid() = user_id);

-- users can only insert their own vehicles
create policy "insert own vehicles"
  on public.saved_vehicles for insert
  with check (auth.uid() = user_id);

-- users can only update their own vehicles
create policy "update own vehicles"
  on public.saved_vehicles for update
  using (auth.uid() = user_id);

-- users can only delete their own vehicles
create policy "delete own vehicles"
  on public.saved_vehicles for delete
  using (auth.uid() = user_id);
