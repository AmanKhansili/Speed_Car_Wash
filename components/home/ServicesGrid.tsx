import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Colors from "@/constants/colors";
import { router } from "expo-router"; // 🚀 Import Router

type Service = {
  id: string;
  label: string;
  subtitle: string;
  price: string;
  image: any;
  category: string;
};

const SERVICES: Service[] = [
  {
    id: "wash",
    label: "Wash",
    subtitle: "Exterior & Interior",
    price: "Starting at ₹399",
    image: require("@/assets/images/services/washing.png"),
    category: "Wash",
  },
  {
    id: "detail",
    label: "Detail",
    subtitle: "Deep Clean & Polish",
    price: "Starting at ₹1,499",
    image: require("@/assets/images/services/detailing.webp"),
    category: "Detailing",
  },
  {
    id: "coating",
    label: "Coating",
    subtitle: "Ceramic & Paint Protection",
    price: "Starting at ₹2,499",
    image: require("@/assets/images/services/coating.webp"),
    category: "Coating",
  },
  {
    id: "scrap",
    label: "Scraping",
    subtitle: "Different Theme",
    price: "Starting at ₹499",
    image: require("@/assets/images/services/scrap.png"),
    category: "Scraping",
  },
];

export default function ServicesGrid() {
  const handleServicePress = (category: string) => {
    router.push({
      pathname: "/(tabs)/services", // Apne folder structure ke hisab se path update karein (e.g., '/services')
      params: { category },
    } as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Our Services</Text>
        <TouchableOpacity
          style={styles.viewAllBtn}
          activeOpacity={0.7}
          onPress={() => handleServicePress("All")}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {SERVICES.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => handleServicePress(service.category)} // 🚀 Pass selected category
          >
            <Image
              source={service.image}
              style={styles.cardImage}
              resizeMode="contain"
            />

            <View style={styles.cardFooter}>
              <View style={styles.textContainer}>
                <Text style={styles.label}>{service.label}</Text>
                <Text style={styles.subtitle}>{service.subtitle}</Text>
                <Text style={styles.price}>{service.price}</Text>
              </View>

              <View style={styles.arrowCircle}>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={Colors.primary}
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    paddingBottom: 18,
  },
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    height: 195,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    position: "relative",
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 80,
    marginTop: 10,
    alignSelf: "center",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 4,
  },
  textContainer: {
    flex: 1,
    paddingRight: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 1,
    fontWeight: "500",
  },
  price: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 4,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
});
