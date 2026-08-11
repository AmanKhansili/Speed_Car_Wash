import Colors from "@/constants/colors";
import Radius from "@/constants/radius";
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

// NAYA DATA IMPORT HERE
import { categoriesList, servicesData } from "@/constants/data";
import { router } from "expo-router";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

export default function ServicesScreen() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

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
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <ServiceCard
            title={item.title}
            subtitle={item.subtitle}
            price={item.price}
            rating={item.rating}
            reviews={item.reviews}
            image={item.image}
            style={{ width: cardWidth, marginBottom: 16 }}
            onPress={() => router.push(`/services/${item.id}` as any)}
          />
        )}
        ListEmptyComponent={() => (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Ionicons name="search-outline" size={40} color={Colors.textLight} />
            <Text style={{ marginTop: 12, color: Colors.textSecondary }}>No services found</Text>
          </View>
        )}
      />
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
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  columnWrapper: { justifyContent: "space-between" },
});
