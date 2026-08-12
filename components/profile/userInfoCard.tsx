import Colors from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useUser } from "@clerk/expo";

interface UserInfoCardProps {
  isPremium?: boolean;
  onEditPress?: () => void;
  onChangeAvatar?: () => void;
  onAddPhone?: () => void;
  onAddEmail?: () => void;
}

export default function UserInfoCard({
  isPremium = true,
  onEditPress,
  onChangeAvatar,
  onAddPhone,
  onAddEmail,
}: UserInfoCardProps) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return null;
  }

  const name =
    user?.fullName ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    "Amanjeet Kumar";
    
  // 🔥 Fix: Primary email ke sath emailAddresses array se bhi check karenge
  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress;

  const phone =
    user?.primaryPhoneNumber?.phoneNumber ||
    user?.phoneNumbers?.[0]?.phoneNumber;

  const avatarUrl =
    user?.imageUrl ||
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80";

  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.cardContainer} onPress={onEditPress}>
      {/* Left: Avatar with Camera Badge */}
      <View style={styles.avatarWrapper}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <TouchableOpacity style={styles.cameraBadge} activeOpacity={0.8} onPress={onChangeAvatar}>
          <Ionicons name="camera" size={12} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Middle: User Details */}
      <View style={styles.infoWrapper}>
        {/* Name */}
        <Text style={styles.userName} numberOfLines={1}>
          {name}
        </Text>

        {/* Member Badge */}
        {isPremium && (
          <View style={styles.badgeChip}>
            <Ionicons name="star-outline" size={12} color={Colors.primary} />
            <Text style={styles.badgeText}>Premium Member</Text>
          </View>
        )}

        {/* Phone / Add Phone Option */}
        {phone ? (
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={13} color={Colors.textSecondary || "#64748B"} />
            <Text style={styles.detailText}>{phone}</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.addActionRow} onPress={onAddPhone} activeOpacity={0.7}>
            <Ionicons name="add-circle-outline" size={13} color={Colors.primary} />
            <Text style={styles.addText}>Add phone number</Text>
          </TouchableOpacity>
        )}

        {/* Email / Add Email Option */}
        {email ? (
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={13} color={Colors.textSecondary || "#64748B"} />
            <Text style={styles.detailText} numberOfLines={1}>
              {email}
            </Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.addActionRow} onPress={onAddEmail} activeOpacity={0.7}>
            <Ionicons name="add-circle-outline" size={13} color={Colors.primary} />
            <Text style={styles.addText}>Add email address</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Right: Chevron Arrow */}
      <View style={styles.actionWrapper}>
        <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  avatarWrapper: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#F1F5F9",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  infoWrapper: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text || "#0F172A",
  },
  badgeChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
    marginVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 12.5,
    color: Colors.textSecondary || "#64748B",
    fontWeight: "500",
  },
  addActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  addText: {
    fontSize: 12.5,
    color: Colors.primary,
    fontWeight: "600",
  },
  actionWrapper: {
    paddingLeft: 8,
  },
});