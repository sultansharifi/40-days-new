# Supabase setup

1. Create a project at https://supabase.com.
2. Copy `.env.example` to `.env` at the repo root and fill in:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Apply the schema, in order, in the SQL editor (paste each file's
   contents and run it):
   1. `migrations/0001_init.sql` — base tables, indexes, triggers.
   2. `migrations/0002_atomic_report_save.sql` — `create_full_report` /
      `update_full_report` RPCs that write a report + its participants +
      results in one transaction.
   3. `migrations/0003_open_access_no_auth.sql` — drops the login
      requirement: makes `reports.created_by` optional, replaces the
      role-based RLS policies with open ones, makes the attachments
      bucket public, and adds `set_report_status` /
      `report_type_counts` RPCs.

   (Or with the Supabase CLI: `supabase link --project-ref <ref>` then
   `supabase db push`.)

That's it — there's no user/admin setup step. The app has no login screen.

## Notes

- There is no authentication. Every request runs as the Supabase `anon`
  role using only the publishable anon key — RLS is enabled on every
  table but the policies allow anyone with that key to read, insert,
  update, and delete. Treat the deployed app URL as something you only
  share with people you trust, the same way you'd treat an internal tool.
- `public.users` / `auth.users` are still present in the schema (harmless
  leftovers from an earlier role-based version) but nothing in the app
  reads or writes them anymore.
- `reports.report_number` is generated automatically (`RPT-YYYY-000123`).
- `participants.total` is a generated column
  (`male_under18 + female_under18 + male_over18 + female_over18`).
- The "done?" checkbox on each report row toggles `reports.status`
  between `pending` and `approved` via the `set_report_status` RPC —
  that's the only meaning `status` carries now (`rejected` is unused).
