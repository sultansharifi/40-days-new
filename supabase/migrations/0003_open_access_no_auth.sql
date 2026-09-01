-- =========================================================================
-- Remove the login requirement.
--
-- The app no longer has a sign-in screen — everyone who has the link can
-- open it straight to the dashboard, add reports, and mark them done.
-- That means requests arrive as the Supabase `anon` role with no
-- auth.uid(), so every policy that gated access on created_by = auth.uid()
-- or a role stored in public.users has to be replaced with open access.
-- public.users / auth.users are left in place (harmless, just unused).
-- =========================================================================

alter table public.reports alter column created_by drop not null;

-- ---- drop the old auth-based policies ----
drop policy if exists users_select on public.users;
drop policy if exists users_update on public.users;
drop policy if exists users_insert on public.users;
drop policy if exists users_delete on public.users;

drop policy if exists reports_select on public.reports;
drop policy if exists reports_insert on public.reports;
drop policy if exists reports_update on public.reports;
drop policy if exists reports_delete on public.reports;

drop policy if exists participants_select on public.participants;
drop policy if exists participants_write on public.participants;

drop policy if exists results_select on public.results;
drop policy if exists results_write on public.results;

drop policy if exists attachments_select on public.report_attachments;
drop policy if exists attachments_insert on public.report_attachments;
drop policy if exists attachments_delete on public.report_attachments;

-- ---- open policies ----
create policy reports_open_select on public.reports for select using (true);
create policy reports_open_insert on public.reports for insert with check (true);
create policy reports_open_update on public.reports for update using (true) with check (true);
create policy reports_open_delete on public.reports for delete using (true);

create policy participants_open on public.participants for all using (true) with check (true);
create policy results_open on public.results for all using (true) with check (true);
create policy attachments_open on public.report_attachments for all using (true) with check (true);

-- ---- storage: make attachments bucket public with open policies ----
update storage.buckets set public = true where id = 'report-attachments';

drop policy if exists "report-attachments read" on storage.objects;
drop policy if exists "report-attachments insert" on storage.objects;
drop policy if exists "report-attachments delete" on storage.objects;

create policy "report-attachments open" on storage.objects for all
  using (bucket_id = 'report-attachments')
  with check (bucket_id = 'report-attachments');

-- =========================================================================
-- Report save RPCs, updated to not require auth.uid()
-- =========================================================================

create or replace function public.create_full_report(
  p_reporter_name text,
  p_title text,
  p_province text,
  p_district text,
  p_center_name text,
  p_report_date date,
  p_report_type public.report_type,
  p_objective text,
  p_activity_description text,
  p_location text,
  p_start_date date,
  p_end_date date,
  p_male_under18 integer,
  p_female_under18 integer,
  p_male_over18 integer,
  p_female_over18 integer,
  p_achievement text,
  p_challenges text,
  p_recommendations text
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_report_id uuid;
begin
  insert into public.reports (
    reporter_name, title, province, district, center_name,
    report_date, report_type, objective, activity_description, location,
    start_date, end_date, status
  ) values (
    p_reporter_name, p_title, p_province, p_district, p_center_name,
    p_report_date, p_report_type, p_objective, p_activity_description, p_location,
    p_start_date, p_end_date, 'pending'
  )
  returning id into v_report_id;

  insert into public.participants (report_id, male_under18, female_under18, male_over18, female_over18)
  values (v_report_id, p_male_under18, p_female_under18, p_male_over18, p_female_over18);

  insert into public.results (report_id, achievement, challenges, recommendations)
  values (v_report_id, p_achievement, p_challenges, p_recommendations);

  return v_report_id;
end;
$$;

create or replace function public.update_full_report(
  p_report_id uuid,
  p_reporter_name text,
  p_title text,
  p_province text,
  p_district text,
  p_center_name text,
  p_report_date date,
  p_report_type public.report_type,
  p_objective text,
  p_activity_description text,
  p_location text,
  p_start_date date,
  p_end_date date,
  p_male_under18 integer,
  p_female_under18 integer,
  p_male_over18 integer,
  p_female_over18 integer,
  p_achievement text,
  p_challenges text,
  p_recommendations text
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  update public.reports set
    reporter_name = p_reporter_name,
    title = p_title,
    province = p_province,
    district = p_district,
    center_name = p_center_name,
    report_date = p_report_date,
    report_type = p_report_type,
    objective = p_objective,
    activity_description = p_activity_description,
    location = p_location,
    start_date = p_start_date,
    end_date = p_end_date
  where id = p_report_id;

  if not found then
    raise exception 'Report % not found', p_report_id;
  end if;

  insert into public.participants (report_id, male_under18, female_under18, male_over18, female_over18)
  values (p_report_id, p_male_under18, p_female_under18, p_male_over18, p_female_over18)
  on conflict (report_id) do update set
    male_under18 = excluded.male_under18,
    female_under18 = excluded.female_under18,
    male_over18 = excluded.male_over18,
    female_over18 = excluded.female_over18;

  insert into public.results (report_id, achievement, challenges, recommendations)
  values (p_report_id, p_achievement, p_challenges, p_recommendations)
  on conflict (report_id) do update set
    achievement = excluded.achievement,
    challenges = excluded.challenges,
    recommendations = excluded.recommendations;
end;
$$;

-- Toggle the "done" checkbox on the dashboard (pending <-> approved).
create or replace function public.set_report_status(p_report_id uuid, p_status public.report_status)
returns void
language sql
security invoker
set search_path = public
as $$
  update public.reports set status = p_status where id = p_report_id;
$$;

grant execute on function public.create_full_report(
  text, text, text, text, text, date, public.report_type, text, text, text, date, date,
  integer, integer, integer, integer, text, text, text
) to anon, authenticated;

grant execute on function public.update_full_report(
  uuid, text, text, text, text, text, date, public.report_type, text, text, text, date, date,
  integer, integer, integer, integer, text, text, text
) to anon, authenticated;

grant execute on function public.set_report_status(uuid, public.report_status) to anon, authenticated;

-- Per-type submission counts for the dashboard ("how many of each so far").
create or replace function public.report_type_counts()
returns table (report_type public.report_type, total bigint)
language sql
security invoker
set search_path = public
stable
as $$
  select report_type, count(*) as total
  from public.reports
  group by report_type
  order by report_type;
$$;

grant execute on function public.report_type_counts() to anon, authenticated;
