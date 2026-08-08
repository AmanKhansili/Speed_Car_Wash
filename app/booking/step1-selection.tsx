import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useBooking } from "@/context/BookingContext";

// AAPKE COMPONENTS (Sahi path ke mutabiq import karein)
import VehicleSelector from "@/components/booking/VehicleSelector";
import ServiceSelector from "@/components/booking/ServiceSelector";
import Colors from "@/constants/colors";

export default function Step1SelectionScreen() {
  const router = useRouter();
  const { bookingData, updateBooking } = useBooking();

  const [selectedVehicle, setSelectedVehicle] = useState(bookingData.vehicleId || "");
  const [selectedService, setSelectedService] = useState(bookingData.serviceId || "");

  const handleContinue = () => {
    if (!selectedVehicle || !selectedService) {
      Alert.alert("Selection Required", "Please select both a vehicle and a service package.");
      return;
    }

    // Save to global state & go to Next Screen
    updateBooking({ vehicleId: selectedVehicle, serviceId: selectedService });
    router.push("/booking/step2-datetime");
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* AAPKA VEHICLE COMPONENT */}
        <VehicleSelector
          selectedVehicleId={selectedVehicle}
          onSelectVehicle={setSelectedVehicle}
        />

        {/* AAPKA SERVICE COMPONENT */}
        <ServiceSelector
          selectedServiceId={selectedService}
          onSelectService={setSelectedService}
        />
      </ScrollView>

      {/* STICKY BOTTOM BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.btnText}>Continue to Date & Time</Text>
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
  continueBtn: {
    backgroundColor: Colors.primary || "#2563EB",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});