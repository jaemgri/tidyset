-- Datasets: one row per uploaded CSV
create table public.datasets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  column_names jsonb not null,
  row_data jsonb not null,
  row_count integer not null,
  created_at timestamptz not null default now()
);

-- Rules: belong to a dataset
create table public.rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  dataset_id uuid not null references public.datasets(id) on delete cascade,
  type text not null check (type in ('not_empty', 'unique', 'email', 'range')),
  column_name text not null,
  params jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index on public.datasets (user_id);
create index on public.rules (dataset_id);

-- Row-level security
alter table public.datasets enable row level security;
alter table public.rules enable row level security;

create policy "Users manage their own datasets"
  on public.datasets for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage their own rules"
  on public.rules for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.datasets d
      where d.id = dataset_id and d.user_id = (select auth.uid())
    )
  );

-- Table access for logged-in users (RLS still limits them to their own rows)
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.datasets to authenticated;
grant select, insert, update, delete on public.rules to authenticated;
