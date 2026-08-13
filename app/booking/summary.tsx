import useUser from "@/context/userContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import PaymentSummary from "@/components/booking/PaymentSummary";
import Colors from "@/constants/colors";

// ZUSTAND STORE IMPORT
import { useBookingStore } from "@/store/bookingStore";

export default function Step4SummaryScreen() {
  const router = useRouter();

  const { userData, updateBookings } = useUser() as any;
  const { selectedServices, getTotalPrice, clearCart } = useBookingStore();

  const params = useLocalSearchParams() as {
    vehicleId?: string;
    date?: string;
    serviceType?: string;
    addressId?: string;
    addressText?: string;
    phone?: string;
  };

  const selectedVehicle = userData?.vehicles?.find((v: any) => v.id === params.vehicleId) || null;

  const itemTotal = getTotalPrice();
  const gstAmount = Math.round(itemTotal * 0.18);
  const convenienceFee = 49;
  const grandTotal = itemTotal + gstAmount + convenienceFee;

  // Highest price wali service nikalna safely
  const highestPricedService =
    selectedServices.length > 0
      ? selectedServices.reduce(
          (max: any, service: any) => (service.price > (max?.price || 0) ? service : max),
          selectedServices[0],
        )
      : null;

  const bookingData = {
    vehicleId: params.vehicleId,
    vehicle: selectedVehicle,
    services: selectedServices,
    date: params.date,
    serviceType: (params.serviceType as "pickup" | "walkin") || "pickup",
    addressId: params.addressId,
    addressText: params.addressText,
    phone: params.phone || userData?.mobileNumber,
    itemTotal,
    gstAmount,
    convenienceFee,
    grandTotal,
    image: highestPricedService?.image,
  };

  const handleMakePayment = async () => {
    const newBooking = {
      id: Date.now().toString(),
      title: selectedServices.map((s: any) => s.title).join(", "),
      price: `₹${grandTotal}`,
      date: params.date || "Scheduled",
      address: params.addressText || "Workshop Center",
      status: "Confirmed" as const,
      type: "upcoming" as const,
      image: highestPricedService?.image || "",
    };

    const existingBookings = userData?.bookings || [];
    const updatedBookings = [newBooking, ...existingBookings];

    if (updateBookings) {
      await updateBookings(updatedBookings);
    }

    Alert.alert("Success", "Booking confirmed successfully!", [
      {
        text: "OK",
        onPress: () => {
          clearCart();
          router.replace("/(tabs)/bookings");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <PaymentSummary bookingData={bookingData} />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Grand Total</Text>
          <Text style={styles.totalAmount}>₹{grandTotal}</Text>
        </View>

        <TouchableOpacity style={styles.payBtn} onPress={handleMakePayment} activeOpacity={0.8}>
          <Text style={styles.btnText}>Make Payment (₹{grandTotal})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", paddingTop: 20 },
  scrollContent: { paddingBottom: 140 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderColor: Colors.border || "#E5E7EB",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text || "#111827",
  },
  payBtn: {
    backgroundColor: "#16A34A",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
