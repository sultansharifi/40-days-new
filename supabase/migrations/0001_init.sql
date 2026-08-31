-- =========================================================================
-- Report Management System (مدیریت آموزش) - initial schema
-- =========================================================================

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
do $$ begin
  create type public.user_role as enum ('admin', 'manager', 'reporter');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.report_type as enum ('روزانه', 'هفتگی', 'ماهانه', 'فعالیت', 'بازدید');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.report_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- users  (mirrors auth.users, one row per profile)
-- ---------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  role public.user_role not null default 'reporter',
  province text,
  district text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.users is 'Profile + role for every authenticated user.';

-- ---------------------------------------------------------------------
-- reports
-- ---------------------------------------------------------------------
create sequence if not exists public.report_number_seq;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  report_number text not null unique,
  created_by uuid not null references public.users (id) on delete restrict,
  reporter_name text not null default '',
  report_type public.report_type not null,
  title text not null,
  province text not null,
  district text not null,
  center_name text not null,
  report_date date not null default current_date,
  objective text,
  activity_description text,
  location text,
  start_date date,
  end_date date,
  status public.report_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reports_status_idx on public.reports (status);
create index if not exists reports_created_at_idx on public.reports (created_at desc);
create index if not exists reports_created_by_idx on public.reports (created_by);
create index if not exists reports_type_idx on public.reports (report_type);
create index if not exists reports_province_district_idx on public.reports (province, district);
create index if not exists reports_title_trgm_idx on public.reports using gin (title gin_trgm_ops);
create index if not exists reports_center_trgm_idx on public.reports using gin (center_name gin_trgm_ops);
create index if not exists reports_number_trgm_idx on public.reports using gin (report_number gin_trgm_ops);

-- ---------------------------------------------------------------------
-- participants (1:1 with report)
-- ---------------------------------------------------------------------
create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null unique references public.reports (id) on delete cascade,
  male_under18 integer not null default 0 check (male_under18 >= 0),
  female_under18 integer not null default 0 check (female_under18 >= 0),
  male_over18 integer not null default 0 check (male_over18 >= 0),
  female_over18 integer not null default 0 check (female_over18 >= 0),
  total integer generated always as
    (male_under18 + female_under18 + male_over18 + female_over18) stored
);

-- ---------------------------------------------------------------------
-- results (1:1 with report)
-- ---------------------------------------------------------------------
create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null unique references public.reports (id) on delete cascade,
  achievement text,
  challenges text,
  recommendations text
);

