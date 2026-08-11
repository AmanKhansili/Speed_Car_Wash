import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router"; 
import  useUser  from "@/context/userContext"; 

import PaymentSummary from "@/components/booking/PaymentSummary";
import Colors from "@/constants/colors";

export default function Step4SummaryScreen() {
  const router = useRouter();
  const { userData } = useUser();

  const params = useLocalSearchParams<{
    vehicleId?: string;
    serviceId?: string;
    date?: string;
    serviceType?: string;
    addressId?: string;
    addressText?: string;
    phone?: string;
  }>();

  const selectedVehicle = userData.vehicles.find(
    (v) => v.id === params.vehicleId
  ) || null;

  const bookingData = {
    vehicleId: params.vehicleId,
    vehicle: selectedVehicle,
    serviceId: params.serviceId,
    date: params.date,
    serviceType: (params.serviceType as "pickup" | "walkin") || "pickup", // 👈 Type casting here
    addressId: params.addressId,
    addressText: params.addressText,
    phone: params.phone || userData.mobileNumber,
  };

  const handleMakePayment = () => {
    Alert.alert("Success", "Booking confirmed successfully!", [
      {
        text: "OK",
        onPress: () => {
          router.replace("/(tabs)/bookings");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PaymentSummary bookingData={bookingData} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.payBtn} 
          onPress={handleMakePayment}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>Make Payment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", paddingTop: 20 },
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
    backgroundColor: "#16A34A",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});