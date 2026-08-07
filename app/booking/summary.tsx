import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useBooking } from "@/context/BookingContext";

// AAPKA PAYMENT SUMMARY COMPONENT
import PaymentSummary from "@/components/booking/PaymentSummary";
import Colors from "@/constants/colors";

export default function SummaryScreen() {
  const router = useRouter();
  const { bookingData, resetBooking } = useBooking();

  const handleMakePayment = () => {
    Alert.alert("Success", "Booking confirmed successfully!");
    resetBooking(); // Flow clear karein
    router.replace("/"); // Home par bhej dein
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* AAPKA SUMMARY COMPONENT (Global state pass kar sakte hain) */}
        <PaymentSummary bookingData={bookingData} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.payBtn} onPress={handleMakePayment}>
          <Text style={styles.btnText}>Make Payment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF",paddingTop: 20, },
  scrollContent: { paddingBottom: 100 },
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
  payBtn: {
    backgroundColor: "#16A34A", // Green button for payment
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});