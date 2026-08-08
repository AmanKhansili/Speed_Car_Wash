import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

export interface Service {
  id: string;
  title: string;
  duration: string;
  price: string;
  description: string;
  isPopular?: boolean;
}

// Dummy Services Data
const SERVICES_DATA: Service[] = [
  {
    id: "s1",
    title: "Exterior Wash & Polish",
    duration: "45 Mins",
    price: "₹299",
    description: "Pressure water wash, tire dressing, and wax finish.",
  },
  {
    id: "s2",
    title: "Deep Interior Cleaning",
    duration: "1.5 Hours",
    price: "₹599",
    description: "Seat vacuuming, dashboard polish, and door panel sanitization.",
    isPopular: true,
  },
  {
    id: "s3",
    title: "Full Car Detailing",
    duration: "3 Hours",
    price: "₹1,299",
    description: "Complete interior + exterior foam wash, ceramic spray coat.",
  },
];

interface ServiceSelectorProps {
  selectedServiceId: string;
  onSelectService: (id: string) => void;
}

export default function ServiceSelector({
  selectedServiceId,
  onSelectService,
}: ServiceSelectorProps) {
  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Choose Service Package</Text>
      </View>

      {/* Services List */}
      <View style={styles.listContainer}>
        {SERVICES_DATA.map((item) => {
          const isSelected = item.id === selectedServiceId;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              style={[
                styles.serviceCard,
                isSelected && styles.selectedServiceCard,
              ]}
              onPress={() => onSelectService(item.id)}
            >
              {/* Popular Badge */}
              {item.isPopular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>POPULAR</Text>
                </View>
              )}

              {/* Top Row: Radio Button + Title + Price */}
              <View style={styles.cardHeader}>
                <View style={styles.titleWrapper}>
                  {/* Radio Box */}
                  <View
                    style={[
                      styles.radioOuter,
                      isSelected && styles.radioOuterSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>

                  {/* Title & Duration */}
                  <View style={styles.titleTextContainer}>
                    <Text style={styles.serviceTitle}>{item.title}</Text>
                    <View style={styles.durationChip}>
                      <Ionicons
                        name="time-outline"
                        size={12}
                        color={Colors.textSecondary}
                      />
                      <Text style={styles.durationText}>{item.duration}</Text>
                    </View>
                  </View>
                </View>

                {/* Price */}
                <Text style={styles.servicePrice}>{item.price}</Text>
              </View>

              {/* Description */}
              <Text style={styles.descriptionText}>{item.description}</Text>
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
    marginBottom: 20,
    // marginTop: 50,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.secondary,
  },
  listContainer: {
    gap: 12,
  },
  serviceCard: {
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
    position: "relative",
    overflow: "hidden",
  },
  selectedServiceCard: {
    borderColor: Colors.primary,
    backgroundColor: "#F0F5FF",
  },
  popularBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderBottomLeftRadius: 10,
  },
  popularBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#D97706",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  titleWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    marginRight: 12,
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
  titleTextContainer: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },
  durationChip: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  durationText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
    marginLeft: 8,
  },
  descriptionText: {
    fontSize: 12.5,
    color: Colors.textSecondary,
    marginTop: 10,
    lineHeight: 18,
    paddingLeft: 32,
  },
});