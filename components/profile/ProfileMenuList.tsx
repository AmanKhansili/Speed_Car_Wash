import Colors from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: string;
  iconColor?: string;
  bgColor?: string;
  isDanger?: boolean;
}

const PRIMARY_ITEMS: MenuItem[] = [
  {
    id: "bookings",
    title: "My Bookings",
    subtitle: "View and manage your bookings",
    icon: "calendar-outline",
    route: "/bookings",
    bgColor: "#EEF2FF",
  },
  {
    id: "membership",
    title: "Membership & Plans",
    subtitle: "Manage your membership",
    icon: "ribbon-outline",
    route: "/membership",
    bgColor: "#EEF2FF",
  },
  // {
  //   id: "payments",
  //   title: "Payment Methods",
  //   subtitle: "Cards, UPI & Wallets",
  //   icon: "card-outline",
  //   route: "/payments",
  //   bgColor: "#EEF2FF",
  // },
  // {
  //   id: "vehicles",
  //   title: "My Vehicles",
  //   subtitle: "Manage your cars",
  //   icon: "car-outline",
  //   route: "/vehicles",
  //   bgColor: "#EEF2FF",
  // },
  // {
  //   id: "saved_services",
  //   title: "Saved Services",
  //   subtitle: "Your favorite services",
  //   icon: "heart-outline",
  //   route: "/saved-services",
  //   bgColor: "#EEF2FF",
  // },
  {
    id: "referral",
    title: "Refer & Earn",
    subtitle: "Invite friends and earn rewards",
    icon: "gift-outline",
    route: "/referral",
    bgColor: "#EEF2FF",
  },
];

const SECONDARY_ITEMS: MenuItem[] = [
  {
    id: "support",
    title: "Help & Support",
    subtitle: "FAQs, Chat & more",
    icon: "headset-outline",
    route: "/HelpSupport",
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
  onLogoutPress?: () => void;
}

export default function ProfileMenuList({ onItemPress, onLogoutPress }: ProfileMenuListProps) {
  const router = useRouter();

  const handlePress = (item: MenuItem) => {
    if (onItemPress) {
      onItemPress(item.id);
    }

    if (item.id === "logout") {
      if (onLogoutPress) onLogoutPress();
      return;
    }

    if (item.route) {
      router.push(item.route as any);
    }
  };

  return (
    <View style={styles.container}>
      {/* Primary Menu Group */}
      <View style={styles.menuGroup}>
        {PRIMARY_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            style={[styles.menuItem, index !== PRIMARY_ITEMS.length - 1 && styles.borderBottom]}
            onPress={() => handlePress(item)}
          >
            <View style={[styles.iconBadge, { backgroundColor: item.bgColor || "#EEF2FF" }]}>
              <Ionicons
                name={item.icon}
                size={18}
                color={item.iconColor || Colors.primary || "#6366F1"}
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
      <View style={styles.menuGroup}>
        {SECONDARY_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            style={[styles.menuItem, index !== SECONDARY_ITEMS.length - 1 && styles.borderBottom]}
            onPress={() => handlePress(item)}
          >
            <View style={[styles.iconBadge, { backgroundColor: item.bgColor || "#F1F5F9" }]}>
              <Ionicons
                name={item.icon}
                size={18}
                color={item.iconColor || Colors.text || "#0F172A"}
              />
            </View>

            <View style={styles.textWrapper}>
              <Text style={[styles.menuTitle, item.isDanger && styles.dangerTitle]}>
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
    marginBottom: 40,
  },
  menuGroup: {
    backgroundColor: Colors.surface || "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
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
    width: 38,
    height: 38,
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
