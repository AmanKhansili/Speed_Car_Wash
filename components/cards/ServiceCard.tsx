import Colors from "@/constants/colors";
import Radius from "@/constants/radius";
import Shadow from "@/constants/shadow";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface ServiceCardProps {
  title: string;
  subtitle: string;
  price: string;
  rating: string;
  reviews: string;
  tag?: string;
  image?: ImageSourcePropType | { uri: string };
  style?: StyleProp<ViewStyle>;
  onPress?: () => void; 
}

export default function ServiceCard({
  title,
  subtitle,
  price,
  rating,
  reviews,
  tag,
  image,
  style,
  onPress,
}: ServiceCardProps) {
  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageArea}>
        {image && <Image source={image as any} style={styles.cardImage} resizeMode="cover" />}
        {tag && (
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="star" size={14} color={Colors.warning} />
          <Text style={styles.ratingText}>{rating}</Text>
          <Text style={styles.reviewText}>({reviews})</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceText}>{price}</Text>
          {/* Add button pehle se hai, wo design ke liye theek hai */}
          <View style={styles.addBtn}>
            <Ionicons name="add" size={20} color={Colors.surface} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200, // Default width Home screen ke liye
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 12,
    ...Shadow.card,
  },
  imageArea: {
    height: 110,
    backgroundColor: Colors.border,
    borderRadius: Radius.lg,
    marginBottom: 12,
    position: "relative",
    overflow: "hidden",
  },
  cardImage: { width: "100%", height: "100%" },
  tagBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.md,
    zIndex: 10,
  },
  tagText: { color: Colors.surface, fontSize: 10, fontWeight: "bold" },
  content: { paddingHorizontal: 4 },
  title: { fontSize: 15, fontWeight: "800", color: Colors.text },
  subtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, marginBottom: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  ratingText: { fontSize: 12, fontWeight: "700", color: Colors.text, marginLeft: 4 },
  reviewText: { fontSize: 11, color: Colors.textLight, marginLeft: 4 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  priceText: { fontSize: 20, fontWeight: "800", color: Colors.primary },
  addBtn: {
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: Radius.round,
    justifyContent: "center",
    alignItems: "center",
  },
});
