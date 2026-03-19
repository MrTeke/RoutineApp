-- ─── Step 1: Enable extensions (run once as superuser) ───────────────────────
-- Run this in Supabase Dashboard → SQL Editor:
--
--   create extension if not exists pg_cron;
--   create extension if not exists pg_net;
--
-- pg_cron  → schedules the job
-- pg_net   → makes the outbound HTTP call

-- ─── Step 2: Create the hourly cron job ──────────────────────────────────────
-- Calls the send-notifications Edge Function every hour at :00.
-- Uses the anon key (safe — Edge Function authenticates via SUPABASE_SERVICE_ROLE_KEY env var internally).

select cron.schedule(
  'send-habit-notifications',
  '0 * * * *',
  $$
  select
    net.http_post(
      url     := 'https://zgzzzczgzvprwtlhfjla.supabase.co/functions/v1/send-notifications',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer sb_publishable_JdmyVd4PvVHNEG4FybwSuQ_0YNbvK3c'
      ),
      body    := '{}'::jsonb
    ) as request_id;
  $$
);

-- ─── Verify ───────────────────────────────────────────────────────────────────
-- select * from cron.job;
-- select * from cron.job_run_details order by start_time desc limit 10;
