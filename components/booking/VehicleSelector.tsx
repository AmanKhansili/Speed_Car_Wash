import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

// Vehicle Type Definition
export interface Vehicle {
  id: string;
  name: string;
  type: string;
  number: string;
  image: string;
}

// Dummy Vehicles Data
const VEHICLES_DATA: Vehicle[] = [
  {
    id: "v1",
    name: "Hyundai i20",
    type: "Hatchback",
    number: "DL 01 AB 1234",
    image:
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "v2",
    name: "Mahindra Thar",
    type: "SUV",
    number: "UP 16 CD 5678",
    image:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "v3",
    name: "Honda City",
    type: "Sedan",
    number: "HR 26 EF 9012",
    image:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300&auto=format&fit=crop&q=80",
  },
];

interface VehicleSelectorProps {
  selectedVehicleId: string;
  onSelectVehicle: (id: string) => void;
  onAddNewVehicle?: () => void;
}

export default function VehicleSelector({
  selectedVehicleId,
  onSelectVehicle,
  onAddNewVehicle,
}: VehicleSelectorProps) {
  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.titleWithBadge}>
          <Text style={styles.sectionTitle}>Select Vehicle</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{VEHICLES_DATA.length}</Text>
          </View>
        </View>

        {/* Add New Vehicle Button */}
        <TouchableOpacity
          style={styles.addVehicleBtn}
          activeOpacity={0.7}
          onPress={onAddNewVehicle}
        >
          <Ionicons name="add" size={16} color={Colors.primary} />
          <Text style={styles.addVehicleBtnText}>Add New</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Vehicles List */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalListContent}
      >
        {VEHICLES_DATA.map((item) => {
          const isSelected = item.id === selectedVehicleId;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              style={[
                styles.vehicleCard,
                isSelected && styles.selectedVehicleCard,
              ]}
              onPress={() => onSelectVehicle(item.id)}
            >
              {/* Radio Checkbox */}
              <View style={styles.radioWrapper}>
                <View
                  style={[
                    styles.radioOuter,
                    isSelected && styles.radioOuterSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </View>

              {/* Vehicle Image */}
              <Image source={{ uri: item.image }} style={styles.vehicleImage} />

              {/* Vehicle Info */}
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.vehicleType}>{item.type}</Text>

                {/* Number Plate */}
                <View style={styles.numberPlate}>
                  <Text style={styles.numberPlateText}>{item.number}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleWithBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.secondary,
  },
  countBadge: {
    backgroundColor: "#E0E7FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
  },
  addVehicleBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addVehicleBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
    marginLeft: 2,
  },
  horizontalListContent: {
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 4,
  },
  vehicleCard: {
    width: 150,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    position: "relative",
  },
  selectedVehicleCard: {
    borderColor: Colors.primary,
    backgroundColor: "#F0F5FF",
  },
  radioWrapper: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
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
  vehicleImage: {
    width: "100%",
    height: 75,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
    resizeMode: "cover",
  },
  vehicleInfo: {
    alignItems: "flex-start",
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },
  vehicleType: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  numberPlate: {
    backgroundColor: Colors.border,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 8,
  },
  numberPlateText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
});