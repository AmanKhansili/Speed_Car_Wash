/* eslint-disable import/no-unresolved */
// supabase/functions/razorpay-webhook/index.ts
// eslint-disable-next-line import/no-unresolved
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createHmac } from "node:crypto";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")!;
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature")!;

  const expected = createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");
  if (expected !== signature) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const sub = event.payload?.subscription?.entity;

  if (sub) {
    await supabase
      .from("subscriptions")
      .update({
        status: sub.status,
        current_period_end: sub.current_end
          ? new Date(sub.current_end * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq("razorpay_subscription_id", sub.id);

    // Optional: also sync profiles.membership_tier here when status becomes 'active'/'cancelled'
  }

  return new Response("ok", { status: 200 });
});