import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";

type Props = {
  count: number;
};

export default function NotificationBell({ count }: Props) {
  const router = useRouter();
  const showBadge = count > 0;
  const displayCount = count > 9 ? "9+" : String(count);

  return (
    <TouchableOpacity
      style={styles.wrapper}
      onPress={() => router.push("/notifications")}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons name="notifications-outline" size={24} color={Colors.text} />
      {showBadge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{displayCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 3,
    right: 3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  badgeText: {
    color: Colors.surface,
    fontSize: 9,
    fontWeight: "800",
  },
});