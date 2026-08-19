import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";
import Colors from "@/constants/colors";

interface UserInfoCardProps {
  isPremium?: boolean;
  phone?: string | null;          // Sourced from Supabase
  onEditPress?: () => void;
  onChangeAvatar?: () => void;
  onAddPhone?: () => void;
  onAddEmail?: () => void;
}

export default function UserInfoCard({
  isPremium = false,
  phone,
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
    "User";

  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress;

  const avatarUrl =
    user?.imageUrl ||
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.cardContainer}
      onPress={onEditPress}
    >
      <View style={styles.avatarWrapper}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <TouchableOpacity
          style={styles.cameraBadge}
          activeOpacity={0.8}
          onPress={onChangeAvatar}
        >
          <Ionicons name="camera" size={12} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoWrapper}>
        {/* Name */}
        <Text style={styles.userName} numberOfLines={1}>
          {name}
        </Text>

        {isPremium && (
          <View style={styles.badgeChip}>
            <Ionicons name="star-outline" size={12} color={Colors.primary || "#6366F1"} />
            <Text style={styles.badgeText}>Premium Member</Text>
          </View>
        )}

        {/* Phone Row: Pressable whether number exists or needs to be added */}
        {phone ? (
          <TouchableOpacity
            style={styles.detailRow}
            onPress={onAddPhone || onEditPress}
            activeOpacity={0.7}
          >
            <Ionicons
              name="call-outline"
              size={13}
              color={Colors.textSecondary || "#64748B"}
            />
            <Text style={styles.detailText}>{phone}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.addActionRow}
            onPress={onAddPhone || onEditPress}
            activeOpacity={0.7}
          >
            <Ionicons
              name="add-circle-outline"
              size={13}
              color={Colors.primary || "#6366F1"}
            />
            <Text style={styles.addText}>Add phone number</Text>
          </TouchableOpacity>
        )}

        {email ? (
          <View style={styles.detailRow}>
            <Ionicons
              name="mail-outline"
              size={13}
              color={Colors.textSecondary || "#64748B"}
            />
            <Text style={styles.detailText} numberOfLines={1}>
              {email}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addActionRow}
            onPress={onAddEmail}
            activeOpacity={0.7}
          >
            <Ionicons
              name="add-circle-outline"
              size={13}
              color={Colors.primary || "#6366F1"}
            />
            <Text style={styles.addText}>Add email address</Text>
          </TouchableOpacity>
        )}
      </View>

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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  avatarWrapper: {
    position: "relative",
    marginRight: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E2E8F0",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary || "#6366F1",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  infoWrapper: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text || "#0F172A",
    marginBottom: 2,
  },
  badgeChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginVertical: 4,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    color: Colors.primary || "#6366F1",
    fontWeight: "600",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textSecondary || "#64748B",
  },
  addActionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    gap: 6,
  },
  addText: {
    fontSize: 13,
    color: Colors.primary || "#6366F1",
    fontWeight: "500",
  },
  actionWrapper: {
    paddingLeft: 8,
  },
});