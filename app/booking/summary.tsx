import Colors from "@/constants/colors";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useBookingStore } from "@/store/bookingStore";
import { supabase } from "@/utils/supabase";

export default function BookingSummaryScreen() {
  const { selectedServices, getTotalPrice, clearCart } = useBookingStore();
  const params = useLocalSearchParams<{
    date?: string;
    serviceType?: string;
    addressText?: string;
  }>();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmBooking = async () => {
    try {
      setIsSubmitting(true);

      // 🚀 Supabase bookings table mein extra details ke sath insert
      const { error } = await supabase.from("bookings").insert([
        {
          user_id: "test_user_aman", // Testing dummy ID
          services_booked: selectedServices,
          total_amount: getTotalPrice(),
          booking_date: params.date || new Date().toISOString(),
          service_type: params.serviceType || "pickup",
          address: params.addressText || "Workshop Center",
          status: "Pending",
        },
      ]);

      if (error) throw error;

      Alert.alert("Success", "Your booking has been confirmed!", [
        {
          text: "OK",
          onPress: () => {
            clearCart();
            router.replace("/(tabs)/bookings" as any); // Seedha Bookings tab par bhej do
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert("Booking Failed", error.message);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
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
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{getTotalPrice()}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.confirmBtn}
        onPress={handleConfirmBooking}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.confirmBtnText}>Confirm & Book</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16 },
  content: { flex: 1 },
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
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  confirmBtnText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
});
