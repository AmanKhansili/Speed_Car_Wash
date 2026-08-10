import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

export interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  bgColor?: string;
  isDanger?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: "bookings",
    title: "My Bookings",
    subtitle: "View and manage your bookings",
    icon: "calendar-outline",
    bgColor: "#b3d2f4",
  },
  {
    id: "membership",
    title: "Membership & Plans",
    subtitle: "Manage your membership",
    icon: "ribbon-outline",
    bgColor: "#b3d2f4",
  },
  {
    id: "payments",
    title: "Payment Methods",
    subtitle: "Cards, UPI & Wallets",
    icon: "card-outline",
    bgColor: "#b3d2f4",
  },
  {
    id: "vehicles",
    title: "My Vehicles",
    subtitle: "Manage your cars",
    icon: "car-outline",
    bgColor: "#b3d2f4",
  },
  {
    id: "saved_services",
    title: "Saved Services",
    subtitle: "Your favorite services",
    icon: "heart-outline",
    bgColor: "#b3d2f4",
  },
  {
    id: "referral",
    title: "Refer & Earn",
    subtitle: "Invite friends and earn rewards",
    icon: "gift-outline",
    bgColor: "#b3d2f4",
  },
];

const SECONDARY_ITEMS: MenuItem[] = [
  {
    id: "support",
    title: "Help & Support",
    subtitle: "FAQs, Chat & more",
    icon: "headset-outline",
    iconColor: "#64748B",
    bgColor: "#F1F5F9",
  },
  {
    id: "logout",
    title: "Logout",
    subtitle: "Sign out from your account",
    icon: "log-out-outline",
    iconColor: "#DC2626",
    bgColor: "#FEF2F2",
    isDanger: true,
  },
];

interface ProfileMenuListProps {
  onItemPress?: (id: string) => void;
}

export default function ProfileMenuList({ onItemPress }: ProfileMenuListProps) {
  const handlePress = (id: string) => {
    if (onItemPress) onItemPress(id);
  };

  return (
    <View style={styles.container}>
      {/* Primary Menu Group */}
      <View style={styles.menuGroup}>
        {MENU_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            style={[
              styles.menuItem,
              index !== MENU_ITEMS.length - 1 && styles.borderBottom,
            ]}
            onPress={() => handlePress(item.id)}
          >
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: item.bgColor || "#78b7ef" },
              ]}
            >
              <Ionicons
                name={item.icon}
                size={18}
                color={Colors.primary}
              />
            </View>

            <View style={styles.textWrapper}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>

            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Secondary Menu Group (Support & Logout) */}
      <View style={[styles.menuGroup, styles.secondaryGroup]}>
        {SECONDARY_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            style={[
              styles.menuItem,
              index !== SECONDARY_ITEMS.length - 1 && styles.borderBottom,
            ]}
            onPress={() => handlePress(item.id)}
          >
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: item.bgColor || "#F1F5F9" },
              ]}
            >
              <Ionicons name={item.icon} size={18} color={item.iconColor} />
            </View>

            <View style={styles.textWrapper}>
              <Text
                style={[
                  styles.menuTitle,
                  item.isDanger && styles.dangerTitle,
                ]}
              >
                {item.title}
              </Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>

            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    marginBottom: 50,
  },
  menuGroup: {
    borderRadius: 18,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
  },
  secondaryGroup: {
    marginTop: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border || "#F1F5F9",
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  textWrapper: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: Colors.text || "#0F172A",
  },
  dangerTitle: {
    color: "#DC2626",
  },
  menuSubtitle: {
    fontSize: 11.5,
    color: Colors.textSecondary || "#64748B",
    marginTop: 2,
  },
});