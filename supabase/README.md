# Supabase setup

1. Create a project at https://supabase.com.
2. Copy `.env.example` to `.env` at the repo root and fill in:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Apply the schema in `migrations/0001_init.sql`:
   - Easiest: open the Supabase SQL editor and paste the file contents, or
   - With the Supabase CLI: `supabase link --project-ref <ref>` then
     `supabase db push`.
4. Create your first admin user:
   - Sign up through the app's login page (or Supabase Auth dashboard).
   - In the SQL editor run:
     ```sql
     update public.users set role = 'admin' where email = 'you@example.com';
     ```
5. The `report-attachments` storage bucket and its policies are created by
   the migration automatically.

## Roles

- `admin` — full access: manage users, all reports, exports, analytics.
- `manager` — review/approve/reject any report, view statistics.
- `reporter` — create reports, view/edit their own reports while `pending`.

## Notes

- Row Level Security is enabled on every table; the anon/public API can only
  do what the policies in `migrations/0001_init.sql` allow.
- `reports.report_number` is generated automatically (`RPT-YYYY-000123`).
- `participants.total` is a generated column
  (`male_under18 + female_under18 + male_over18 + female_over18`).
