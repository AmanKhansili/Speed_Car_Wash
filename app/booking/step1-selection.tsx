import Colors from "@/constants/colors";
import Radius from "@/constants/radius";
import Shadow from "@/constants/shadow";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import VehicleSelector from "@/components/booking/VehicleSelector";
import useUser from "@/context/userContext";

// ZUSTAND STORE IMPORT
import { useBookingStore } from "../../store/bookingStore";

export default function Step1SelectionScreen() {
  const router = useRouter();
  const { selectVehicle } = useUser();
  const { selectedServices, removeService, getTotalPrice } = useBookingStore();

  // Step 2 ki tarah clean state (pehle se koi gaadi select nahi hogi)
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");

  const handleVehicleSelect = (id: string) => {
    setSelectedVehicle(id);
    selectVehicle(id);
  };

  // STEP 2 WALA EXACT VALIDATION PATTERN
  const handleContinue = () => {
    if (!selectedVehicle) {
      Alert.alert("Vehicle Required", "Please select or add a vehicle to proceed.");
      return;
    }

    if (selectedServices.length === 0) {
      Alert.alert("Cart Empty", "Please select at least one service to continue.");
      return;
    }

    router.push({
      pathname: "/booking/step2-datetime",
      params: { vehicleId: selectedVehicle },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <VehicleSelector
          selectedVehicleId={selectedVehicle}
          onSelectVehicle={handleVehicleSelect}
        />

        {/* CART REVIEW SECTION */}
        <View style={styles.cartSection}>
          <View style={styles.cartHeader}>
            <Text style={styles.sectionTitle}>Selected Services</Text>
            <TouchableOpacity onPress={() => router.push("/services")}>
              <Text style={styles.addMoreText}>+ Add More</Text>
            </TouchableOpacity>
          </View>

          {selectedServices.length > 0 ? (
            <View style={styles.cartCard}>
              {selectedServices.map((service, index) => (
                <View key={service.id}>
                  <View style={styles.cartItem}>
                    <View style={styles.cartItemLeft}>
                      <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                      <Text style={styles.cartItemTitle}>{service.title}</Text>
                    </View>
                    <View style={styles.cartItemRight}>
                      <Text style={styles.cartItemPrice}>₹{service.price}</Text>
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => removeService(service.id)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {index !== selectedServices.length - 1 && <View style={styles.divider} />}
                </View>
              ))}

              <View style={styles.billTotalRow}>
                <Text style={styles.billTotalText}>Item Total</Text>
                <Text style={styles.billTotalAmount}>₹{getTotalPrice()}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyCart}>
              <Ionicons name="cart-outline" size={40} color="#9CA3AF" />
              <Text style={styles.emptyCartText}>No services selected</Text>
              <TouchableOpacity style={styles.browseBtn} onPress={() => router.push("/services")}>
                <Text style={styles.browseBtnText}>Browse Services</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* BOTTOM BAR */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomTotalContainer}>
          <Text style={styles.bottomTotalLabel}>Total Amount</Text>
          <Text style={styles.bottomTotalValue}>₹{getTotalPrice()}</Text>
        </View>

        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.8}>
          <Text style={styles.continueBtnText}>Date & Time</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" },
  scrollContent: { padding: 16, paddingBottom: 120 },

  cartSection: { marginTop: 24 },
  cartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: Colors.text },
  addMoreText: { fontSize: 14, fontWeight: "700", color: Colors.primary },
  cartCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 16,
    ...Shadow.light,
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  cartItemLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  cartItemTitle: { fontSize: 15, fontWeight: "600", color: Colors.text, flexShrink: 1 },
  cartItemRight: { flexDirection: "row", alignItems: "center", gap: 16 },
  cartItemPrice: { fontSize: 15, fontWeight: "700", color: Colors.text },
  deleteBtn: { padding: 4, backgroundColor: "#FEE2E2", borderRadius: Radius.md },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
  billTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    borderStyle: "dashed",
  },
  billTotalText: { fontSize: 14, fontWeight: "600", color: Colors.textSecondary },
  billTotalAmount: { fontSize: 18, fontWeight: "800", color: Colors.text },

  emptyCart: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 32,
    alignItems: "center",
    ...Shadow.light,
  },
  emptyCartText: { fontSize: 15, color: Colors.textSecondary, marginTop: 12, marginBottom: 16 },
  browseBtn: {
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.round,
  },
  browseBtnText: { color: Colors.primary, fontWeight: "700" },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  bottomTotalContainer: { flex: 1 },
  bottomTotalLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: "600" },
  bottomTotalValue: { fontSize: 20, fontWeight: "900", color: Colors.text },

  continueBtn: {
    backgroundColor: Colors.primary || "#2563EB",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: Radius.round,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  continueBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
