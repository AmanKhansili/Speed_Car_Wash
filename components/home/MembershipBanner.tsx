import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MembershipBanner() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.badge}>
          <Ionicons name="diamond" size={12} color="#FBBF24" style={{ marginRight: 4 }} />
          <Text style={styles.badgeText}>PREMIUM</Text>
        </View>
        <Text style={styles.title}>Premium{"\n"}Membership</Text>
        <Text style={styles.subtitle}>
          Save up to 25% on every{"\n"}wash with exclusive benefits.
        </Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push("/membership")}>
          <Text style={styles.btnText}>Explore Plans</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFF" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>

      {/* ABSOLUTE IMAGE INSTEAD OF PLACEHOLDER */}
      <Image
        source={require("@/assets/images/membership.png")}
        style={styles.bannerImage}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 32,
    marginTop: 16,
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 24,
    overflow: "hidden",
    position: "relative",
  },
  content: { zIndex: 2 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  badgeText: { color: "#FBBF24", fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: "800", color: "#FFF", lineHeight: 28, marginBottom: 8 },
  subtitle: { fontSize: 13, color: "#9CA3AF", lineHeight: 18, marginBottom: 20 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5D3FD3",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  btnText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  bannerImage: {
    position: "absolute",
    right: -140,
    top: 45,
    width: 300,
    height: 250,
    zIndex: 1,
  },
});
