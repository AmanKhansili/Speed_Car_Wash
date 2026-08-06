import { useMemo, useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";

import Colors from "@/constants/colors";
import Spacing from "@/constants/spacing";

import { services, serviceCategories } from "@/constants/data";

import CategoryTabs from "@/components/services/CategoryTabs";
import ServiceCard from "@/components/cards/ServiceCard";

import { Ionicons } from "@expo/vector-icons";

export default function ServicesScreen() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const categoryMatch = selectedCategory === "All" || service.category === selectedCategory;

      const searchMatch = service.title.toLowerCase().includes(search.toLowerCase());

      return categoryMatch && searchMatch;
    });
  }, [selectedCategory, search]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Services</Text>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} />

        <TextInput
          placeholder="Search services..."
          placeholderTextColor={Colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />
      </View>

      <CategoryTabs
        categories={serviceCategories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ServiceCard
            title={item.title}
            subtitle={item.subtitle}
            price={item.price}
            rating={item.rating}
            duration={item.duration}
            image={item.image}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
  },

  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
    marginTop: 20,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: Colors.surface,

    borderRadius: 18,

    paddingHorizontal: 16,

    marginTop: 18,

    height: 56,
  },

  input: {
    flex: 1,

    marginLeft: 10,

    fontSize: 15,

    color: Colors.text,
  },

  list: {
    paddingBottom: 120,
  },

  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
});
