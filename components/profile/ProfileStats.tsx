import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

interface ProfileStatsProps {
  totalBookings?: number;
  completed?: number;
  upcoming?: number;
  savedServices?: number;
  onStatPress?: (type: string) => void;
}

export default function ProfileStats({
  totalBookings = 12,
  completed = 7,
  upcoming = 3,
  savedServices = 2,
  onStatPress,
}: ProfileStatsProps) {
  const statsList = [
    {
      id: "total",
      label: "Total Bookings",
      count: totalBookings,
      icon: "calendar-outline" as const,
    },
    {
      id: "completed",
      label: "Completed",
      count: completed,
      icon: "checkmark-circle-outline" as const,
    },
    {
      id: "upcoming",
      label: "Upcoming",
      count: upcoming,
      icon: "time-outline" as const,
    },
    {
      id: "saved",
      label: "Saved Services",
      count: savedServices,
      icon: "heart-outline" as const,
    },
  ];

  return (
    <View style={styles.statsContainer}>
      {statsList.map((item) => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.7}
          style={styles.statCard}
          onPress={() => onStatPress && onStatPress(item.id)}
        >
          <Ionicons
            name={item.icon}
            size={20}
            color={Colors.primary}
            style={styles.icon}
          />
          <Text style={styles.statCount}>{item.count}</Text>
          <Text style={styles.statLabel}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface || "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border || "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  icon: {
    marginBottom: 6,
  },
  statCount: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text || "#0F172A",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10.5,
    fontWeight: "600",
    color: Colors.textSecondary || "#64748B",
    textAlign: "center",
  },
});