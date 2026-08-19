import RatingModal from "@/components/booking/RatingModal";
import Colors from "@/constants/colors";
import { createClerkSupabaseClient } from "@/utils/supabase";
import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export interface BookingDisplayItem {
  id: string;
  title: string;
  price: string;
  numericAmount: number;
  date: string;
  address: string;
  phone: string;
  paymentId?: string;
  vehicleName?: string;
  status: "Confirmed" | "Pending" | "Cancelled" | "Completed" | "Failed" | string;
  type: "upcoming" | "past";
}

export default function BookingTabs() {
  const router = useRouter();
  const { user } = useUser();
  const { userId, getToken } = useAuth();

  const clerkSupabase = useMemo(() => createClerkSupabaseClient(getToken), [getToken]);

  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingDisplayItem[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<BookingDisplayItem | null>(null);
  const [ratingTarget, setRatingTarget] = useState<BookingDisplayItem | null>(null);

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
            (item.services_booked && item.services_booked.items?.[0]?.title) ||
            (item.services_booked && item.services_booked[0]?.title) ||
            "Car Wash Service";

          const displayDate =
            item.booking_date ||
            (item.scheduled_date
              ? new Date(item.scheduled_date).toLocaleDateString()
              : "Scheduled Soon");

          const rawAmount = Number(item.total_amount ?? item.amount ?? 0);
          const displayPrice = `₹${rawAmount}`;
          const displayPhone = item.primary_phone || item.phone || "N/A";
          const displayAddress =
            item.address ||
            (item.service_type === "pickup" ? "Pickup Requested" : "Workshop Center");

          const vehicleName = item.services_booked?.vehicle?.name || item.vehicle_name || "Vehicle";

          return {
            id: item.id,
            title,
            price: displayPrice,
            numericAmount: rawAmount,
            date: displayDate,
            address: displayAddress,
            status: item.status || "Pending",
            phone: displayPhone,
            paymentId: item.payment_id || "Prepaid",
            vehicleName,
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

  // Review Submit Handler (Direct Authentic Name fetch from 'profiles')
  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!ratingTarget || !userId) return;

    try {
      const { data: profileData } = await clerkSupabase
        .from("profiles")
        .select("name")
        .eq("clerk_user_id", userId)
        .maybeSingle();

      const authenticName =
        profileData?.name?.trim() || user?.fullName || user?.firstName || "Verified Customer";

      const { error } = await clerkSupabase.from("reviews").insert({
        booking_id: ratingTarget.id,
        clerk_user_id: userId,
        user_name: authenticName,
        rating: rating,
        comment: comment || null,
        service_name: ratingTarget.title,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      Alert.alert("Thank You!", "Your verified review has been posted.");
    } catch (err: any) {
      Alert.alert("Feedback Received", `Thank you for rating ${rating} ⭐!`);
    }
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
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
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

      {/* Action Buttons */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.invoiceBtn}
          activeOpacity={0.8}
          onPress={() => setSelectedInvoice(item)}
        >
          <Ionicons name="receipt-outline" size={15} color="#2563EB" />
          <Text style={styles.invoiceBtnText}>View Receipt</Text>
        </TouchableOpacity>

        {item.type === "past" && item.status.toLowerCase() !== "cancelled" && (
          <TouchableOpacity
            style={[styles.invoiceBtn, { backgroundColor: "#FEF3C7", borderColor: "#FDE68A" }]}
            activeOpacity={0.8}
            onPress={() => setRatingTarget(item)}
          >
            <Ionicons name="star" size={15} color="#D97706" />
            <Text style={[styles.invoiceBtnText, { color: "#D97706" }]}>Rate Service</Text>
          </TouchableOpacity>
        )}

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

      {/* List Container */}
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

      {/* Digital Receipt Modal (Pure React Native JS) */}
      <Modal
        visible={!!selectedInvoice}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedInvoice(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedInvoice(null)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.invoiceCard}>
              <View style={styles.invoiceHeader}>
                <View>
                  <Text style={styles.invoiceCompany}>Speed Car Wash</Text>
                  <Text style={styles.invoiceSub}>Official Tax Receipt</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedInvoice(null)}>
                  <Ionicons name="close-circle" size={26} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {selectedInvoice && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.invoiceRefBox}>
                    <Text style={styles.invoiceRefLabel}>RECEIPT ID</Text>
                    <Text style={styles.invoiceRefValue}>
                      #{selectedInvoice.id.slice(0, 8).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.invoiceMeta}>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Date:</Text>
                      <Text style={styles.metaValue}>{selectedInvoice.date}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Vehicle:</Text>
                      <Text style={styles.metaValue}>{selectedInvoice.vehicleName}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Payment Ref:</Text>
                      <Text style={styles.metaValue}>{selectedInvoice.paymentId}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Status:</Text>
                      <Text style={[styles.metaValue, { color: "#16A34A", fontWeight: "700" }]}>
                        {selectedInvoice.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.billTable}>
                    <Text style={styles.tableHead}>ITEM BREAKDOWN</Text>

                    <View style={styles.tableRow}>
                      <Text style={styles.tableName}>{selectedInvoice.title}</Text>
                      <Text style={styles.tablePrice}>
                        ₹{Math.round((selectedInvoice.numericAmount || 499) / 1.18)}
                      </Text>
                    </View>

                    <View style={styles.tableRow}>
                      <Text style={styles.tableName}>Integrated GST (18%)</Text>
                      <Text style={styles.tablePrice}>
                        ₹
                        {(selectedInvoice.numericAmount || 499) -
                          Math.round((selectedInvoice.numericAmount || 499) / 1.18)}
                      </Text>
                    </View>

                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={styles.totalLabel}>Total Paid</Text>
                      <Text style={styles.totalAmount}>
                        ₹{selectedInvoice.numericAmount || 499}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.doneBtn} onPress={() => setSelectedInvoice(null)}>
                    <Text style={styles.doneBtnText}>Close Receipt</Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* Rating & Review Modal */}
      <RatingModal
        visible={!!ratingTarget}
        serviceTitle={ratingTarget?.title || "Car Wash Service"}
        onClose={() => setRatingTarget(null)}
        onSubmit={handleSubmitReview}
      />
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
  listContainer: { paddingBottom: 240 },
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
  addBookingBtnText: { color: "#FFFFFF", fontWeight: "700", marginLeft: 6, fontSize: 14 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  cardImage: { width: 50, height: 50, borderRadius: 10, backgroundColor: "#F1F5F9" },
  headerInfo: { flex: 1, marginLeft: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  cardPrice: { fontSize: 14, fontWeight: "600", color: Colors.primary || "#2563EB", marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: "#F1F5F9" },
  badgeText: { fontSize: 11, fontWeight: "700", color: "#475569" },
  confirmedBadge: { backgroundColor: "#DCFCE7" },
  pendingBadge: { backgroundColor: "#FEF3C7" },
  cancelledBadge: { backgroundColor: "#FEE2E2" },
  completedBadge: { backgroundColor: "#F1F5F9" },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 10 },
  cardDetails: { gap: 6 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  detailText: { fontSize: 13, color: "#64748B" },
  cardActions: { flexDirection: "row", gap: 10, marginTop: 12 },
  invoiceBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  invoiceBtnText: { color: Colors.primary || "#2563EB", fontSize: 13, fontWeight: "600" },
  cancelBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  cancelBtnText: { color: "#EF4444", fontSize: 13, fontWeight: "600" },
  emptyBox: { alignItems: "center", justifyContent: "center", paddingVertical: 40 },
  emptyText: { marginTop: 8, color: "#94A3B8", fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  invoiceCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    maxHeight: "85%",
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  invoiceCompany: { fontSize: 18, fontWeight: "800", color: Colors.primary || "#2563EB" },
  invoiceSub: { fontSize: 12, color: "#64748B", marginTop: 2 },
  invoiceRefBox: { backgroundColor: "#F8FAFC", padding: 12, borderRadius: 10, marginBottom: 14 },
  invoiceRefLabel: { fontSize: 10, fontWeight: "700", color: "#94A3B8" },
  invoiceRefValue: { fontSize: 15, fontWeight: "700", color: "#0F172A", marginTop: 2 },
  invoiceMeta: { gap: 8, marginBottom: 16 },
  metaRow: { flexDirection: "row", justifyContent: "space-between" },
  metaLabel: { fontSize: 13, color: "#64748B" },
  metaValue: { fontSize: 13, color: "#0F172A", fontWeight: "600" },
  billTable: { borderTopWidth: 1, borderTopColor: "#E2E8F0", paddingTop: 14, marginBottom: 20 },
  tableHead: { fontSize: 11, fontWeight: "700", color: "#94A3B8", marginBottom: 8 },
  tableRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  tableName: { fontSize: 13, color: "#334155" },
  tablePrice: { fontSize: 13, fontWeight: "600", color: "#0F172A" },
  totalRow: { borderTopWidth: 1, borderTopColor: "#E2E8F0", marginTop: 8, paddingTop: 10 },
  totalLabel: { fontSize: 15, fontWeight: "800", color: "#0F172A" },
  totalAmount: { fontSize: 17, fontWeight: "800", color: Colors.primary || "#2563EB" },
  doneBtn: {
    backgroundColor: Colors.primary || "#2563EB",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  doneBtnText: { color: "#FFF", fontSize: 14, fontWeight: "700" },
});
