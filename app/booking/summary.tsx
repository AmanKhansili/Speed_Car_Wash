import Colors from "@/constants/colors";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRazorpay } from "@codearcade/expo-razorpay";
import { useAuth } from "@clerk/expo";

import { useBookingStore } from "@/store/bookingStore";
import { createClerkSupabaseClient } from "@/utils/supabase";

export default function BookingSummaryScreen() {
  const { userId, getToken } = useAuth();
  const { selectedServices, getTotalPrice, clearCart } = useBookingStore();
  const { openCheckout, RazorpayUI } = useRazorpay();
  const params = useLocalSearchParams<{
    date?: string;
    serviceType?: string;
    addressText?: string;
    primaryPhone?: string;
    altPhone?: string;
  }>();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clerk-authenticated Supabase client — RLS policies ke liye zaroori
  const clerkSupabase = useMemo(() => createClerkSupabaseClient(getToken), [getToken]);

  const subTotal = getTotalPrice();
  const gst = Math.round(subTotal * 0.18);
  const platformFee = 49;
  const grandTotal = subTotal > 0 ? subTotal + gst + platformFee : 0;

  const handlePaymentAndBooking = async () => {
    if (grandTotal <= 0) {
      Alert.alert("Error", "Your cart is empty!");
      return;
    }
    if (!userId) {
      Alert.alert("Error", "Please log in again to continue.");
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingRows = selectedServices.map((service) => ({
        clerk_user_id: userId,
        service_type: params.serviceType || "pickup",
        service_name: service.title,
        scheduled_date: params.date || new Date().toISOString(),
        phone: params.primaryPhone || "",
        amount: service.price,
        status: "Pending",
      }));

      const { data: bookings, error: bookingError } = await clerkSupabase
        .from("bookings")
        .insert(bookingRows)
        .select();

      if (bookingError) throw bookingError;

      const bookingIds = bookings.map((b) => b.id);

      const { data: order, error: orderError } = await clerkSupabase.functions.invoke(
        "create-razorpay-order",
        {
          body: {
            bookingIds,
            amount: grandTotal,
            clerkUserId: userId,
          },
        }
      );

      if (orderError || !order?.id) {
        throw new Error(orderError?.message || "Order creation failed");
      }

      openCheckout(
        {
          key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TPXivOh8YV97Lz",
          amount: grandTotal * 100,
          currency: "INR",
          order_id: order.id,
          name: "Car Wash App",
          description: "Premium Car Wash & Detailing",
          prefill: {
            name: "Customer Name",
            email: "customer@example.com",
            contact: params.primaryPhone || "9999999999",
          },
          theme: { color: Colors.primary || "#2563EB" },
        },
        {
          onSuccess: async (data) => {
            const { error: updateError } = await clerkSupabase
              .from("bookings")
              .update({ status: "Confirmed" })
              .in("id", bookingIds);

            if (updateError) console.error("Booking update failed:", updateError);

            setIsSubmitting(false);
            Alert.alert(
              "Payment Successful 🎉",
              `Your booking is confirmed. \nRef ID: ${data.razorpay_payment_id}`,
              [
                {
                  text: "View Bookings",
                  onPress: () => {
                    clearCart();
                    router.replace("/(tabs)/bookings" as any);
                  },
                },
              ]
            );
          },
          onFailure: async (error) => {
            await clerkSupabase.from("bookings").update({ status: "Failed" }).in("id", bookingIds);

            setIsSubmitting(false);
            const errorMsg = error?.description || error?.reason || "Payment could not be completed";
            Alert.alert("Payment Failed", `Reason: ${errorMsg}`);
            console.log("Razorpay Error:", JSON.stringify(error));
          },
          onClose: () => {
            setIsSubmitting(false);
          },
        }
      );
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert("Error", err?.message || "Something went wrong, please try again.");
      console.error(err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Booking Summary</Text>

        <View style={styles.card}>
          {selectedServices.map((service) => (
            <View key={service.id} style={styles.row}>
              <Text style={styles.serviceTitle}>{service.title}</Text>
              <Text style={styles.servicePrice}>₹{service.price}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type:</Text>
            <Text style={styles.infoValue}>{params.serviceType?.toUpperCase()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date & Time:</Text>
            <Text style={styles.infoValue}>{params.date || "Not Selected"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoValue} numberOfLines={2}>
              {params.addressText}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.infoLabel}>Subtotal</Text>
            <Text style={styles.servicePrice}>₹{subTotal}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.infoLabel}>GST (18%)</Text>
            <Text style={styles.servicePrice}>₹{gst}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.infoLabel}>Platform Fee</Text>
            <Text style={styles.servicePrice}>₹{platformFee}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>₹{grandTotal}</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.confirmBtn}
        onPress={handlePaymentAndBooking}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.confirmBtnText}>Pay ₹{grandTotal} & Book</Text>
        )}
      </TouchableOpacity>

      {RazorpayUI}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16 },
  content: { paddingBottom: 100 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 20,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: { fontSize: 14, color: Colors.textSecondary },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
    maxWidth: "60%",
    textAlign: "right",
  },
  serviceTitle: { fontSize: 16, color: Colors.textSecondary },
  servicePrice: { fontSize: 16, color: Colors.text, fontWeight: "600" },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  totalLabel: { fontSize: 18, fontWeight: "bold", color: Colors.text },
  totalValue: { fontSize: 20, fontWeight: "900", color: Colors.primary },
  confirmBtn: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: Colors.primary,
    padding: 16,
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
  confirmBtnText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
});
