/* eslint-disable import/no-unresolved */
// supabase/functions/create-razorpay-order/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID")!;
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const { bookingIds, amount, clerkUserId } = await req.json();

  const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: amount * 100,
      currency: "INR",
      notes: { bookingIds: bookingIds.join(","), clerkUserId },
    }),
  });
  const order = await res.json();

  await supabase.from("payments").insert({
    booking_ids: bookingIds,
    razorpay_order_id: order.id,
    amount,
    status: "created",
  });

  return new Response(JSON.stringify(order), {
    headers: { "Content-Type": "application/json" },
  });
});