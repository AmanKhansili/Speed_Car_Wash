-- ====================================================================
-- Speed Car Wash: Push Notifications Database Schema & Trigger Setup
-- ====================================================================

-- 1. Ensure 'profiles' table has push_token and is_admin columns
ALTER TABLE IF EXISTS public.profiles 
  ADD COLUMN IF NOT EXISTS push_token TEXT,
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create index for quick token lookup by clerk_user_id & admin status
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_user_id ON public.profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = TRUE;

-- 2. Enable pg_net extension for asynchronous HTTP requests from SQL
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 3. SQL Trigger Function to trigger Supabase Edge Function via HTTP POST
CREATE OR REPLACE FUNCTION public.handle_booking_push_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  -- Replace with your Supabase Project URL or Edge Function URL
  -- Example: https://<project-ref>.functions.supabase.co/push-notifications
  edge_function_url TEXT := 'https://xxoecxywcycpmznnphgr.functions.supabase.co/push-notifications';
  service_role_key TEXT := 'YOUR_SUPABASE_SERVICE_ROLE_KEY'; -- Or anon key
  payload JSONB;
BEGIN
  -- Build Webhook Payload compatible with standard Supabase Database Webhook format
  payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', row_to_json(NEW),
    'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END
  );

  -- Perform non-blocking HTTP POST request to Edge Function via pg_net
  PERFORM extensions.net_http_post(
    edge_function_url,
    payload,
    '{}'::jsonb,
    jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    )
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Prevent transaction failure if notification delivery encounters an issue
    RAISE WARNING 'Push notification trigger error: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 4. Create Trigger on bookings table for INSERT and status UPDATE
DROP TRIGGER IF EXISTS trg_booking_push_notification ON public.bookings;

CREATE TRIGGER trg_booking_push_notification
  AFTER INSERT OR UPDATE OF status
  ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_booking_push_notification();

-- ====================================================================
-- Note: Alternatively, you can use Supabase Dashboard Webhooks:
-- Go to Supabase Dashboard -> Database -> Webhooks -> "Create a webhook":
--   - Name: "booking_push_notifications"
--   - Table: "bookings"
--   - Events: INSERT, UPDATE
--   - Type: Supabase Edge Functions -> Select "push-notifications"
-- ====================================================================
