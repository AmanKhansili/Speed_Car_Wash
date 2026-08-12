import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Alert, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import  useUser  from "@/context/userContext"; 
import VehicleSelector from "@/components/booking/VehicleSelector";
import ServiceSelector from "@/components/booking/ServiceSelector";
import Colors from "@/constants/colors";

export default function Step1SelectionScreen() {
  const router = useRouter();
  const { userData, selectVehicle } = useUser();

  const [selectedVehicle, setSelectedVehicle] = useState<string>(
    userData.selectedVehicleId || (userData.vehicles?.[0]?.id || "")
  );
  
  const [selectedService, setSelectedService] = useState<string>("");

  useEffect(() => {
    if (!selectedVehicle && userData.vehicles.length > 0) {
      setSelectedVehicle(userData.vehicles[0].id);
    }
  }, [userData.vehicles]);

  const handleVehicleSelect = (id: string) => {
    setSelectedVehicle(id);
    selectVehicle(id); 
  };

  const handleContinue = () => {
    if (!selectedVehicle || !selectedService) {
      Alert.alert(
        "Selection Required",
        "Please select both a vehicle and a service package to proceed."
      );
      return;
    }
    router.push({
      pathname: "/booking/step2-datetime",
      params: { vehicleId: selectedVehicle, serviceId: selectedService },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <VehicleSelector
          selectedVehicleId={selectedVehicle}
          onSelectVehicle={handleVehicleSelect}
        />

        <ServiceSelector
          selectedServiceId={selectedService}
          onSelectService={setSelectedService}
        />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.continueBtn,
            (!selectedVehicle || !selectedService) && styles.disabledBtn,
          ]}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueBtnText}>Continue to Date & Time</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: { 
    padding: 16,
    paddingBottom: 100,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  continueBtn: {
    backgroundColor: Colors.primary || "#2563EB",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledBtn: {
    backgroundColor: "#94A3B8",
  },
  continueBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});