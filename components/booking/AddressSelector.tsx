import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

export interface Address {
  id: string;
  tag: "Home" | "Work" | "Other";
  addressLine1: string;
  addressLine2: string;
  landmark?: string;
  isDefault?: boolean;
}

// Dummy Saved Addresses Data
const SAVED_ADDRESSES: Address[] = [
  {
    id: "a1",
    tag: "Home",
    addressLine1: "Flat 402, Royal Palms Apartments",
    addressLine2: "Sector 62, Noida, Uttar Pradesh",
    landmark: "Near Fortis Hospital",
    isDefault: true,
  },
  {
    id: "a2",
    tag: "Work",
    addressLine1: "Tower B, 7th Floor, Tech Park",
    addressLine2: "Electronic City, Noida, Uttar Pradesh",
  },
];

interface AddressSelectorProps {
  selectedAddressId: string;
  onSelectAddress: (id: string) => void;
  onAddNewAddress?: () => void;
}

export default function AddressSelector({
  selectedAddressId,
  onSelectAddress,
  onAddNewAddress,
}: AddressSelectorProps) {
  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Service Location</Text>

        {/* Add New Address Button */}
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.7}
          onPress={onAddNewAddress}
        >
          <Ionicons name="add" size={16} color={Colors.primary} />
          <Text style={styles.addBtnText}>Add New</Text>
        </TouchableOpacity>
      </View>

      {/* Address Cards List */}
      <View style={styles.addressList}>
        {SAVED_ADDRESSES.map((item) => {
          const isSelected = item.id === selectedAddressId;

          // Icon based on tag
          const getTagIcon = () => {
            switch (item.tag) {
              case "Home":
                return "home-outline";
              case "Work":
                return "briefcase-outline";
              default:
                return "location-outline";
            }
          };

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              style={[
                styles.addressCard,
                isSelected && styles.selectedAddressCard,
              ]}
              onPress={() => onSelectAddress(item.id)}
            >
              <View style={styles.cardHeader}>
                {/* Tag & Icon */}
                <View style={styles.tagWrapper}>
                  <Ionicons
                    name={getTagIcon()}
                    size={16}
                    color={isSelected ? Colors.primary : Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.tagText,
                      isSelected && styles.selectedTagText,
                    ]}
                  >
                    {item.tag}
                  </Text>
                </View>

                {/* Radio Circle */}
                <View
                  style={[
                    styles.radioOuter,
                    isSelected && styles.radioOuterSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </View>

              {/* Address Details */}
              <Text style={styles.addressLine1}>{item.addressLine1}</Text>
              <Text style={styles.addressLine2}>{item.addressLine2}</Text>

              {item.landmark && (
                <View style={styles.landmarkWrapper}>
                  <Ionicons
                    name="navigate-outline"
                    size={12}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.landmarkText}>{item.landmark}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.secondary,
  },
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
    color: Colors.primary,
    marginLeft: 2,
  },
  addressList: {
    gap: 12,
  },
  addressCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  selectedAddressCard: {
    borderColor: Colors.primary,
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
    backgroundColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  selectedTagText: {
    color: Colors.primary,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  addressLine1: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },
  addressLine2: {
    fontSize: 12.5,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  landmarkWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  landmarkText: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    fontStyle: "italic",
  },
});