-- ---------------------------------------------------------------------
-- report_attachments
-- ---------------------------------------------------------------------
create table if not exists public.report_attachments (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports (id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_type text not null,
  file_size bigint,
  uploaded_by uuid references public.users (id),
  created_at timestamptz not null default now()
);

create index if not exists attachments_report_idx on public.report_attachments (report_id);

-- ---------------------------------------------------------------------
-- helper: current user's role (security definer avoids recursive RLS)
-- ---------------------------------------------------------------------
create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.users where id = auth.uid();
$$;

create or replace function public.is_admin_or_manager()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(public.current_user_role() in ('admin', 'manager'), false);
$$;

-- ---------------------------------------------------------------------
-- trigger: create public.users row whenever a new auth.users row appears
-- ---------------------------------------------------------------------
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'reporter')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ---------------------------------------------------------------------
-- trigger: auto report_number + updated_at
-- ---------------------------------------------------------------------
create or replace function public.set_report_number()
returns trigger
language plpgsql
as $$
begin
  if new.report_number is null or new.report_number = '' then
    new.report_number := 'RPT-' || to_char(current_date, 'YYYY') || '-' ||
      lpad(nextval('public.report_number_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists reports_set_number on public.reports;
create trigger reports_set_number
  before insert on public.reports
  for each row execute function public.set_report_number();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists reports_set_updated_at on public.reports;
create trigger reports_set_updated_at
  before update on public.reports
  for each row execute function public.set_updated_at();

-- =========================================================================
-- Row Level Security
-- =========================================================================
alter table public.users enable row level security;
alter table public.reports enable row level security;
alter table public.participants enable row level security;
alter table public.results enable row level security;
alter table public.report_attachments enable row level security;

-- ---- users ----
drop policy if exists users_select on public.users;
create policy users_select on public.users for select
  using (id = auth.uid() or public.is_admin_or_manager());

drop policy if exists users_update on public.users;
create policy users_update on public.users for update
  using (id = auth.uid() or public.current_user_role() = 'admin')
  with check (
    id = auth.uid() and public.current_user_role() is not distinct from role
    or public.current_user_role() = 'admin'
  );

drop policy if exists users_insert on public.users;
create policy users_insert on public.users for insert
  with check (public.current_user_role() = 'admin');

drop policy if exists users_delete on public.users;
create policy users_delete on public.users for delete
  using (public.current_user_role() = 'admin');

-- ---- reports ----
drop policy if exists reports_select on public.reports;
create policy reports_select on public.reports for select
  using (created_by = auth.uid() or public.is_admin_or_manager());

drop policy if exists reports_insert on public.reports;
create policy reports_insert on public.reports for insert
  with check (created_by = auth.uid());

drop policy if exists reports_update on public.reports;
create policy reports_update on public.reports for update
  using (
    (created_by = auth.uid() and status = 'pending')
    or public.is_admin_or_manager()
  );

drop policy if exists reports_delete on public.reports;
create policy reports_delete on public.reports for delete
  using (public.current_user_role() = 'admin');

-- ---- participants ----
drop policy if exists participants_select on public.participants;
create policy participants_select on public.participants for select
  using (
    exists (
      select 1 from public.reports r
      where r.id = report_id
        and (r.created_by = auth.uid() or public.is_admin_or_manager())
    )
  );

drop policy if exists participants_write on public.participants;
create policy participants_write on public.participants for all
  using (
    exists (
      select 1 from public.reports r
      where r.id = report_id
        and ((r.created_by = auth.uid() and r.status = 'pending') or public.is_admin_or_manager())
    )
  )
  with check (
    exists (
      select 1 from public.reports r
      where r.id = report_id
        and ((r.created_by = auth.uid() and r.status = 'pending') or public.is_admin_or_manager())
    )
  );

-- ---- results ----
drop policy if exists results_select on public.results;
create policy results_select on public.results for select
  using (
    exists (
      select 1 from public.reports r
      where r.id = report_id
        and (r.created_by = auth.uid() or public.is_admin_or_manager())
    )
  );

drop policy if exists results_write on public.results;
create policy results_write on public.results for all
  using (
    exists (
      select 1 from public.reports r
      where r.id = report_id
        and ((r.created_by = auth.uid() and r.status = 'pending') or public.is_admin_or_manager())
    )
  )
  with check (
    exists (
      select 1 from public.reports r
      where r.id = report_id
        and ((r.created_by = auth.uid() and r.status = 'pending') or public.is_admin_or_manager())
    )
  );

-- ---- report_attachments ----
drop policy if exists attachments_select on public.report_attachments;
create policy attachments_select on public.report_attachments for select
  using (
    exists (
      select 1 from public.reports r
      where r.id = report_id
        and (r.created_by = auth.uid() or public.is_admin_or_manager())
    )
  );

drop policy if exists attachments_insert on public.report_attachments;
create policy attachments_insert on public.report_attachments for insert
  with check (
    exists (
      select 1 from public.reports r
      where r.id = report_id
        and ((r.created_by = auth.uid() and r.status = 'pending') or public.is_admin_or_manager())
    )
  );

drop policy if exists attachments_delete on public.report_attachments;
create policy attachments_delete on public.report_attachments for delete
  using (
    exists (
      select 1 from public.reports r
      where r.id = report_id
        and ((r.created_by = auth.uid() and r.status = 'pending') or public.is_admin_or_manager())
    )
  );

-- =========================================================================
-- Storage bucket for attachments
-- =========================================================================
insert into storage.buckets (id, name, public)
values ('report-attachments', 'report-attachments', false)
on conflict (id) do nothing;

drop policy if exists "report-attachments read" on storage.objects;
create policy "report-attachments read" on storage.objects for select
  using (
    bucket_id = 'report-attachments'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin_or_manager()
    )
  );

drop policy if exists "report-attachments insert" on storage.objects;
create policy "report-attachments insert" on storage.objects for insert
  with check (
    bucket_id = 'report-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "report-attachments delete" on storage.objects;
create policy "report-attachments delete" on storage.objects for delete
  using (
    bucket_id = 'report-attachments'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin_or_manager()
    )
  );
