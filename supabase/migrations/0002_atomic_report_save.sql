-- =========================================================================
-- Atomic report submission
--
-- The report form writes to three tables (reports, participants, results).
-- Doing that as three separate client-side requests means a mid-way
-- failure (e.g. the participants insert fails) leaves a half-written
-- "pending" report behind that would still show up in dashboard counts
-- and lists even though the submission never actually finished.
--
-- These RPCs run all three writes inside one Postgres function call, so
-- they succeed or fail together — a report only ever exists (and only
-- ever appears on the dashboard) once the whole submission is complete.
-- They run as SECURITY INVOKER (the default), so the existing RLS
-- policies on reports/participants/results still apply exactly as before.
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
    created_by, reporter_name, title, province, district, center_name,
    report_date, report_type, objective, activity_description, location,
    start_date, end_date, status
  ) values (
    auth.uid(), p_reporter_name, p_title, p_province, p_district, p_center_name,
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
    raise exception 'Report % not found or not permitted', p_report_id;
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

grant execute on function public.create_full_report(
  text, text, text, text, text, date, public.report_type, text, text, text, date, date,
  integer, integer, integer, integer, text, text, text
) to authenticated;

grant execute on function public.update_full_report(
  uuid, text, text, text, text, text, date, public.report_type, text, text, text, date, date,
  integer, integer, integer, integer, text, text, text
) to authenticated;
