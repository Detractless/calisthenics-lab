-- Calisthenics Movement Tracking Library
-- Schema for anonymous exercise landmark submissions

create table if not exists public.recordings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  exercise text not null,
  duration_ms integer,
  reps_counted integer default 0,
  reps_valid integer default 0,
  reps_review integer default 0,
  reps_partial integer default 0,
  landmarks_csv text not null
);

-- Enable Row Level Security
alter table public.recordings enable row level security;

-- Allow anonymous users (visitors) to insert recordings only
create policy "Allow anonymous inserts"
  on public.recordings
  for insert
  to anon
  with check (true);

-- Allow authenticated project owners full access to manage and review
create policy "Allow authenticated full access"
  on public.recordings
  for all
  to authenticated
  using (true)
  with check (true);
