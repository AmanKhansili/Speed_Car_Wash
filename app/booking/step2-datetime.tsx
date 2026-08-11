import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import DateTimeSelector from "@/components/booking/DateTimeSelector";
import AddressSelector from "@/components/booking/AddressSelector";
import Colors from "@/constants/colors";

export default function Step2DateTimeScreen() {
  const router = useRouter();
  
  const params = useLocalSearchParams<{ vehicleId?: string; serviceId?: string }>();
  const { vehicleId, serviceId } = params;

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [serviceType, setServiceType] = useState<"pickup" | "walkin">("pickup");
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [addressText, setAddressText] = useState<string>("");

  const handleContinue = () => {
    if (!selectedDate) {
      Alert.alert("Selection Required", "Please select a date & time slot to proceed.");
      return;
    }

    let fullAddressText = "Walk-in at Workshop Center";
    if (serviceType === "pickup") {
      if (!selectedAddressId) {
        Alert.alert(
          "Address Required",
          "Please select or add a pickup address to proceed."
        );
        return;
      }
      fullAddressText = addressText || "Selected Pickup Address";
    }

    router.push({
      pathname: "/booking/summary",
      params: {
        vehicleId,
        serviceId,
        date: selectedDate,
        serviceType,
        addressId: serviceType === "pickup" ? selectedAddressId : "walkin",
        addressText: fullAddressText,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <DateTimeSelector
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <View style={styles.optionSection}>
          <Text style={styles.sectionTitle}>Select Service Type</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeCard,
                serviceType === "pickup" && styles.selectedTypeCard,
              ]}
              onPress={() => setServiceType("pickup")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.typeText,
                  serviceType === "pickup" && styles.selectedTypeText,
                ]}
              >
                🚗 Pickup
              </Text>
              <Text style={styles.typeSubtext}>
                We will pick up your car from your location
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeCard,
                serviceType === "walkin" && styles.selectedTypeCard,
              ]}
              onPress={() => setServiceType("walkin")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.typeText,
                  serviceType === "walkin" && styles.selectedTypeText,
                ]}
              >
                🚶 Walk-in
              </Text>
              <Text style={styles.typeSubtext}>
                Bring your car to our service center
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.optionSection}>
          {serviceType === "pickup" ? (
            <AddressSelector
              selectedAddressId={selectedAddressId}
              onSelectAddress={(id) => {
                setSelectedAddressId(id);
              }}
              onAddNewAddress={() => console.log("Add New Address Modal")}
            />
          ) : (
            <View style={styles.walkinCard}>
              <Ionicons
                name="location-sharp"
                size={24}
                color={Colors.primary || "#2563EB"}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.walkinTitle}>Workshop Service Center</Text>
                <Text style={styles.walkinSub}>
                  Main Service Hub, Plot 12, Sector 63, Noida, Uttar Pradesh - 201301
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueBtn}
          activeOpacity={0.8}
          onPress={handleContinue}
        >
          <Text style={styles.btnText}>View Summary & Pay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  scrollContent: { paddingBottom: 120 },

  optionSection: {
    paddingHorizontal: 16,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  typeContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  typeCard: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
  },
  selectedTypeCard: {
    borderColor: Colors.primary || "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  typeText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  selectedTypeText: {
    color: Colors.primary || "#2563EB",
    fontWeight: "700",
  },
  typeSubtext: {
    textAlign: "center",
    fontSize: 12,
    color: "#6B7280",
  },

  walkinCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  walkinTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  walkinSub: { fontSize: 12, color: "#6B7280", marginTop: 2, lineHeight: 18 },

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