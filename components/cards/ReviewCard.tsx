import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Colors from "@/constants/colors";
import Radius from "@/constants/radius";
import Spacing from "@/constants/spacing";

interface Props {
  name: string;
  review: string;
  rating: number;
}

export default function ReviewCard({ name, review, rating }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.stars}>
        {[...Array(rating)].map((_, index) => (
          <Ionicons key={index} name="star" size={16} color="#F59E0B" />
        ))}
      </View>

      <Text style={styles.review}>{review}</Text>

      <Text style={styles.name}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 260,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginRight: 16,
  },

  stars: {
    flexDirection: "row",
    marginBottom: 10,
  },

  review: {
    color: Colors.textSecondary,
    lineHeight: 22,
    fontSize: 14,
  },

  name: {
    marginTop: 18,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
});
