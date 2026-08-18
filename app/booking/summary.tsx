import Colors from "@/constants/colors";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");

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

  const clerkSupabase = useMemo(
    () => createClerkSupabaseClient(getToken),
    [getToken],
  );

  // 🚀 MATH CALCULATION (Including Coupon Discount)
  const subTotal = getTotalPrice();
  const discountedSubTotal = Math.max(0, subTotal - discount);
  const gst = Math.round(discountedSubTotal * 0.18);
  const platformFee = 49;
  const grandTotal =
    discountedSubTotal > 0 ? discountedSubTotal + gst + platformFee : 0;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      Alert.alert("Error", "Please enter a coupon code");
      return;
    }
    if (couponCode.toUpperCase() === "FIRST50") {
      setDiscount(50);
      setAppliedCoupon("FIRST50");
      Alert.alert("Success", "Coupon applied successfully! ₹50 off.");
    } else if (couponCode.toUpperCase() === "CARWASH100") {
      setDiscount(100);
      setAppliedCoupon("CARWASH100");
      Alert.alert("Success", "Coupon applied successfully! ₹100 off.");
    } else {
      Alert.alert(
        "Invalid Coupon",
        "Use 'FIRST50' or 'CARWASH100' for testing.",
      );
    }
  };

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

      const { data: order, error: orderError } =
        await clerkSupabase.functions.invoke("create-razorpay-order", {
          body: {
            bookingIds,
            amount: grandTotal,
            clerkUserId: userId,
          },
        });

      if (orderError || !order?.id) {
        throw new Error(orderError?.message || "Order creation failed");
      }

      openCheckout(
        {
          key:
            process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID ||
            "rzp_test_TPXivOh8YV97Lz",
          amount: grandTotal * 100,
          currency: "INR",
          order_id: order.id,
          name: "Speed Car Wash",
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

            if (updateError)
              console.error("Booking update failed:", updateError);

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
              ],
            );
          },
          onFailure: async (error) => {
            await clerkSupabase
              .from("bookings")
              .update({ status: "Failed" })
              .in("id", bookingIds);

            setIsSubmitting(false);
            const errorMsg =
              error?.description ||
              error?.reason ||
              "Payment could not be completed";
            Alert.alert("Payment Failed", `Reason: ${errorMsg}`);
            // console.log("Razorpay Error:", JSON.stringify(error));
          },
          onClose: () => {
            setIsSubmitting(false);
          },
        },
      );
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert(
        "Error",
        err?.message || "Something went wrong, please try again.",
      );
      console.error(err);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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
            <Text style={styles.infoValue}>
              {params.serviceType?.toUpperCase()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date & Time:</Text>
            <Text style={styles.infoValue}>
              {params.date || "Not Selected"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoValue} numberOfLines={2}>
              {params.addressText}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* 🎟️ Coupon Section */}
          <View style={styles.couponSection}>
            <TextInput
              style={styles.couponInput}
              placeholder="Enter Coupon (e.g. FIRST50)"
              placeholderTextColor="#9CA3AF"
              value={couponCode}
              onChangeText={setCouponCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={handleApplyCoupon}
            >
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
          {appliedCoupon ? (
            <Text style={styles.appliedText}>
              ✅ Coupon {appliedCoupon} applied successfully!
            </Text>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.infoLabel}>Subtotal</Text>
            <Text style={styles.servicePrice}>₹{subTotal}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.row}>
              <Text style={[styles.infoLabel, { color: "#16A34A" }]}>
                Discount
              </Text>
              <Text style={[styles.servicePrice, { color: "#16A34A" }]}>
                -₹{discount}
              </Text>
            </View>
          )}
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

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={handlePaymentAndBooking}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.confirmBtnText}>Pay ₹{grandTotal} & Book</Text>
          )}
        </TouchableOpacity>
      </View>

      {RazorpayUI}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background || "#F9FAFB" },
  content: { padding: 16, paddingBottom: 100 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text || "#111827",
    marginBottom: 20,
  },
  card: {
    backgroundColor: Colors.surface || "#FFF",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border || "#E5E7EB",
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
  infoLabel: { fontSize: 14, color: Colors.textSecondary || "#6B7280" },
  infoValue: {
    fontSize: 14,
    color: Colors.text || "#111827",
    fontWeight: "500",
    maxWidth: "60%",
    textAlign: "right",
  },
  serviceTitle: { fontSize: 16, color: Colors.textSecondary || "#4B5563" },
  servicePrice: {
    fontSize: 16,
    color: Colors.text || "#111827",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border || "#E5E7EB",
    marginVertical: 12,
  },
  couponSection: { flexDirection: "row", gap: 8, marginBottom: 8 },
  couponInput: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 14,
    color: "#111827",
  },
  applyBtn: {
    backgroundColor: Colors.primary || "#2563EB",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  applyBtnText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
  appliedText: {
    fontSize: 12,
    color: "#16A34A",
    fontWeight: "600",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text || "#111827",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.primary || "#2563EB",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
  },
  confirmBtn: {
    backgroundColor: Colors.primary || "#2563EB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmBtnText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
});