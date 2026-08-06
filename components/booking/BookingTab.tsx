import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

// Dummy Data
const BOOKINGS_DATA = [
  {
    id: "1",
    title: "Exterior Wash",
    date: "24 May 2024 • 9:00 AM",
    address: "221B Baker Street, London",
    price: "₹299",
    status: "Confirmed",
    image:
      "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=300&auto=format&fit=crop&q=80",
    type: "upcoming",
  },
  {
    id: "2",
    title: "Interior Cleaning",
    date: "27 May 2024 • 11:00 AM",
    address: "221B Baker Street, London",
    price: "₹499",
    status: "Pending",
    image:
      "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=300&auto=format&fit=crop&q=80",
    type: "upcoming",
  },
  {
    id: "3",
    title: "Car Detailing",
    date: "10 Jan 2024 • 2:00 PM",
    address: "221B Baker Street, London",
    price: "₹1,299",
    status: "Completed",
    image:
      "https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=300&auto=format&fit=crop&q=80",
    type: "past",
  },
];

export default function BookingsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  const filteredBookings = BOOKINGS_DATA.filter(
    (item) => item.type === activeTab
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Tabs Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab("upcoming")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === "upcoming" && styles.activeTabLabel,
              ]}
            >
              Upcoming
            </Text>
            {activeTab === "upcoming" && <View style={styles.indicator} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab("past")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === "past" && styles.activeTabLabel,
              ]}
            >
              Past
            </Text>
            {activeTab === "past" && <View style={styles.indicator} />}
          </TouchableOpacity>
        </View>

        {/* Main Scroll View */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Add Booking Button (Cleaned Single Touchable) */}
          {activeTab === "upcoming" && (
            <TouchableOpacity
              style={styles.addBookingBtn}
              activeOpacity={0.85}
              onPress={() => router.push("/add-booking")}
            >
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              <Text style={styles.addBookingBtnText}>Add New Booking</Text>
            </TouchableOpacity>
          )}

          {/* Cards List */}
          {filteredBookings.length > 0 ? (
            filteredBookings.map((item) => (
              <View key={item.id} style={styles.card}>
                {/* Left Side: Thumbnail + Badge */}
                <View style={styles.leftCol}>
                  <Image source={{ uri: item.image }} style={styles.cardImage} />
                  <View
                    style={[
                      styles.badge,
                      item.status === "Confirmed" && styles.confirmedBadge,
                      item.status === "Pending" && styles.pendingBadge,
                      item.status === "Completed" && styles.completedBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        item.status === "Confirmed" && styles.confirmedText,
                        item.status === "Pending" && styles.pendingText,
                        item.status === "Completed" && styles.completedText,
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                {/* Right Side: Details & Price */}
                <View style={styles.rightCol}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDate}>{item.date}</Text>
                  <Text style={styles.cardAddress} numberOfLines={1}>
                    {item.address}
                  </Text>
                  <Text style={styles.cardPrice}>{item.price}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>
                No {activeTab} bookings available.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    position: "relative",
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748B",
  },
  activeTabLabel: {
    color: Colors.primary,
    fontWeight: "700",
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    width: "50%",
    height: 3,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  scrollContent: {
    padding: 16,
    width: "100%",
  },
  addBookingBtn: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  addBookingBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    width: "100%",
  },
  leftCol: {
    width: 85,
    marginRight: 14,
    alignItems: "center",
  },
  cardImage: {
    width: 85,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#E2E8F0",
  },
  badge: {
    marginTop: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  confirmedBadge: { backgroundColor: "#DCFCE7" },
  confirmedText: { color: "#166534" },
  pendingBadge: { backgroundColor: "#FEF3C7" },
  pendingText: { color: "#92400E" },
  completedBadge: { backgroundColor: "#F1F5F9" },
  completedText: { color: "#475569" },
  rightCol: {
    flex: 1,
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  cardDate: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 3,
  },
  cardAddress: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  cardPrice: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 10,
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "500",
  },
});