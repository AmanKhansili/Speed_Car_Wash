/* eslint-disable import/no-unresolved */
// supabase/functions/verify-razorpay-payment/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createHmac } from "node:crypto";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } =
    await req.json();

  const expected = createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const verified = expected === razorpay_signature;

  await supabase
    .from("payments")
    .update({
      razorpay_payment_id,
      razorpay_signature,
      status: verified ? "paid" : "failed",
    })
    .eq("razorpay_order_id", razorpay_order_id);

  if (verified && bookingId) {
    await supabase.from("bookings").update({ status: "confirmed" }).eq("id", bookingId);
  }

  return new Response(JSON.stringify({ verified }), {
    headers: { "Content-Type": "application/json" },
  });
});