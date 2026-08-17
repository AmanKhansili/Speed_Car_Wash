import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/expo";
import useUser from "@/context/userContext";
import VehicleSelector from "@/components/booking/VehicleSelector";
import ServiceSelector from "@/components/booking/ServiceSelector";
import Colors from "@/constants/colors";

export default function Step1SelectionScreen() {
  const router = useRouter();
  const { userId, isLoaded, isSignedIn } = useAuth();
  const { userData, selectVehicle } = useUser();

  const [selectedVehicle, setSelectedVehicle] = useState<string>(
    userData?.selectedVehicleId || (userData?.vehicles?.[0]?.id || "")
  );

  const [selectedService, setSelectedService] = useState<string>("");

  // Sync selected vehicle when vehicles load in user context
  useEffect(() => {
    if (!selectedVehicle && userData?.vehicles && userData.vehicles.length > 0) {
      setSelectedVehicle(userData.vehicles[0].id);
    }
  }, [userData?.vehicles]);

  const handleVehicleSelect = (id: string) => {
    setSelectedVehicle(id);
    selectVehicle(id);
  };

  const handleContinue = () => {
    // 1. Auth check before moving to step 2
    if (!userId || !isSignedIn) {
      Alert.alert(
        "Session Expired",
        "Aapka login session active nahi hai. Kripya dobara login karein.",
        [
          {
            text: "Login",
            onPress: () => router.replace("/" as any),
          },
        ]
      );
      return;
    }

    // 2. Selection validation
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

  // Wait until Clerk finishes loading session from storage
  if (!isLoaded) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary || "#2563EB"} />
      </View>
    );
  }

  // Handle case where user opens screen without being logged in
  if (!isSignedIn || !userId) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Please log in to make a booking.</Text>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => router.replace("/" as any)}
        >
          <Text style={styles.loginBtnText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
  center: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
  errorText: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 16,
  },
  loginBtn: {
    backgroundColor: Colors.primary || "#2563EB",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  loginBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});