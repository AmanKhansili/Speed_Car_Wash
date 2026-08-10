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

export interface Vehicle {
  id: string;
  name: string;
  type: string;
  number: string;
  image: string;
}

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

interface MyVehiclesSectionProps {
  onAddCarPress?: () => void;
  onCarPress?: (car: Vehicle) => void;
}

export default function MyVehiclesSection({
  onAddCarPress,
  onCarPress,
}: MyVehiclesSectionProps) {
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
          <Ionicons name="add" size={16} color={Colors.primary} />
          <Text style={styles.addBtnText}>Add Car</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {VEHICLES_DATA.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.85}
            style={styles.carCard}
            onPress={() => onCarPress && onCarPress(item)}
          >
            {/* Car Image */}
            <Image source={{ uri: item.image }} style={styles.carImage} />

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
                <Text style={styles.plateNumber}>{item.number}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionHeader: {
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
    color: Colors.primary,
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
});