import Colors from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  RefreshControl,
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
import { supabase } from "@/utils/supabase";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

export default function ServicesScreen() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [servicesData, setServicesData] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState<"lowToHigh" | "highToLow">("lowToHigh");

  const params = useLocalSearchParams<{ category?: string }>();

  useEffect(() => {
    if (params.category) {
      setActiveCategory(params.category);
    }
  }, [params.category]);

  const { selectedServices, addService, removeService, getTotalPrice } = useBookingStore();

  const fetchServicesFromSupabase = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("services").select("*");
      if (error) throw error;

      if (data) {
        setServicesData(data);
        const uniqueCategories = ["All", ...new Set(data.map((item: any) => item.category))];
        setCategoriesList(uniqueCategories as string[]);
      }
    } catch (error) {
      console.log("Error fetching services from Supabase:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServicesFromSupabase();
  }, [fetchServicesFromSupabase]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setRefreshing(false), 3500);

    await fetchServicesFromSupabase();

    if (timerRef.current) clearTimeout(timerRef.current);
    setRefreshing(false);
  }, [fetchServicesFromSupabase]);

  const isSelected = (id: string) => selectedServices.some((s) => s.id === id);

  const toggleService = (item: any) => {
    if (isSelected(item.id)) {
      removeService(item.id);
    } else {
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

  const filteredAndSortedServices = servicesData
    .filter((service) => {
      const matchesCategory = activeCategory === "All" || service.category === activeCategory;
      const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      const priceA =
        typeof a.price === "number" ? a.price : parseInt(a.price.replace(/[^\d]/g, ""), 10);
      const priceB =
        typeof b.price === "number" ? b.price : parseInt(b.price.replace(/[^\d]/g, ""), 10);
      return sortOrder === "lowToHigh" ? priceA - priceB : priceB - priceA;
    });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Services</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setFilterModalVisible(true)}>
          <Ionicons name="filter" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <SearchBar placeholder="Find a service..." onSearch={(text) => setSearchQuery(text)} />

      {/* Categories */}
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

      {/* FlatList with Native Pull-To-Refresh */}
      <FlatList
        data={loading ? [] : filteredAndSortedServices}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={
          !loading && filteredAndSortedServices.length > 0
            ? { justifyContent: "space-between", marginBottom: 16 }
            : undefined
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary || "#2563EB"]}
            tintColor={Colors.primary || "#2563EB"}
          />
        }
        renderItem={({ item }) => (
          <View style={{ width: cardWidth }}>
            <ServiceCard
              title={item.title}
              subtitle={item.subtitle}
              price={typeof item.price === "number" ? `₹${item.price}` : item.price}
              rating={item.rating || "4.8"}
              reviews={item.reviews || "50+"}
              image={
                item.image && item.image.startsWith("http")
                  ? { uri: item.image }
                  : require("@/assets/images/services/exterior.webp")
              }
              style={{ width: "100%" }}
              onPress={() => router.push(`/services/${item.id}` as any)}
              isAdded={isSelected(item.id)}
              onAddPress={() => toggleService(item)}
            />
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={{ alignItems: "center", marginTop: 40, flex: 1 }}>
            {loading && !refreshing ? (
              <ActivityIndicator size="large" color={Colors.primary || "#2563EB"} />
            ) : (
              <>
                <Ionicons name="search-outline" size={40} color={Colors.textLight || "#94A3B8"} />
                <Text style={{ marginTop: 12, color: Colors.textSecondary }}>
                  No services found
                </Text>
              </>
            )}
          </View>
        )}
      />

      {/* Floating Bottom Bar */}
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

      {/* Filter Modal */}
      <Modal visible={isFilterModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Sort & Filter</Text>

            <Text style={styles.filterSectionTitle}>Sort by Price</Text>
            <TouchableOpacity style={styles.filterOption} onPress={() => setSortOrder("lowToHigh")}>
              <Text style={styles.optionText}>Price: Low to High</Text>
              {sortOrder === "lowToHigh" && (
                <Ionicons name="checkmark" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.filterOption} onPress={() => setSortOrder("highToLow")}>
              <Text style={styles.optionText}>Price: High to Low</Text>
              {sortOrder === "highToLow" && (
                <Ionicons name="checkmark" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setFilterModalVisible(false)}>
              <Text style={styles.closeBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: Colors.text },
  iconBtn: { padding: 8, borderRadius: 8, backgroundColor: "#F1F5F9" },
  categoryContainer: { marginVertical: 12 },
  categoryScroll: { paddingHorizontal: 16, gap: 8 },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  activeCategoryPill: { backgroundColor: Colors.primary || "#2563EB" },
  categoryText: { fontSize: 14, color: Colors.textSecondary },
  activeCategoryText: { color: "#FFF", fontWeight: "600" },
  listContent: { paddingHorizontal: 16, paddingBottom: 100, flexGrow: 1 },
  floatingBar: {
    position: "absolute",
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: Colors.primary || "#2563EB",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cartText: { color: "#FFF", fontSize: 12, opacity: 0.9 },
  cartTotal: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  continueText: { color: "#FFF", fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContainer: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  filterSectionTitle: { fontSize: 14, fontWeight: "600", color: "#64748B", marginBottom: 12 },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  optionText: { fontSize: 16, color: Colors.text },
  closeBtn: {
    marginTop: 20,
    backgroundColor: Colors.primary || "#2563EB",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  closeBtnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});
