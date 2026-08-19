import Colors from "@/constants/colors";
import useUser from "@/context/userContext";
import { useBookingStore } from "@/store/bookingStore";
import { createClerkSupabaseClient } from "@/utils/supabase";
import { useAuth } from "@clerk/expo";
import { useRazorpay } from "@codearcade/expo-razorpay";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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

export default function BookingSummaryScreen() {
  const { userId, getToken } = useAuth();
  const { userData } = useUser();

  const params = useLocalSearchParams<{
    vehicleId?: string;
    serviceId?: string;
    date?: string;
    serviceType?: string;
    addressText?: string;
    primaryPhone?: string;
    altPhone?: string;
    preAppliedCoupon?: string;
    preDiscount?: string;
  }>();

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");

  const { selectedServices, getTotalPrice, clearCart } = useBookingStore();
  const { openCheckout, RazorpayUI } = useRazorpay();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingCard, setIsSavingCard] = useState(false);

  const clerkSupabase = useMemo(() => createClerkSupabaseClient(getToken), [getToken]);

  // Sync pre-applied coupon from params (Quick-Book Flow)
  useEffect(() => {
    if (params.preAppliedCoupon) {
      setAppliedCoupon(params.preAppliedCoupon);
      setCouponCode(params.preAppliedCoupon);
    }
    if (params.preDiscount) {
      setDiscount(Number(params.preDiscount) || 0);
    }
  }, [params.preAppliedCoupon, params.preDiscount]);

  // Selected Car Metadata resolution
  const selectedCar =
    userData?.vehicles?.find((v) => v.id === params.vehicleId) || userData?.vehicles?.[0];

  const carDetails = selectedCar
    ? {
        id: selectedCar.id,
        name: `${selectedCar.brand} ${selectedCar.model}`.trim(),
        registration_number: selectedCar.registrationNumber,
      }
    : null;

  // Price Calculation
  const subTotal = getTotalPrice();
  const discountedSubTotal = Math.max(0, subTotal - discount);
  const gst = Math.round(discountedSubTotal * 0.18);
  const platformFee = 49;
  const grandTotal = discountedSubTotal > 0 ? discountedSubTotal + gst + platformFee : 0;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      Alert.alert("Error", "Please enter a coupon code");
      return;
    }
    if (appliedCoupon) {
      Alert.alert("Coupon Applied", "A coupon is already applied. Remove it first.");
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
      Alert.alert("Invalid Coupon", "Use 'FIRST50' or 'CARWASH100' for testing.");
    }
  };

  const handleRemoveCoupon = () => {
    setDiscount(0);
    setAppliedCoupon("");
    setCouponCode("");
  };

  const primaryServiceName =
    selectedServices.length > 0
      ? selectedServices.map((s) => s.title).join(", ")
      : "Car Wash Service";

  // 1. NORMAL FLOW: RAZORPAY PAYMENT & BOOKING
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
      const bookingPayload = {
        clerk_user_id: userId,
        user_id: userId,
        service_type: params.serviceType || "pickup",
        service_name: primaryServiceName,
        services_booked: {
          items: selectedServices,
          vehicle: carDetails,
          coupon: appliedCoupon || null,
          discount_amount: discount,
        },
        booking_date: params.date || new Date().toDateString(),
        scheduled_date: params.date
          ? new Date(params.date).toISOString()
          : new Date().toISOString(),
        phone: params.primaryPhone || "",
        primary_phone: params.primaryPhone || "",
        alt_phone: params.altPhone || "",
        address:
          params.addressText ||
          (params.serviceType === "pickup" ? "Pickup Location" : "Workshop Center"),
        amount: grandTotal,
        total_amount: grandTotal,
        status: "Pending",
      };

      const { data: booking, error: bookingError } = await clerkSupabase
        .from("bookings")
        .insert([bookingPayload])
        .select()
        .single();

      if (bookingError) throw bookingError;

      const bookingId = booking.id;

      const { data: order, error: orderError } = await clerkSupabase.functions.invoke(
        "create-razorpay-order",
        {
          body: {
            bookingIds: [bookingId],
            amount: grandTotal,
            clerkUserId: userId,
          },
        },
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
            await clerkSupabase
              .from("bookings")
              .update({
                status: "Confirmed",
                payment_id: data.razorpay_payment_id,
              })
              .eq("id", bookingId);

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
            await clerkSupabase.from("bookings").update({ status: "Failed" }).eq("id", bookingId);

            setIsSubmitting(false);
            const errorMsg =
              error?.description || error?.reason || "Payment could not be completed";
            Alert.alert("Payment Failed", `Reason: ${errorMsg}`);
          },
          onClose: () => {
            setIsSubmitting(false);
          },
        },
      );
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert("Error", err?.message || "Something went wrong, please try again.");
      console.error(err);
    }
  };

  // 2. SAVE AS QUICK-BOOK CARD (STATUS: Saved)
  const handleSaveConfiguration = async () => {
    if (grandTotal <= 0) {
      Alert.alert("Error", "Your cart is empty!");
      return;
    }
    if (!userId) {
      Alert.alert("Error", "Please log in again to continue.");
      return;
    }

    setIsSavingCard(true);

    try {
      const quickCardPayload = {
        clerk_user_id: userId,
        user_id: userId,
        service_type: params.serviceType || "pickup",
        service_name: primaryServiceName,
        services_booked: {
          items: selectedServices,
          vehicle: carDetails,
          coupon: appliedCoupon || null,
          discount_amount: discount,
        },
        booking_date: params.date || "Template",
        scheduled_date: params.date
          ? new Date(params.date).toISOString()
          : new Date().toISOString(),
        phone: params.primaryPhone || "",
        primary_phone: params.primaryPhone || "",
        alt_phone: params.altPhone || "",
        address:
          params.addressText ||
          (params.serviceType === "pickup" ? "Saved Pickup Location" : "Service Hub"),
        amount: grandTotal,
        total_amount: grandTotal,
        status: "Saved",
      };

      const { error: bookingError } = await clerkSupabase
        .from("bookings")
        .insert([quickCardPayload]);

      if (bookingError) throw bookingError;

      setIsSavingCard(false);
      Alert.alert("Card Saved! 🎉", "Your configuration is saved in Quick Actions on Profile.", [
        {
          text: "Go to Profile",
          onPress: () => {
            clearCart();
            router.replace("/(tabs)/profile" as any);
          },
        },
      ]);
    } catch (err: any) {
      setIsSavingCard(false);
      Alert.alert("Error", err?.message || "Something went wrong.");
      console.error(err);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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

          {carDetails && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Vehicle:</Text>
              <Text style={styles.infoValue}>{carDetails.name}</Text>
            </View>
          )}

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
              {params.addressText || "Workshop Center"}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.couponSection}>
            <TextInput
              style={[
                styles.couponInput,
                appliedCoupon ? { backgroundColor: "#F3F4F6", color: "#6B7280" } : null,
              ]}
              placeholder="Enter Coupon (e.g. FIRST50)"
              placeholderTextColor="#9CA3AF"
              value={couponCode}
              onChangeText={setCouponCode}
              autoCapitalize="characters"
              editable={!appliedCoupon}
            />
            {appliedCoupon ? (
              <TouchableOpacity style={styles.removeBtn} onPress={handleRemoveCoupon}>
                <Text style={styles.removeBtnText}>Remove</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyCoupon}>
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            )}
          </View>
          {appliedCoupon ? (
            <Text style={styles.appliedText}>
              ✅ Coupon {appliedCoupon} applied (₹{discount} off)
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
                Discount ({appliedCoupon})
              </Text>
              <Text style={[styles.servicePrice, { color: "#16A34A" }]}>-₹{discount}</Text>
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
          style={styles.saveTemplateBtn}
          onPress={handleSaveConfiguration}
          disabled={isSavingCard || isSubmitting}
          activeOpacity={0.8}
        >
          {isSavingCard ? (
            <ActivityIndicator color={Colors.primary || "#2563EB"} />
          ) : (
            <Text style={styles.saveTemplateBtnText}>Save as Quick-Book Card</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={handlePaymentAndBooking}
          disabled={isSubmitting || isSavingCard}
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
  content: { padding: 16, paddingBottom: 160 },
  title: { fontSize: 24, fontWeight: "bold", color: Colors.text || "#111827", marginBottom: 20 },
  card: {
    backgroundColor: Colors.surface || "#FFF",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border || "#E5E7EB",
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  infoLabel: { fontSize: 14, color: Colors.textSecondary || "#6B7280" },
  infoValue: {
    fontSize: 14,
    color: Colors.text || "#111827",
    fontWeight: "500",
    maxWidth: "60%",
    textAlign: "right",
  },
  serviceTitle: { fontSize: 16, color: Colors.textSecondary || "#4B5563" },
  servicePrice: { fontSize: 16, color: Colors.text || "#111827", fontWeight: "600" },
  divider: { height: 1, backgroundColor: Colors.border || "#E5E7EB", marginVertical: 12 },
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
  removeBtn: {
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  removeBtnText: { color: "#DC2626", fontWeight: "700", fontSize: 14 },
  appliedText: { fontSize: 12, color: "#16A34A", fontWeight: "600", marginBottom: 8 },
  totalLabel: { fontSize: 18, fontWeight: "bold", color: Colors.text || "#111827" },
  totalValue: { fontSize: 20, fontWeight: "900", color: Colors.primary || "#2563EB" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
  },
  confirmBtn: {
    backgroundColor: Colors.primary || "#2563EB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmBtnText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  saveTemplateBtn: {
    backgroundColor: "#EFF6FF",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary || "#2563EB",
    alignItems: "center",
  },
  saveTemplateBtnText: { color: Colors.primary || "#2563EB", fontSize: 15, fontWeight: "700" },
});
