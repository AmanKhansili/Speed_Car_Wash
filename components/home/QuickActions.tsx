import Colors from "@/constants/colors";
import Radius from "@/constants/radius";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function QuickActions() {
  const router = useRouter();

  const actions = [
    { id: "1", title: "Services", icon: "car-sport", route: "/services" },
    { id: "2", title: "Membership", icon: "diamond", route: "/membership" },
    { id: "3", title: "Bookings", icon: "calendar", route: "/bookings" },
    { id: "4", title: "Offers", icon: "pricetag", route: "/profile" },
  ];

  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={styles.actionItem}
          onPress={() => router.push(`${action.route}` as any)}
        >
          <View style={styles.iconBox}>
            <Ionicons name={action.icon as any} size={24} color={Colors.primary} />
          </View>
          <Text style={styles.actionText}>{action.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionItem: {
    alignItems: "center",
  },
  iconBox: {
    width: 56,
    height: 56,
    backgroundColor: "#F3F4F6",
    borderRadius: Radius.xl,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
  },
});
