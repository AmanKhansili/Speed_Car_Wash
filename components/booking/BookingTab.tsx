import Colors from "@/constants/colors";
import { createClerkSupabaseClient } from "@/utils/supabase";
import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface BookingDisplayItem {
  id: string;
  title: string;
  price: string;
  date: string;
  address: string;
  phone: string;
  status: "Confirmed" | "Pending" | "Cancelled" | "Completed" | "Failed" | string;
  type: "upcoming" | "past";
}

export default function BookingTabs() {
  const router = useRouter();
  const { userId, getToken } = useAuth();

  const clerkSupabase = useMemo(() => createClerkSupabaseClient(getToken), [getToken]);

  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingDisplayItem[]>([]);

  useEffect(() => {
    if (userId) {
      fetchSupabaseBookings();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchSupabaseBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await clerkSupabase
        .from("bookings")
        .select("*")
        .or(`clerk_user_id.eq.${userId},user_id.eq.${userId}`)
        .not("status", "in", '("Saved","Saved_Template","saved")')
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedBookings: BookingDisplayItem[] = data.map((item: any) => {
          const statusLower = item.status?.toLowerCase() || "";
          const isPast =
            statusLower === "completed" || statusLower === "cancelled" || statusLower === "failed";

          const title =
            item.service_name ||
            (item.services_booked && item.services_booked[0]?.title) ||
            "Car Wash Service";

          const displayDate =
            item.booking_date ||
            (item.scheduled_date
              ? new Date(item.scheduled_date).toLocaleDateString()
              : "Scheduled Soon");

          const displayPrice = `₹${item.total_amount ?? item.amount ?? 0}`;
          const displayPhone = item.primary_phone || item.phone || "N/A";
          const displayAddress =
            item.address ||
            (item.service_type === "pickup" ? "Pickup Requested" : "Workshop Center");

          return {
            id: item.id,
            title,
            price: displayPrice,
            date: displayDate,
            address: displayAddress,
            status: item.status || "Pending",
            phone: displayPhone,
            type: isPast ? "past" : "upcoming",
          };
        });

        setBookings(formattedBookings);
      }
    } catch (error) {
      console.log("❌ [Bookings] Failed to fetch bookings from Supabase", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    Alert.alert("Cancel Booking", "Are you sure you want to cancel this booking?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await clerkSupabase
              .from("bookings")
              .update({ status: "Cancelled" })
              .eq("id", id);

            if (error) throw error;

            setBookings((prev) =>
              prev.map((item) =>
                item.id === id ? { ...item, status: "Cancelled", type: "past" } : item,
              ),
            );
          } catch (err: any) {
            Alert.alert("Error", "Could not cancel booking");
          }
        },
      },
    ]);
  };

  const filteredBookings = bookings.filter((item) => {
    const statusLower = item.status.toLowerCase();
    if (activeTab === "upcoming") {
      return item.type === "upcoming" && statusLower !== "cancelled";
    } else {
      return item.type === "past" || statusLower === "cancelled";
    }
  });

  const renderBookingCard = ({ item }: { item: BookingDisplayItem }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=300&auto=format&fit=crop&q=80",
          }}
          style={styles.cardImage}
          resizeMode="cover"
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
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={16} color="#64748B" />
          <Text style={styles.detailText}>{item.phone}</Text>
        </View>
      </View>

      {item.type === "upcoming" && item.status.toLowerCase() !== "cancelled" && (
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
      {/* Header Tabs */}
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

      {/* New Booking Button */}
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

      {/* Booking List Container */}
      {loading ? (
        <View style={styles.emptyBox}>
          <ActivityIndicator size="large" color={Colors.primary || "#2563EB"} />
        </View>
      ) : filteredBookings.length > 0 ? (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingCard}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
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
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
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
  listContainer: {
    paddingBottom: 240,
  },
  tabText: { fontSize: 14, fontWeight: "600", color: "#64748B" },
  activeTabText: { color: Colors.primary || "#2563EB" },
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
  cardHeader: { flexDirection: "row", alignItems: "center" },
  cardImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
  },
  headerInfo: { flex: 1, marginLeft: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
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
  badgeText: { fontSize: 11, fontWeight: "700", color: "#475569" },
  confirmedBadge: { backgroundColor: "#DCFCE7" },
  pendingBadge: { backgroundColor: "#FEF3C7" },
  cancelledBadge: { backgroundColor: "#FEE2E2" },
  completedBadge: { backgroundColor: "#F1F5F9" },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 10 },
  cardDetails: { gap: 6 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  detailText: { fontSize: 13, color: "#64748B" },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  cancelBtnText: { color: "#EF4444", fontSize: 12, fontWeight: "600" },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: { marginTop: 8, color: "#94A3B8", fontSize: 14 },
});
