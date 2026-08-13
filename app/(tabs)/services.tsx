import Colors from "@/constants/colors";
import Radius from "@/constants/radius";
import Shadow from "@/constants/shadow";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
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

// DATA & ROUTING
import { categoriesList, servicesData } from "@/constants/data";
import { useBookingStore } from "@/store/bookingStore";
import { router } from "expo-router";

// 🚀 ZUSTAND STORE IMPORT KARI

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

export default function ServicesScreen() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // 🚀 ZUSTAND STATE HOOKS
  const { selectedServices, addService, removeService, getTotalPrice } = useBookingStore();

  // Check karna ki service already selected hai ya nahi
  const isSelected = (id: string) => selectedServices.some((s) => s.id === id);

  // Add / Remove Logic
  const toggleService = (item: any) => {
    if (isSelected(item.id)) {
      removeService(item.id);
    } else {
      // "₹599" string ko actual number (599) mein convert kar rahe hain calculations ke liye
      const numericPrice = parseInt(item.price.replace(/[^\d]/g, ""), 10);
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
              price={item.price}
              rating={item.rating}
              reviews={item.reviews}
              image={item.image}
              style={{ width: "100%" }}
              onPress={() => router.push(`/services/${item.id}` as any)}
              isAdded={isSelected(item.id)}
              onAddPress={() => toggleService(item)}
            />
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Ionicons name="search-outline" size={40} color={Colors.textLight} />
            <Text style={{ marginTop: 12, color: Colors.textSecondary }}>No services found</Text>
          </View>
        )}
      />

      {/* 🚀 SMART FLOATING "GO TO BOOKING" BAR */}
      {selectedServices.length > 0 && (
        <View style={styles.floatingBar}>
          <View>
            <Text style={styles.cartText}>{selectedServices.length} Services Selected</Text>
            <Text style={styles.cartTotal}>Total: ₹{getTotalPrice()}</Text>
          </View>
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => router.push("/booking/step1-selection")}
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
  listContent: { paddingHorizontal: 16, paddingBottom: 140 }, // Padding badha di taaki list bar ke neeche na chhupe
  columnWrapper: { justifyContent: "space-between" },

  // 🚀 NEW STYLES FOR ADD BUTTON & FLOATING BAR
  addBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.4)", // Translucent black
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  selectedBtn: {
    backgroundColor: Colors.primary, // Green jab select ho jaye
  },
  floatingBar: {
    position: "absolute",
    bottom: 90, // Tab bar ke theek upar
    left: 16,
    right: 16,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...Shadow.heavy, // Thodi shadow premium feel ke liye
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
