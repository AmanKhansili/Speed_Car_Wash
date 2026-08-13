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
  totalBookings = 0,
  completed = 0,
  upcoming = 0,
  savedServices = 0,
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
      {statsList.map((item, index) => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.7}
          style={[
            styles.statCard,
            index !== statsList.length - 1 && styles.borderRight,
          ]}
          onPress={() => onStatPress && onStatPress(item.id)}
        >
          <Ionicons
            name={item.icon}
            size={18}
            color={Colors.primary || "#6366F1"}
            style={styles.icon}
          />
          <Text style={styles.statCount}>{item.count}</Text>
          <Text style={styles.statLabel} numberOfLines={1}>
            {item.label}
          </Text>
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
    paddingHorizontal: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border || "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  borderRight: {
    borderRightWidth: 1,
    borderRightColor: Colors.border || "#F1F5F9",
  },
  icon: {
    marginBottom: 4,
  },
  statCount: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text || "#0F172A",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.textSecondary || "#64748B",
    textAlign: "center",
  },
});