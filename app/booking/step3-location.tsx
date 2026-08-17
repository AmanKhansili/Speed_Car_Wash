import AddressSelector from "@/components/booking/AddressSelector";
import Colors from "@/constants/colors";
import useUser from "@/context/userContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Step3LocationScreen() {
  const router = useRouter();
  const { userData, updatePhone } = useUser();

  const params = useLocalSearchParams<{
    vehicleId?: string;
    serviceId?: string;
    date?: string;
  }>();

  const [serviceType, setServiceType] = useState<"pickup" | "walkin">("pickup");

  // Address States
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [addressText, /*setAddressText*/] = useState<string>("");

  const [phone, setPhone] = useState<string>(userData.mobileNumber || "");

  useEffect(() => {
    if (userData.mobileNumber && !phone) {
      setPhone(userData.mobileNumber);
    }
  }, [userData.mobileNumber]);

  const handleContinue = async () => {
    // 1. Phone number validation
    if (!phone || phone.trim().length !== 10) {
      Alert.alert("Invalid Phone", "Please enter a valid 10-digit mobile number.");
      return;
    }

    let fullAddressText = "Walk-in at Workshop Center";

    // 2. Service type & Address validation
    if (serviceType === "pickup") {
      if (!selectedAddressId) {
        Alert.alert("Address Required", "Please select a pickup address to proceed.");
        return;
      }
      fullAddressText = addressText || "Selected Pickup Address";
    }

    try {
      if (phone !== userData.mobileNumber) {
        await updatePhone(phone);
      }
    } catch (e) {
      console.log("Error updating phone:", e);
    }

    // 3. Navigate to Summary/Payment screen with params
    router.push({
      pathname: "/booking/summary",
      params: {
        ...params,
        serviceType,
        addressId: serviceType === "pickup" ? selectedAddressId : "walkin",
        addressText: fullAddressText,
        phone,
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
        {/* Service Type Selection (Pickup vs Walk-in) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select Service Type</Text>
          <View style={styles.toggleWrapper}>
            <TouchableOpacity
              style={[styles.toggleBtn, serviceType === "pickup" && styles.toggleBtnActive]}
              activeOpacity={0.8}
              onPress={() => setServiceType("pickup")}
            >
              <Ionicons
                name="car-outline"
                size={18}
                color={serviceType === "pickup" ? "#FFF" : Colors.textSecondary || "#6B7280"}
              />
              <Text
                style={[styles.toggleText, serviceType === "pickup" && styles.toggleTextActive]}
              >
                Doorstep Pickup
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, serviceType === "walkin" && styles.toggleBtnActive]}
              activeOpacity={0.8}
              onPress={() => setServiceType("walkin")}
            >
              <Ionicons
                name="walk-outline"
                size={18}
                color={serviceType === "walkin" ? "#FFF" : Colors.textSecondary || "#6B7280"}
              />
              <Text
                style={[styles.toggleText, serviceType === "walkin" && styles.toggleTextActive]}
              >
                Walk-in Center
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Conditional Address or Workshop Info */}
        {serviceType === "pickup" ? (
          <AddressSelector
            selectedAddressId={selectedAddressId}
            onSelectAddress={(id) => {
              setSelectedAddressId(id);
            }}
            onAddNewAddress={() => console.log("Add New Address modal/screen")}
          />
        ) : (
          <View style={styles.walkinCard}>
            <Ionicons name="location-sharp" size={24} color={Colors.primary || "#2563EB"} />
            <View style={{ flex: 1 }}>
              <Text style={styles.walkinTitle}>Workshop Address</Text>
              <Text style={styles.walkinSub}>
                Main Service Hub, Plot 12, Sector 63, Noida, Uttar Pradesh - 201301
              </Text>
            </View>
          </View>
        )}

        {/* Mobile Number Input Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Contact Mobile Number</Text>
          <Text style={styles.sectionSub}>We will send updates and booking confirmation here.</Text>

          <View style={styles.phoneInputWrapper}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="Enter 10-digit number"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueBtn} activeOpacity={0.8} onPress={handleContinue}>
          <Text style={styles.btnText}>View Summary & Pay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 },

  sectionContainer: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.secondary || "#111827",
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    color: Colors.textSecondary || "#6B7280",
    marginBottom: 12,
  },

  toggleWrapper: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 4,
    marginTop: 8,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  toggleBtnActive: {
    backgroundColor: Colors.primary || "#2563EB",
    shadowColor: Colors.primary || "#2563EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary || "#6B7280",
  },
  toggleTextActive: { color: "#FFF" },

  walkinCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  walkinTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.secondary || "#111827",
  },
  walkinSub: {
    fontSize: 12,
    color: Colors.textSecondary || "#6B7280",
    marginTop: 2,
    lineHeight: 18,
  },

  phoneInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border || "#E5E7EB",
    borderRadius: 12,
    backgroundColor: Colors.surface || "#FAFAFA",
    overflow: "hidden",
  },
  countryCode: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: Colors.border || "#E5E7EB",
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text || "#111827",
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text || "#111827",
  },

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
