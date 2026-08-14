import Colors from "@/constants/colors";
import Radius from "@/constants/radius";
import Shadow from "@/constants/shadow";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ServiceCard from "@/components/cards/ServiceCard";
import SearchBar from "@/components/common/SearchBar";

import { useBookingStore } from "@/store/bookingStore";
import { supabase } from "@/utils/supabase"; // 🚀 Supabase instance import
import { router } from "expo-router";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

export default function ServicesScreen() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // 🚀 Dynamic Backend States
  const [servicesData, setServicesData] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);

  // 🚀 ZUSTAND STATE HOOKS
  const { selectedServices, addService, removeService, getTotalPrice } = useBookingStore();

  // 🚀 Fetch Services from Supabase on Mount
  useEffect(() => {
    fetchServicesFromSupabase();
  }, []);

  const fetchServicesFromSupabase = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("services").select("*");

      if (error) throw error;

      if (data) {
        // 🚀 PRICE-WISE SERIALIZATION (Low to High sorting)
        const sortedData = data.sort((a: any, b: any) => {
          // Price string "₹400" ya "₹1,400" ko clean karke number banate hain comparison ke liye
          const priceA = parseInt(
            typeof a.price === "string" ? a.price.replace(/[^\d]/g, "") : a.price,
            10,
          );
          const priceB = parseInt(
            typeof b.price === "string" ? b.price.replace(/[^\d]/g, "") : b.price,
            10,
          );
          return priceA - priceB; // Low to High (Agar High to Low chahiye toh priceB - priceA kar dena)
        });

        setServicesData(sortedData);

        // Extract unique categories dynamically
        const uniqueCategories = ["All", ...new Set(sortedData.map((item: any) => item.category))];
        setCategoriesList(uniqueCategories as string[]);
      }
    } catch (error) {
      console.log("Error fetching services from Supabase:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check karna ki service already selected hai ya nahi
  const isSelected = (id: string) => selectedServices.some((s) => s.id === id);

  // Add / Remove Logic
  const toggleService = (item: any) => {
    if (isSelected(item.id)) {
      removeService(item.id);
    } else {
      // "₹599" string ko actual number (599) mein convert kar rahe hain calculations ke liye
      const numericPrice =
        typeof item.price === "number"
          ? item.price
          : parseInt(item.price.replace(/[^\d]/g, ""), 10);

      addService({
        id: item.id,
        title: item.title,
        price: numericPrice,
      });
    }
  };

  // Filtering Logic
  const filteredServices = servicesData.filter((service) => {
    const matchesCategory = activeCategory === "All" || service.category === activeCategory;
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Services</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="filter" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <SearchBar placeholder="Find a service..." onSearch={(text) => setSearchQuery(text)} />

      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categoriesList.map((cat, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.categoryPill, activeCategory === cat && styles.activeCategoryPill]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text
                style={[styles.categoryText, activeCategory === cat && styles.activeCategoryText]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={Colors.primary || "#2563EB"} />
        </View>
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 16 }}
          renderItem={({ item }) => (
            <View style={{ width: cardWidth }}>
              <ServiceCard
                title={item.title}
                subtitle={item.subtitle}
                price={typeof item.price === "number" ? `₹${item.price}` : item.price}
                rating={item.rating || "4.8"}
                reviews={item.reviews || "50+"}
                // 🚀 Safe Image Handling: Agar item.image URL hai toh use karo, warna fallback image
                image={
                  item.image && item.image.startsWith("http")
                    ? { uri: item.image }
                    : require("@/assets/images/services/exterior.png")
                }
                style={{ width: "100%" }}
                onPress={() => router.push(`/services/${item.id}` as any)}
                isAdded={isSelected(item.id)}
                onAddPress={() => toggleService(item)}
              />
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <Ionicons name="search-outline" size={40} color={Colors.textLight || "#94A3B8"} />
              <Text style={{ marginTop: 12, color: Colors.textSecondary }}>No services found</Text>
            </View>
          )}
        />
      )}

      {/* 🚀 SMART FLOATING "GO TO BOOKING" BAR */}
      {selectedServices.length > 0 && (
        <View style={styles.floatingBar}>
          <View>
            <Text style={styles.cartText}>{selectedServices.length} Services Selected</Text>
            <Text style={styles.cartTotal}>Total: ₹{getTotalPrice()}</Text>
          </View>
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => router.push("/booking/step1-selection" as any)}
          >
            <Text style={styles.continueText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  iconBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: Colors.text },
  categoryContainer: { marginBottom: 20 },
  categoryScroll: { paddingLeft: 16, paddingRight: 8 },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: Radius.round,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginRight: 12,
  },
  activeCategoryPill: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryText: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary },
  activeCategoryText: { color: Colors.surface },
  listContent: { paddingHorizontal: 16, paddingBottom: 140 },
  centerBox: { flex: 1, justifyContent: "center", alignItems: "center" },

  floatingBar: {
    position: "absolute",
    bottom: 90,
    left: 16,
    right: 16,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...Shadow.heavy,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cartText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text,
  },
  continueBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Radius.round,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  continueText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
