/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import Colors from "@/constants/colors";
import { Address, AddressSelectorProps } from "@/types/service";

export const SAVED_ADDRESSES: Address[] = [
];

export default function AddressSelector({
  selectedAddressId,
  onSelectAddress,
}: AddressSelectorProps) {
  const [addresses, setAddresses] = useState<Address[]>(SAVED_ADDRESSES);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const [tag, setTag] = useState<"Home" | "Work" | "Other">("Home");
  const [addressLine1, setAddressLine1] = useState("");
  const [landmark, setLandmark] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // 1. Fetch Current Location (GPS)
  const handleUseCurrentLocation = async () => {
    try {
      setIsLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required to fetch current location.");
        setIsLocating(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude: lat, longitude: lng } = currentLocation.coords;

      const geocode = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });

      if (geocode.length > 0) {
        const item = geocode[0];
        const line1 = [item.formattedAddress].filter(Boolean).join(", ");

        setAddressLine1(line1 || "Current Location");
        setLatitude(lat);
        setLongitude(lng);
        setIsModalVisible(true);
      }
    } catch (error) {
      Alert.alert("Location Error", "Could not fetch current location. Please fill manually.");
    } finally {
      setIsLocating(false);
    }
  };

  // 2. Save New Address
  const handleSaveAddress = () => {
    if (!addressLine1.trim()) {
      Alert.alert("Missing Details", "Please fill Address Line 1.");
      return;
    }

    const newAddress: Address = {
      id: Date.now().toString(),
      tag,
      addressLine1,
      landmark: landmark.trim() || undefined,
      latitude: latitude ?? undefined,
      longitude: longitude ?? undefined,
    };

    setAddresses((prev) => [newAddress, ...prev]);
    onSelectAddress(newAddress.id);

    // Reset & Close Modal
    setAddressLine1("");
    setLandmark("");
    setTag("Home");
    setLatitude(null);
    setLongitude(null);
    setIsModalVisible(false);
  };

  const getTagIcon = (tagType?: string) => {
    switch (tagType) {
      case "Home": return "home-outline";
      case "Work": return "briefcase-outline";
      default: return "location-outline";
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Actions */}
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <Ionicons name="location-sharp" size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Select Pickup Address</Text>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.7}
          onPress={() => setIsModalVisible(true)}
        >
          <Ionicons name="add" size={16} color={Colors.primary} />
          <Text style={styles.addBtnText}>Add New</Text>
        </TouchableOpacity>
      </View>

      {/* GPS Fetch Button */}
      <TouchableOpacity
        style={styles.currentLocBtn}
        activeOpacity={0.8}
        onPress={handleUseCurrentLocation}
        disabled={isLocating}
      >
        {isLocating ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <>
            <MaterialIcons name="my-location" size={18} color={Colors.primary} />
            <Text style={styles.currentLocText}>Use Current Location</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Address Cards List */}
      <View style={styles.addressList}>
        {addresses.map((item) => {
          const isSelected = item.id === selectedAddressId;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              style={[styles.addressCard, isSelected && styles.selectedAddressCard]}
              onPress={() => onSelectAddress(item.id)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.tagWrapper}>
                  <Ionicons
                    name={getTagIcon(item.tag)}
                    size={14}
                    color={isSelected ? Colors.primary : Colors.textSecondary}
                  />
                  <Text style={[styles.tagText, isSelected && styles.selectedTagText]}>
                    {item.tag}
                  </Text>
                </View>

                {/* Radio Circle */}
                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </View>

              <Text style={styles.addressLine1}>{item.addressLine1}</Text>

              {item.landmark && (
                <View style={styles.landmarkWrapper}>
                  <Ionicons name="navigate-outline" size={12} color={Colors.textSecondary} />
                  <Text style={styles.landmarkText}>{item.landmark}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ADD ADDRESS MODAL FORM */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Address Details</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Tag Selection */}
              <Text style={styles.inputLabel}>Save Address As</Text>
              <View style={styles.tagContainer}>
                {(["Home", "Work", "Other"] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.tagChip, tag === type && styles.selectedTagChip]}
                    onPress={() => setTag(type)}
                  >
                    <Text style={[styles.tagChipText, tag === type && styles.selectedTagChipText]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Address Line 1 - Textarea (multiline) */}
              <Text style={styles.inputLabel}>Address Line 1 *</Text>
              <TextInput
                style={styles.textArea}
                placeholder="House/Flat No, Building, Street, Area"
                placeholderTextColor="#9CA3AF"
                value={addressLine1}
                onChangeText={setAddressLine1}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {/* Landmark - Simple single-line input */}
              <Text style={styles.inputLabel}>Landmark (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Near Fortis Hospital"
                placeholderTextColor="#9CA3AF"
                value={landmark}
                onChangeText={setLandmark}
              />

              <TouchableOpacity
                style={styles.saveBtn}
                activeOpacity={0.8}
                onPress={handleSaveAddress}
              >
                <Text style={styles.saveBtnText}>Save Address</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 10 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addBtnText: { fontSize: 13, fontWeight: "600", color: Colors.primary, marginLeft: 2 },

  /* Current Location Button */
  currentLocBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  currentLocText: { fontSize: 14, fontWeight: "700", color: Colors.primary },

  /* Address Card Styles */
  addressList: { gap: 10 },
  addressCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  selectedAddressCard: { borderColor: Colors.primary, backgroundColor: "#F0F5FF" },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  tagWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  tagText: { fontSize: 12, fontWeight: "700", color: Colors.textSecondary },
  selectedTagText: { color: Colors.primary },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: { borderColor: Colors.primary },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  addressLine1: { fontSize: 14, fontWeight: "700", color: "#111827" },
  addressLine2: { fontSize: 12.5, color: Colors.textSecondary, marginTop: 2 },
  landmarkWrapper: { flexDirection: "row", alignItems: "center", marginTop: 6, gap: 4 },
  landmarkText: { fontSize: 11.5, color: Colors.textSecondary, fontStyle: "italic" },

  /* Modal Form Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  inputLabel: { fontSize: 13, fontWeight: "600", color: "#374151", marginTop: 12, marginBottom: 6 },

  /* Simple single-line input (Landmark) */
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },

  /* Multiline textarea (Address Line 1) */
  textArea: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    height: 100,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },

  tagContainer: { flexDirection: "row", gap: 10, marginBottom: 6 },
  tagChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: "#F9FAFB",
  },
  selectedTagChip: { borderColor: Colors.primary, backgroundColor: "#EFF6FF" },
  tagChipText: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary },
  selectedTagChipText: { color: Colors.primary },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  saveBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
});
