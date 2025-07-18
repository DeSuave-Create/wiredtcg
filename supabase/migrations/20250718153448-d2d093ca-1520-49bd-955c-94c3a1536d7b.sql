-- Set up cron job for room cleanup (runs every hour)
-- Enable the necessary extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the room cleanup function to run every hour
SELECT cron.schedule(
  'room-cleanup-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://ptygikixnrdpleyntwrj.supabase.co/functions/v1/room-cleanup',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0eWdpa2l4bnJkcGxleW50d3JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTU0MzMsImV4cCI6MjA2ODE5MTQzM30.fvP5GsmPreDTXFDlEZJ-o9esEoy-KoVegqqAvY_tPqA"}'::jsonb,
        body:='{"trigger": "cron"}'::jsonb
    ) as request_id;
  $$
);