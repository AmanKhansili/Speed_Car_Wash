import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import useUser from "@/context/userContext";
import { Vehicle as UserVehicle } from "@/types/user";

export interface Vehicle {
  id: string;
  name: string;      // e.g. "Hyundai i20"
  type: string;      // e.g. "Hatchback", "SUV"
  number: string;    // e.g. "UP 16 AB 1234"
  image?: string;
}

interface MyVehiclesSectionProps {
  vehicles?: Vehicle[];
  onAddCarPress?: () => void;
  onCarPress?: (car: Vehicle) => void;
}

const DEFAULT_CAR_IMAGE =
  "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=300&auto=format&fit=crop&q=80";

export default function MyVehiclesSection({
  vehicles: propVehicles,
  onAddCarPress,
  onCarPress,
}: MyVehiclesSectionProps) {
  const { userData } = useUser();

  // Agar parent component props se list nahi de raha, toh direct User Context se map karo
  const vehiclesToDisplay: Vehicle[] =
    propVehicles ||
    (userData.vehicles || []).map((v: UserVehicle) => ({
      id: v.id,
      name: `${v.brand} ${v.model}`,
      type: v.category,
      number: v.registrationNumber,
      image: DEFAULT_CAR_IMAGE,
    }));

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Vehicles</Text>
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.7}
          onPress={onAddCarPress}
        >
          <Ionicons name="add" size={16} color={Colors.primary || "#2563EB"} />
          <Text style={styles.addBtnText}>Add Car</Text>
        </TouchableOpacity>
      </View>

      {/* Empty State */}
      {vehiclesToDisplay.length === 0 ? (
        <TouchableOpacity
          style={styles.emptyCard}
          activeOpacity={0.8}
          onPress={onAddCarPress}
        >
          <Ionicons name="car-outline" size={32} color={Colors.primary || "#2563EB"} />
          <Text style={styles.emptyTitle}>No vehicles added yet</Text>
          <Text style={styles.emptySubText}>Tap here to add your first car</Text>
        </TouchableOpacity>
      ) : (
        /* Horizontal Vehicle List */
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {vehiclesToDisplay.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              style={styles.carCard}
              onPress={() => onCarPress && onCarPress(item)}
            >
              {/* Car Image */}
              <Image
                source={{ uri: item.image || DEFAULT_CAR_IMAGE }}
                style={styles.carImage}
              />

              {/* Car Info */}
              <View style={styles.carDetails}>
                <View style={styles.topRow}>
                  <Text style={styles.carName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{item.type}</Text>
                  </View>
                </View>

                {/* Plate Number */}
                <View style={styles.plateContainer}>
                  <Ionicons
                    name="car-sport-outline"
                    size={12}
                    color={Colors.textSecondary || "#64748B"}
                  />
                  <Text style={styles.plateNumber}>
                    {item.number !== "NOT SPECIFIED" ? item.number : "No Reg. No."}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionHeader: {
    paddingHorizontal:10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text || "#0F172A",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f0ff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary || "#2563EB",
    marginLeft: 2,
  },
  scrollContainer: {
    paddingRight: 16,
    gap: 12,
  },
  carCard: {
    width: 210,
    backgroundColor: Colors.surface || "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border || "#F1F5F9",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  carImage: {
    width: "100%",
    height: 105,
    backgroundColor: "#F1F5F9",
  },
  carDetails: {
    padding: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  carName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text || "#0F172A",
    flex: 1,
  },
  typeBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.textSecondary || "#64748B",
  },
  plateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  plateNumber: {
    fontSize: 11.5,
    fontWeight: "600",
    color: Colors.textSecondary || "#64748B",
    letterSpacing: 0.5,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text || "#0F172A",
    marginTop: 8,
  },
  emptySubText: {
    fontSize: 12,
    color: Colors.textSecondary || "#64748B",
    marginTop: 2,
  },
});