import Colors from "@/constants/colors";
import Radius from "@/constants/radius";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 🚀 ZUSTAND STORE IMPORT
import { supabase } from "@/utils/supabase";
import { useBookingStore } from "../../store/bookingStore";

export default function ServiceDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🚀 ZUSTAND STATE
  const { addService } = useBookingStore();

  // 🚀 Fetch Single Service from Supabase using ID
  useEffect(() => {
    if (id) {
      fetchServiceDetails();
    }
  }, [id]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("services").select("*").eq("id", id).single();

      if (error) throw error;
      if (data) setService(data);
    } catch (error) {
      console.log("Error fetching service details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <ActivityIndicator size="large" color={Colors.primary || "#2563EB"} />
      </SafeAreaView>
    );
  }

  if (!service) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={{ color: Colors.text }}>Service not found!</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: Colors.primary, marginTop: 10 }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const featuresList = service.description
    ? service.description.split("+").map((item: string) => item.trim())
    : [];

  // 🚀 BOOK NOW ACTION
  const handleBookNow = () => {
    const numericPrice =
      typeof service.price === "number"
        ? service.price
        : parseInt(service.price.replace(/[^\d]/g, ""), 10);

    addService({
      id: service.id,
      title: service.title,
      price: numericPrice,
    });

    router.push("/booking/step1-selection" as any);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* BIG IMAGE HEADER */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                service.image && service.image.startsWith("http")
                  ? service.image
                  : "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&auto=format&fit=crop&q=80",
            }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          <View style={styles.overlay} />

          <SafeAreaView edges={["top"]} style={styles.headerSafe}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* CONTENT SECTION */}
        <View style={styles.contentContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{service.category}</Text>
          </View>

          <Text style={styles.title}>{service.title}</Text>
          <Text style={styles.subtitle}>{service.subtitle}</Text>

          <View style={styles.metaRow}>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={16} color={Colors.warning || "#F59E0B"} />
              <Text style={styles.ratingText}>{service.rating || "4.8"}</Text>
              <Text style={styles.reviewText}>({service.reviews || "50"} reviews)</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* WHAT'S INCLUDED SECTION */}
          <Text style={styles.sectionTitle}>{"What's Included"}</Text>
          <View style={styles.featuresContainer}>
            {featuresList.map((feature: string, index: number) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={Colors.primary}
                  style={styles.checkIcon}
                />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* STICKY BOTTOM BOOKING BAR */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomPriceLabel}>Total Price</Text>
          <Text style={styles.bottomPrice}>
            {typeof service.price === "number" ? `₹${service.price}` : service.price}
          </Text>
        </View>

        <TouchableOpacity style={styles.bookBtn} onPress={handleBookNow} activeOpacity={0.8}>
          <Text style={styles.bookBtnText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  imageContainer: { width: "100%", height: 300, position: "relative" },
  mainImage: { width: "100%", height: "100%" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.3)" },
  headerSafe: { position: "absolute", top: 0, left: 0, right: 0, paddingHorizontal: 16 },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: Radius.round,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },

  contentContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    padding: 24,
  },
  categoryBadge: {
    backgroundColor: "#F3F4F6",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.md,
    marginBottom: 12,
  },
  categoryText: { color: Colors.primary, fontSize: 12, fontWeight: "700" },
  title: { fontSize: 28, fontWeight: "800", color: Colors.text, marginBottom: 4 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, marginBottom: 16 },

  metaRow: { flexDirection: "row", alignItems: "center" },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.md,
  },
  ratingText: { fontSize: 14, fontWeight: "700", color: "#B45309", marginLeft: 6 },
  reviewText: { fontSize: 12, color: "#B45309", marginLeft: 4 },

  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 24 },

  sectionTitle: { fontSize: 18, fontWeight: "800", color: Colors.text, marginBottom: 16 },
  featuresContainer: { gap: 12 },
  featureItem: { flexDirection: "row", alignItems: "flex-start" },
  checkIcon: { marginTop: 2, marginRight: 12 },
  featureText: { flex: 1, fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: 32,
  },
  bottomPriceLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 2 },
  bottomPrice: { fontSize: 24, fontWeight: "800", color: Colors.primary },
  bookBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: Radius.xl,
  },
  bookBtnText: { color: Colors.surface, fontSize: 16, fontWeight: "700" },
});
