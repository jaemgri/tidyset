create table public.check_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  dataset_id uuid not null references public.datasets(id) on delete cascade,
  score integer not null check (score between 0 and 100),
  clean_rows integer not null,
  total_rows integer not null,
  rule_count integer not null,
  rule_results jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index on public.check_runs (dataset_id, created_at);

alter table public.check_runs enable row level security;

create policy "Users manage their own check runs"
  on public.check_runs for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.datasets d
      where d.id = dataset_id and d.user_id = (select auth.uid())
    )
  );

grant select, insert, delete on public.check_runs to authenticated;
