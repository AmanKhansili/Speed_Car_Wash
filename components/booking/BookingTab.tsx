import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import useUser  from "@/context/userContext";
import Colors from "@/constants/colors";

export interface Booking {
  id: string;
  title: string;
  price: string;
  date: string;
  address: string;
  status: "Confirmed" | "Pending" | "Cancelled" | "Completed";
  type: "upcoming" | "past";
  image?: string;
}

export default function BookingTabs() {
  const router = useRouter();

  const { userData, updateBookings } = useUser() as any; 

  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  const defaultBookings: Booking[] = [
    // {
    //   id: "1",
    //   title: "Standard Foam Wash",
    //   price: "₹499",
    //   date: "12 Aug 2026, 10:00 AM",
    //   address: "Plot 12, Sector 63, Noida",
    //   status: "Confirmed",
    //   type: "upcoming",
    // },
  ];

  const [bookings, setBookings] = useState<Booking[]>(() => {
    if (userData?.bookings && Array.isArray(userData.bookings) && userData.bookings.length > 0) {
      return userData.bookings as Booking[];
    }
    return defaultBookings;
  });

  // Sync with UserContext changes safely
  useEffect(() => {
    if (userData?.bookings && Array.isArray(userData.bookings)) {
      setBookings(userData.bookings as Booking[]);
    }
  }, [userData?.bookings]);

  // Cancel Booking Handler
  const handleCancel = (id: string) => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            const updated = bookings.map((item) => {
              if (item.id === id) {
                return { ...item, status: "Cancelled" as const, type: "past" as const };
              }
              return item;
            });
            setBookings(updated);
            if (updateBookings) {
              await updateBookings(updated);
            }
          },
        },
      ]
    );
  };

  const filteredBookings = bookings.filter((item) => {
    if (activeTab === "upcoming") {
      return item.type === "upcoming" && item.status !== "Cancelled";
    } else {
      return item.type === "past" || item.status === "Cancelled";
    }
  });

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image
          source={{
            uri:
              item.image ||
              "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=300&auto=format&fit=crop&q=80",
          }}
          style={styles.cardImage}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardPrice}>{item.price}</Text>
        </View>
        <View
          style={[
            styles.badge,
            item.status === "Confirmed" && styles.confirmedBadge,
            item.status === "Pending" && styles.pendingBadge,
            item.status === "Cancelled" && styles.cancelledBadge,
            item.status === "Completed" && styles.completedBadge,
          ]}
        >
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#64748B" />
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#64748B" />
          <Text style={styles.detailText} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
      </View>

      {item.type === "upcoming" && item.status !== "Cancelled" && (
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => handleCancel(item.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelBtnText}>Cancel Booking</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* TOGGLE TABS */}
      <View style={styles.tabHeader}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "upcoming" && styles.activeTabButton]}
          onPress={() => setActiveTab("upcoming")}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === "upcoming" && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "past" && styles.activeTabButton]}
          onPress={() => setActiveTab("past")}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === "past" && styles.activeTabText]}>
            Past & Cancelled
          </Text>
        </TouchableOpacity>
      </View>

      {/* NEW BOOKING BUTTON */}
      {activeTab === "upcoming" && (
        <TouchableOpacity
          style={styles.addBookingBtn}
          onPress={() => router.push("/booking/step1-selection" as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={20} color="#FFFFFF" />
          <Text style={styles.addBookingBtnText}>New Booking</Text>
        </TouchableOpacity>
      )}

      {/* LIST OF BOOKINGS */}
      {filteredBookings.length > 0 ? (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingCard}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyBox}>
          <Ionicons name="calendar-outline" size={48} color="#CBD5E1" />
          <Text style={styles.emptyText}>No {activeTab} bookings found.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
  },
  tabHeader: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  activeTabText: {
    color: Colors.primary || "#2563EB",
  },
  addBookingBtn: {
    backgroundColor: Colors.primary || "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  addBookingBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginLeft: 6,
    fontSize: 14,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary || "#2563EB",
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  confirmedBadge: { backgroundColor: "#DCFCE7" },
  pendingBadge: { backgroundColor: "#FEF3C7" },
  cancelledBadge: { backgroundColor: "#FEE2E2" },
  completedBadge: { backgroundColor: "#F1F5F9" },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 10,
  },
  cardDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: "#64748B",
  },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  cancelBtnText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 8,
    color: "#94A3B8",
    fontSize: 14,
  },
});