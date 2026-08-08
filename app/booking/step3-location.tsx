// app/booking/step3-location.tsx
import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useBooking } from "@/context/BookingContext";
import AddressSelector from "@/components/booking/AddressSelector";
import Colors from "@/constants/colors";

// Dummy Addresses Data (Jaise aapke AddressSelector me hoga)
const ADDRESSES_DATA = [
  { id: "a1", fullAddress: "H.No 123, Sector 62, Noida, UP" },
  { id: "a2", fullAddress: "Flat 402, Sunshine Apartments, Indirapuram, Ghaziabad" },
];

export default function Step3LocationScreen() {
  const router = useRouter();
  const { bookingData, updateBooking } = useBooking();

  const [selectedAddressId, setSelectedAddressId] = useState(bookingData.address || "");

  const handleContinue = () => {
    // 1. Selected ID ke basis par full address text find karein
    const selectedItem = ADDRESSES_DATA.find((item) => item.id === selectedAddressId);
    
    // 2. ID aur Text dono context me update karein
    updateBooking({
      address: selectedAddressId,
      addressText: selectedItem ? selectedItem.fullAddress : selectedAddressId,
    });

    router.push("/booking/summary");
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AddressSelector
          selectedAddressId={selectedAddressId}
          onSelectAddress={(id) => setSelectedAddressId(id)}
          onAddNewAddress={() => console.log("Add address")}
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.btnText}>View Summary & Pay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  scrollContent: { paddingBottom: 100 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: "#FFF", borderTopWidth: 1, borderColor: Colors.border },
  continueBtn: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  btnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});