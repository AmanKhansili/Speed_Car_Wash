import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Colors from "@/constants/colors";
import Radius from "@/constants/radius";
import Spacing from "@/constants/spacing";
import { Image } from "react-native";

interface Props {
  title: string;
  subtitle: string;
  price: number;
  rating: number;
  duration: string;
  image: any;
}

export default function ServiceCard({ title, subtitle, price, rating, duration, image }: Props) {
  return (
    <TouchableOpacity style={styles.card}>
      <Image source={image} style={styles.image} />

      <Text style={styles.title}>{title}</Text>

      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.infoRow}>
        <View style={styles.rating}>
          <Ionicons name="star" size={14} color="#F59E0B" />

          <Text style={styles.smallText}>{rating}</Text>
        </View>

        <View style={styles.rating}>
          <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />

          <Text style={styles.smallText}>{duration}</Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.price}>₹{price}</Text>

        <TouchableOpacity style={styles.button}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 210,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginRight: 16,
  },

  imageBox: {
    height: 120,
    borderRadius: Radius.lg,
    backgroundColor: "#d9e0ea",

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },

  subtitle: {
    color: Colors.textSecondary,
    marginTop: 5,
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  rating: {
    flexDirection: "row",
    alignItems: "center",
  },

  smallText: {
    marginLeft: 5,
    color: Colors.textSecondary,
  },

  bottomRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  price: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.primary,
  },

  button: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.primary,

    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    width: "100%",
    height: 120,
    resizeMode: "contain",
    marginBottom: 12,
  },
});
