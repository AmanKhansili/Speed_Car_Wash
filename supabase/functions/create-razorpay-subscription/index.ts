/* eslint-disable import/no-unresolved */
// supabase/functions/create-razorpay-subscription/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID")!;
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const { clerkUserId, razorpayPlanId, planName } = await req.json();

  const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
  const res = await fetch("https://api.razorpay.com/v1/subscriptions", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      plan_id: razorpayPlanId,
      customer_notify: 1,
      total_count: 12, // e.g. 12 monthly cycles; adjust to your plan
      notes: { clerkUserId },
    }),
  });
  const sub = await res.json();

  await supabase.from("subscriptions").insert({
    clerk_user_id: clerkUserId,
    razorpay_subscription_id: sub.id,
    razorpay_plan_id: razorpayPlanId,
    plan_name: planName,
    status: sub.status,
  });

  return new Response(JSON.stringify(sub), {
    headers: { "Content-Type": "application/json" },
  });
});