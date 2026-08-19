/* eslint-disable @typescript-eslint/no-unused-vars */
import Colors from "@/constants/colors";
import { Address, AddressSelectorProps } from "@/types/service";
import { createClerkSupabaseClient } from "@/utils/supabase";
import { useAuth } from "@clerk/expo";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddressSelector({
  selectedAddressId,
  onSelectAddress,
}: AddressSelectorProps) {
  const { userId: clerkUserId, getToken } = useAuth();

  const supabase = useMemo(() => createClerkSupabaseClient(getToken), [getToken]);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [tag, setTag] = useState<"Home" | "Work" | "Other">("Home");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // Fetch saved addresses & auto-select first or matching
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!clerkUserId) {
        setIsFetching(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("addresses")
          .select("id, tag, address_line_1, landmark, latitude, longitude")
          .eq("clerk_user_id", clerkUserId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Fetch Addresses Error:", error);
          return;
        }

        const addressList = (data as Address[]) ?? [];
        setAddresses(addressList);

        // Auto select first address if none is selected
        if (!selectedAddressId && addressList.length > 0) {
          onSelectAddress(addressList[0].id, addressList[0].address_line_1);
        }
      } finally {
        setIsFetching(false);
      }
    };

    fetchAddresses();
  }, [clerkUserId]);

  const handleUseCurrentLocation = async () => {
    try {
      setIsLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to fetch current location.",
        );
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

        setAddress(line1 || "Current Location");
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

  const handleSaveAddress = async () => {
    if (!address.trim()) {
      Alert.alert("Missing Details", "Please fill Address.");
      return;
    }
    if (!clerkUserId) {
      Alert.alert("Error", "You must be logged in to save an address.");
      return;
    }

    try {
      setIsSaving(true);

      const { data, error } = await supabase
        .from("addresses")
        .insert({
          clerk_user_id: clerkUserId,
          tag,
          address_line_1: address.trim(),
          landmark: landmark.trim() || null,
          latitude,
          longitude,
        })
        .select("id, tag, address_line_1, landmark, latitude, longitude")
        .single();

      if (error || !data) {
        console.error("Save Address Error:", error);
        Alert.alert("Error", "Could not save address. Please try again.");
        return;
      }

      const savedAddress = data as Address;
      setAddresses((prev) => [savedAddress, ...prev]);
      onSelectAddress(savedAddress.id, savedAddress.address_line_1);

      setAddress("");
      setLandmark("");
      setTag("Home");
      setLatitude(null);
      setLongitude(null);
      setIsModalVisible(false);
    } finally {
      setIsSaving(false);
    }
  };

  const getTagIcon = (tagType?: string) => {
    switch (tagType) {
      case "Home":
        return "home-outline";
      case "Work":
        return "briefcase-outline";
      default:
        return "location-outline";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <Ionicons name="location-sharp" size={20} color={Colors.primary || "#2563EB"} />
          <Text style={styles.sectionTitle}>Select Pickup Address</Text>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.7}
          onPress={() => setIsModalVisible(true)}
        >
          <Ionicons name="add" size={16} color={Colors.primary || "#2563EB"} />
          <Text style={styles.addBtnText}>Add New</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.currentLocBtn}
        activeOpacity={0.8}
        onPress={handleUseCurrentLocation}
        disabled={isLocating}
      >
        {isLocating ? (
          <ActivityIndicator size="small" color={Colors.primary || "#2563EB"} />
        ) : (
          <>
            <MaterialIcons name="my-location" size={18} color={Colors.primary || "#2563EB"} />
            <Text style={styles.currentLocText}>Use Current Location</Text>
          </>
        )}
      </TouchableOpacity>

      {isFetching ? (
        <ActivityIndicator
          size="small"
          color={Colors.primary || "#2563EB"}
          style={{ marginTop: 12 }}
        />
      ) : (
        <View style={styles.addressList}>
          {addresses.map((item) => {
            const isSelected = item.id === selectedAddressId;

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                style={[styles.addressCard, isSelected && styles.selectedAddressCard]}
                onPress={() => onSelectAddress(item.id, item.address_line_1)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.tagWrapper}>
                    <Ionicons
                      name={getTagIcon(item.tag)}
                      size={14}
                      color={
                        isSelected ? Colors.primary || "#2563EB" : Colors.textSecondary || "#6B7280"
                      }
                    />
                    <Text style={[styles.tagText, isSelected && styles.selectedTagText]}>
                      {item.tag}
                    </Text>
                  </View>

                  <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </View>

                <Text style={styles.addressLine1}>{item.address_line_1}</Text>

                {item.landmark && (
                  <View style={styles.landmarkWrapper}>
                    <Ionicons
                      name="navigate-outline"
                      size={12}
                      color={Colors.textSecondary || "#6B7280"}
                    />
                    <Text style={styles.landmarkText}>{item.landmark}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {addresses.length === 0 && (
            <Text style={styles.emptyAddressText}>
              No saved addresses yet — tap &ldquo;Add New&rdquo; to add one.
            </Text>
          )}
        </View>
      )}

      {/* MODAL */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Address Details</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary || "#6B7280"} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
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

              <Text style={styles.inputLabel}>Address*</Text>
              <TextInput
                style={styles.textArea}
                placeholder="House/Flat No, Building, Street, Area"
                placeholderTextColor="#9CA3AF"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <Text style={styles.inputLabel}>Landmark (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Near Fortis Hospital"
                placeholderTextColor="#9CA3AF"
                value={landmark}
                onChangeText={setLandmark}
              />

              <TouchableOpacity
                style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
                activeOpacity={0.8}
                onPress={handleSaveAddress}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Address</Text>
                )}
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
  addBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary || "#2563EB",
    marginLeft: 2,
  },
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
  currentLocText: { fontSize: 14, fontWeight: "700", color: Colors.primary || "#2563EB" },
  addressList: { gap: 10 },
  addressCard: {
    backgroundColor: Colors.surface || "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.border || "#E5E7EB",
  },
  selectedAddressCard: {
    borderColor: Colors.primary || "#2563EB",
    backgroundColor: "#F0F5FF",
  },
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
  tagText: { fontSize: 12, fontWeight: "700", color: Colors.textSecondary || "#6B7280" },
  selectedTagText: { color: Colors.primary || "#2563EB" },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.border || "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: { borderColor: Colors.primary || "#2563EB" },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary || "#2563EB",
  },
  addressLine1: { fontSize: 13, color: Colors.text || "#111827", marginTop: 2, fontWeight: "500" },
  landmarkWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  landmarkText: {
    fontSize: 11.5,
    color: Colors.textSecondary || "#6B7280",
    fontStyle: "italic",
  },
  emptyAddressText: {
    fontSize: 13,
    color: Colors.textSecondary || "#6B7280",
    fontStyle: "italic",
    paddingVertical: 8,
  },
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
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border || "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: Colors.border || "#E5E7EB",
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
    borderColor: Colors.border || "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  selectedTagChip: { borderColor: Colors.primary || "#2563EB", backgroundColor: "#EFF6FF" },
  tagChipText: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary || "#6B7280" },
  selectedTagChipText: { color: Colors.primary || "#2563EB" },
  saveBtn: {
    backgroundColor: Colors.primary || "#2563EB",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  saveBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
});
