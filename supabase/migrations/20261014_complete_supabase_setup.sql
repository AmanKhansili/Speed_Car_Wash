-- ============================================================================
-- Speed Car Wash: Complete Supabase Setup (Admin, In-App Notifications, RLS)
-- ============================================================================

-- 1. Ensure 'profiles' table has push_token and is_admin columns
ALTER TABLE IF EXISTS public.profiles 
  ADD COLUMN IF NOT EXISTS push_token TEXT,
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_profiles_clerk_user_id ON public.profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = TRUE;

-- 2. In-App Notifications Auto-Trigger (Populates public.notifications for Bell Icon 🔔)
CREATE OR REPLACE FUNCTION public.auto_create_in_app_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_clerk_id TEXT;
  admin_rec RECORD;
BEGIN
  target_clerk_id := COALESCE(NEW.clerk_user_id, NEW.user_id);

  -- Ignore Saved Quick-Book Templates
  IF NEW.status IN ('Saved', 'Saved_Template', 'saved') OR target_clerk_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- A. Notify all Admins on newly created bookings
  IF TG_OP = 'INSERT' THEN
    FOR admin_rec IN (
      SELECT clerk_user_id FROM public.profiles WHERE is_admin = TRUE AND clerk_user_id IS NOT NULL
    ) LOOP
      INSERT INTO public.notifications (clerk_user_id, booking_id, type, title, message, read)
      VALUES (
        admin_rec.clerk_user_id,
        NEW.id,
        'admin_new_booking',
        '🚨 New Booking Alert!',
        '₹' || COALESCE(NEW.total_amount, NEW.amount, 0) || ' for ' || COALESCE(NEW.service_name, 'Car Wash') || ' (' || COALESCE(NEW.booking_date, 'Upcoming') || ')',
        FALSE
      );
    END LOOP;
  END IF;

  -- B. Customer Notification: Booking Confirmed
  IF (TG_OP = 'INSERT' AND NEW.status = 'Confirmed') OR 
     (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'Confirmed') THEN
    
    INSERT INTO public.notifications (clerk_user_id, booking_id, type, title, message, read)
    VALUES (
      target_clerk_id,
      NEW.id,
      'booking_confirmed',
      'Booking Confirmed! ✅',
      'Your ' || COALESCE(NEW.service_name, 'Car Wash') || ' is scheduled for ' || COALESCE(NEW.booking_date, 'your selected slot') || '.',
      FALSE
    );
  END IF;

  -- C. Customer Notification: Service Completed -> Review Request
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'Completed') THEN
    
    INSERT INTO public.notifications (clerk_user_id, booking_id, type, title, message, read)
    VALUES (
      target_clerk_id,
      NEW.id,
      'review_request',
      'Service Completed! ⭐',
      'Your ' || COALESCE(NEW.service_name, 'Car Wash') || ' is complete. Tap here to rate your experience!',
      FALSE
    );
  END IF;

  -- D. Customer Notification: Booking Cancelled
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'Cancelled') THEN
    
    INSERT INTO public.notifications (clerk_user_id, booking_id, type, title, message, read)
    VALUES (
      target_clerk_id,
      NEW.id,
      'booking_cancelled',
      'Booking Cancelled ❌',
      'Your booking for ' || COALESCE(NEW.service_name, 'Car Wash') || ' has been cancelled.',
      FALSE
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_in_app_notification ON public.bookings;

CREATE TRIGGER trg_auto_in_app_notification
AFTER INSERT OR UPDATE OF status ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.auto_create_in_app_notification();

-- 3. Admin RLS Policies on public.bookings
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
CREATE POLICY "Admins can view all bookings"
ON public.bookings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.clerk_user_id = (auth.jwt() ->> 'sub')
      AND profiles.is_admin = TRUE
  )
);

DROP POLICY IF EXISTS "Admins can update all bookings" ON public.bookings;
CREATE POLICY "Admins can update all bookings"
ON public.bookings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.clerk_user_id = (auth.jwt() ->> 'sub')
      AND profiles.is_admin = TRUE
  )
);
