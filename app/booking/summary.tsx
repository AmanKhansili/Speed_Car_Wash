import Colors from "@/constants/colors";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
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
// 🚀 Official Razorpay SDK
import RazorpayCheckout from "react-native-razorpay";

import { useBookingStore } from "@/store/bookingStore";
import { supabase } from "@/utils/supabase";

export default function BookingSummaryScreen() {
  const { selectedServices, getTotalPrice, clearCart } = useBookingStore();
  const params = useLocalSearchParams<{
    date?: string;
    serviceType?: string;
    addressText?: string;
    primaryPhone?: string;
    altPhone?: string;
  }>();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🚀 MATH CALCULATION
  const subTotal = getTotalPrice();
  const gst = Math.round(subTotal * 0.18);
  const platformFee = 49;
  const grandTotal = subTotal > 0 ? subTotal + gst + platformFee : 0;

  // 🚀 2. SUPABASE SAVE (Payment ke baad)
  const saveBookingToSupabase = async (paymentId: string) => {
    try {
      const { error } = await supabase.from("bookings").insert([
        {
          user_id: "client_user_001", // Authentication lagne ke baad ise dynamic kar dena
          services_booked: selectedServices,
          total_amount: grandTotal,
          booking_date: params.date || new Date().toISOString(),
          service_type: params.serviceType || "pickup",
          address: params.addressText || "Workshop Center",
          primary_phone: params.primaryPhone || "",
          alt_phone: params.altPhone || "",
          status: "Confirmed",
          payment_id: paymentId,
        },
      ]);

      if (error) throw error;

      Alert.alert("Payment Successful 🎉", `Your booking is confirmed. \nRef ID: ${paymentId}`, [
        {
          text: "View Bookings",
          onPress: () => {
            clearCart();
            router.replace("/(tabs)/bookings" as any);
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert("Database Error", "Payment received but booking save failed. Contact support.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🚀 1. RAZORPAY TRIGGER
  const handlePaymentAndBooking = () => {
    if (grandTotal <= 0) {
      Alert.alert("Error", "Your cart is empty!");
      return;
    }

    setIsSubmitting(true);

    // Razorpay Configuration
    const options = {
      description: "Premium Car Wash & Detailing",
      image: require("@/assets/logo/logo.png"), // Client ka logo URL yahan daal sakte ho
      currency: "INR",
      key: "rzp_test_TPXivOh8YV97Lz", // 🔴 IMPORTANT: Yahan apna Razorpay Test Key daalo
      amount: grandTotal * 100, // Razorpay amount paise mein leta hai
      name: "Car Wash App",
      prefill: {
        email: "customer@example.com",
        contact: params.primaryPhone || "9999999999",
        name: "Customer Name",
      },
      theme: { color: Colors.primary || "#2563EB" },
    };

    RazorpayCheckout.open(options)
      .then((data: any) => {
        saveBookingToSupabase(data.razorpay_payment_id);
      })
      .catch((error: any) => {
        setIsSubmitting(false);
        // Error code 2 matlab user ne cancel kiya hai
        if (error.code !== 2) {
          // 🚀 Error description nahi hai toh poora error print karwa lenge
          const errorMsg =
            error.description || error.message || JSON.stringify(error) || "Unknown error";
          Alert.alert("Payment Failed", `Reason: ${errorMsg}`);
          console.log("Razorpay Error:", error);
        }
      });
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16 },
  content: { paddingBottom: 100 },
  title: { fontSize: 24, fontWeight: "bold", color: Colors.text, marginBottom: 20 },
  card: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
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
  },
  confirmBtnText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
});
