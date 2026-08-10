import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

interface MembershipBannerProps {
  memberSince?: string;
  onPressBanner?: () => void;
}

export default function MembershipBanner({
  memberSince = "May 2024",
  onPressBanner,
}: MembershipBannerProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.bannerContainer}
      onPress={onPressBanner}
    >
      {/* Left Content */}
      <View style={styles.contentWrapper}>
        <View style={styles.titleRow}>
          <Ionicons name="ribbon" size={18} color="#FFD700" />
          <Text style={styles.titleText}>Premium Member</Text>
        </View>

        <Text style={styles.sinceText}>Member since {memberSince}</Text>
        <Text style={styles.subtitleText}>
          Enjoy priority booking and exclusive benefits.
        </Text>
      </View>

      {/* Right Graphic / Car Image */}
      <View style={styles.graphicWrapper}>
        <Image
          source={{
            uri: "https://png.pngtree.com/png-vector/20230302/ourmid/pngtree-sports-car-side-view-vector-png-image_6626500.png",
          }}
          style={styles.carImage}
          resizeMode="contain"
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor:Colors.primary, // Deep rich purple
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  contentWrapper: {
    flex: 1,
    paddingRight: 10,
    zIndex: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  titleText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  sinceText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#E9D5FF",
    marginBottom: 6,
  },
  subtitleText: {
    fontSize: 11,
    color: "white",
    fontWeight: "500",
    lineHeight: 15,
  },
  graphicWrapper: {
    width: 95,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  carImage: {
    width: "100%",
    height: "100%",
  },
});