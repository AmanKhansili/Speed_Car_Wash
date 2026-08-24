import Colors from "@/constants/colors";
import Radius from "@/constants/radius";
import Shadow from "@/constants/shadow";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ReviewProps {
  name: string;
  rating: number;
  review: string;
  serviceName?: string;
}

export default function ReviewCard({ name, rating, review, serviceName }: ReviewProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={18} color={Colors.textLight || "#64748B"} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <View style={styles.stars}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Ionicons
                key={i}
                name="star"
                size={12}
                color={i < rating ? Colors.warning || "#F59E0B" : Colors.border || "#E2E8F0"}
                style={{ marginRight: 2 }}
              />
            ))}
          </View>
        </View>
        {/* Service Name Badge */}
        {serviceName ? (
          <View style={styles.serviceBadge}>
            <Ionicons name="sparkles" size={10} color={Colors.primary || "#2563EB"} />
            <Text style={styles.serviceBadgeText} numberOfLines={1}>
              {serviceName}
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.reviewText} numberOfLines={3}>
        {review}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 260,
    backgroundColor: Colors.surface || "#FFFFFF",
    borderRadius: Radius.lg || 16,
    padding: 14,
    marginRight: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Shadow.card,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: Radius.round || 18,
    backgroundColor: Colors.background || "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text || "#0F172A",
    marginBottom: 2,
  },
  stars: {
    flexDirection: "row",
  },
  serviceBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
    gap: 4,
  },
  serviceBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary || "#2563EB",
  },
  reviewText: {
    fontSize: 12.5,
    color: Colors.textSecondary || "#475569",
    lineHeight: 18,
  },
});
