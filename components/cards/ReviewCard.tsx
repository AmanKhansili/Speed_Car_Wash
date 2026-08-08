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
}

export default function ReviewCard({ name, rating, review }: ReviewProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={20} color={Colors.textLight} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.stars}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Ionicons
                key={i}
                name="star"
                size={12}
                color={i < rating ? Colors.warning : Colors.border}
                style={{ marginRight: 2 }}
              />
            ))}
          </View>
        </View>
      </View>
      <Text style={styles.reviewText}>{review}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 260,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 16,
    marginRight: 16,
    ...Shadow.card,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: Radius.round,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 2,
  },
  stars: {
    flexDirection: "row",
  },
  reviewText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
