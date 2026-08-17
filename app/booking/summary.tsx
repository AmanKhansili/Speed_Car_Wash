import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/expo";
import useUser from "@/context/userContext";
import { useRazorpay } from "@codearcade/expo-razorpay";

import PaymentSummary from "@/components/booking/PaymentSummary";
import Colors from "@/constants/colors";
import { createClerkSupabaseClient } from "@/utils/supabase";

export default function Step4SummaryScreen() {
  const router = useRouter();
  const { userData } = useUser();
  const { userId: clerkUserId, getToken } = useAuth();
  const { openCheckout, RazorpayUI } = useRazorpay();

  // Clerk session token wala Supabase client — memoized taaki reuse ho,
  // sirf getToken change hone pe naya banega
  const supabase = useMemo(
    () => createClerkSupabaseClient(getToken),
    [getToken],
  );

  const [total, setTotal] = useState<number>(0);
  const [processing, setProcessing] = useState<boolean>(false);

  const params = useLocalSearchParams<{
    vehicleId?: string;
    serviceId?: string;
    date?: string;
    serviceType?: string;
    addressId?: string;
    addressText?: string;
    phone?: string;
  }>();

  const selectedVehicle =
    userData.vehicles?.find((v) => v.id === params.vehicleId) || null;

  const bookingData = {
    vehicleId: params.vehicleId,
    vehicle: selectedVehicle,
    serviceId: params.serviceId,
    date: params.date,
    serviceType: (params.serviceType as "pickup" | "walkin") || "pickup",
    addressId: params.addressId,
    addressText: params.addressText,
    phone: params.phone || userData.mobileNumber,
  };

  const handleMakePayment = async () => {
    if (!clerkUserId) {
      Alert.alert(
        "Authentication Error",
        "User not logged in. Please log in again.",
      );
      return;
    }

    if (!bookingData.vehicleId || !bookingData.serviceId) {
      Alert.alert(
        "Missing Details",
        "Please select a vehicle and service before proceeding.",
      );
      return;
    }

    if (total <= 0) {
      Alert.alert(
        "Invalid Amount",
        "Please wait until the total summary calculates properly.",
      );
      return;
    }

    setProcessing(true);

    try {
      // 1. Create booking row with 'pending' status in Supabase
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          clerk_user_id: clerkUserId,
          vehicle_id: bookingData.vehicleId,
          address_id:
            bookingData.addressId === "walkin" ? null : bookingData.addressId,
          service_type: bookingData.serviceType,
          service_name: bookingData.serviceId,
          scheduled_date: bookingData.date,
          phone: bookingData.phone,
          amount: total,
          status: "pending",
        })
        .select()
        .single();

      if (bookingError || !booking) {
        console.error("Booking Creation Error:", bookingError);
        Alert.alert(
          "Booking Failed",
          "Could not create booking record. Please try again.",
        );
        setProcessing(false);
        return;
      }

      // 2. Invoke Edge Function to create Razorpay Order
      const { data: order, error: orderError } =
        await supabase.functions.invoke("create-razorpay-order", {
          body: { bookingId: booking.id, amount: total, clerkUserId },
        });

      if (orderError || !order?.id) {
        // FunctionsHttpError only exposes a generic message by default —
        // the real reason is in the response body, so read it explicitly.
        let realReason =
          "Could not initiate payment session. Please try again.";
        try {
          const context = (orderError as any)?.context;
          if (context && typeof context.json === "function") {
            const body = await context.json();
            realReason = body?.error || realReason;
            console.error("Razorpay Order Creation Error (real reason):", body);
          } else {
            console.error("Razorpay Order Creation Error:", orderError);
          }
        } catch (parseErr) {
          console.error(
            "Could not parse error response:",
            parseErr,
            orderError,
          );
        }

        Alert.alert("Payment Error", realReason);
        setProcessing(false);
        return;
      }

      // 3. Open Razorpay Checkout Modal
      openCheckout(
        {
          key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID!,
          amount: order.amount,
          currency: "INR",
          order_id: order.id,
          name: "Car Wash App",
          description: `Booking for ${selectedVehicle?.model || "Car Wash"}`,
          prefill: { contact: bookingData.phone ?? "" },
          theme: { color: Colors.primary || "#2563EB" },
        },
        {
          onSuccess: async (data) => {
            // Verify payment signature via Supabase Edge Function
            const { data: result, error: verifyError } =
              await supabase.functions.invoke("verify-razorpay-payment", {
                body: {
                  razorpay_order_id: data.razorpay_order_id,
                  razorpay_payment_id: data.razorpay_payment_id,
                  razorpay_signature: data.razorpay_signature,
                  bookingId: booking.id,
                },
              });

            setProcessing(false);

            if (verifyError || !result?.verified) {
              Alert.alert(
                "Verification Failed",
                "Payment completed but signature verification failed. Please contact support if money was deducted.",
              );
              return;
            }

            Alert.alert(
              "Success 🎉",
              "Your booking has been successfully confirmed!",
              [
                {
                  text: "View Bookings",
                  onPress: () => router.replace("/(tabs)/bookings"),
                },
              ],
            );
          },
          onFailure: (error) => {
            setProcessing(false);
            console.log("Full Razorpay error:", JSON.stringify(error, null, 2));
            Alert.alert(
              "Payment Cancelled",
              "Payment transaction was not completed. Please try again.",
            );
          },
          onClose: () => {
            setProcessing(false);
          },
        },
      );
    } catch (err: any) {
      console.error("Unexpected Payment Error:", err);
      setProcessing(false);
      Alert.alert(
        "Error",
        err.message || "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PaymentSummary bookingData={bookingData} onTotalChange={setTotal} />
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payBtn, processing && styles.disabledBtn]}
          onPress={handleMakePayment}
          activeOpacity={0.8}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.btnText}>
              {total > 0 ? `Make Payment • ₹${total}` : "Make Payment"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {RazorpayUI}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingTop: 10,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderColor: Colors.border || "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  payBtn: {
    backgroundColor: "#16A34A",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  btnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
