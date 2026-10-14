// Supabase Edge Function: Automated Expo Push Notifications for Bookings
// Uses built-in Deno.serve and native fetch (zero external URL imports required)

declare const Deno: {
  env: { get(key: string): string | undefined };
  serve(handler: (req: Request) => Promise<Response> | Response): void;
};

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: {
    id: string;
    clerk_user_id?: string;
    user_id?: string;
    service_name: string;
    booking_date: string;
    amount?: number;
    total_amount?: number;
    status: string;
    phone?: string;
    primary_phone?: string;
    address?: string;
    created_at?: string;
  };
  old_record?: {
    id: string;
    status: string;
  };
}

interface PushMessage {
  to: string;
  sound: "default";
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

async function sendExpoPushNotifications(messages: PushMessage[]) {
  if (!messages || messages.length === 0) return [];

  const validMessages = messages.filter(
    (m) =>
      m.to &&
      (m.to.startsWith("ExponentPushToken[") || m.to.startsWith("ExpoPushToken["))
  );

  if (validMessages.length === 0) {
    return [];
  }

  const response = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(validMessages),
  });

  return await response.json();
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    const payload: WebhookPayload = await req.json();
    const { type, record, old_record } = payload;

    if (!record) {
      return new Response(JSON.stringify({ message: "No record provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const restHeaders = {
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
      "Content-Type": "application/json",
    };

    const messagesToSend: PushMessage[] = [];
    const targetUserId = record.clerk_user_id || record.user_id;

    // 1. Fetch customer's push token from profiles table via Supabase REST
    let customerPushToken: string | null = null;
    if (targetUserId && supabaseUrl) {
      const custRes = await fetch(
        `${supabaseUrl}/rest/v1/profiles?clerk_user_id=eq.${encodeURIComponent(
          targetUserId
        )}&select=push_token`,
        { headers: restHeaders }
      );
      if (custRes.ok) {
        const custRows = await custRes.json();
        if (Array.isArray(custRows) && custRows[0]?.push_token) {
          customerPushToken = custRows[0].push_token;
        }
      }
    }

    // 2. Fetch admin push token(s)
    const adminTokens: string[] = [];
    if (supabaseUrl) {
      const admRes = await fetch(
        `${supabaseUrl}/rest/v1/profiles?is_admin=eq.true&push_token=not.is.null&select=push_token`,
        { headers: restHeaders }
      );
      if (admRes.ok) {
        const admRows = await admRes.json();
        if (Array.isArray(admRows)) {
          for (const row of admRows) {
            if (row?.push_token) adminTokens.push(row.push_token);
          }
        }
      }
    }

    const envAdminToken = Deno.env.get("ADMIN_EXPO_PUSH_TOKEN");
    if (envAdminToken && !adminTokens.includes(envAdminToken)) {
      adminTokens.push(envAdminToken);
    }

    const bookingPrice = record.total_amount ?? record.amount ?? 0;
    const serviceTitle = record.service_name || "Car Wash Service";

    if (type === "INSERT") {
      for (const token of adminTokens) {
        messagesToSend.push({
          to: token,
          sound: "default",
          title: "🚨 New Booking Alert!",
          body: `₹${bookingPrice} for ${serviceTitle} (${record.booking_date || "Upcoming"}).`,
          data: {
            bookingId: record.id,
            type: "admin_new_booking",
          },
        });
      }

      if (customerPushToken) {
        const isConfirmed = record.status === "Confirmed";
        messagesToSend.push({
          to: customerPushToken,
          sound: "default",
          title: isConfirmed ? "Booking Confirmed! ✅" : "Booking Received 🚗",
          body: isConfirmed
            ? `Your car wash is scheduled for ${record.booking_date}.`
            : `Your booking for ${serviceTitle} has been received. Status: ${record.status}.`,
          data: {
            bookingId: record.id,
            status: record.status,
            type: "customer_booking_created",
          },
        });
      }
    }

    if (type === "UPDATE" && record.status !== old_record?.status) {
      if (customerPushToken) {
        if (record.status === "Confirmed") {
          messagesToSend.push({
            to: customerPushToken,
            sound: "default",
            title: "Booking Confirmed! ✅",
            body: "Booking Confirmed! Your car wash is scheduled.",
            data: {
              bookingId: record.id,
              status: "Confirmed",
              type: "booking_status_update",
            },
          });
        } else if (record.status === "Completed") {
          messagesToSend.push({
            to: customerPushToken,
            sound: "default",
            title: "Service Completed! 🎉",
            body: `Your ${serviceTitle} has been completed. Check receipt and rate your experience!`,
            data: {
              bookingId: record.id,
              status: "Completed",
              type: "review_request",
            },
          });
        } else if (record.status === "Cancelled") {
          messagesToSend.push({
            to: customerPushToken,
            sound: "default",
            title: "Booking Cancelled ❌",
            body: `Your booking for ${serviceTitle} was cancelled.`,
            data: {
              bookingId: record.id,
              status: "Cancelled",
              type: "booking_status_update",
            },
          });
        }
      }
    }

    const dispatchResult = await sendExpoPushNotifications(messagesToSend);

    return new Response(
      JSON.stringify({
        success: true,
        sentCount: messagesToSend.length,
        result: dispatchResult,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

export {};
