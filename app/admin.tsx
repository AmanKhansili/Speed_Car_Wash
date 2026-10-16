import Colors from "@/constants/colors";
import { createClerkSupabaseClient } from "@/utils/supabase";
import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FilterStatus = "All" | "Pending" | "Confirmed" | "Completed" | "Cancelled";

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { userId, getToken } = useAuth();

  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [filter, setFilter] = useState<FilterStatus>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const loadAdminData = useCallback(async () => {
    if (!userId) {
      await Promise.resolve();
      setLoading(false);
      return;
    }

    try {
      const client = createClerkSupabaseClient(() => getTokenRef.current());

      const { data: profile, error: profileErr } = await client
        .from("profiles")
        .select("is_admin, name")
        .eq("clerk_user_id", userId)
        .maybeSingle();

      if (profileErr) throw profileErr;

      if (!profile?.is_admin) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      const { data, error } = await client
        .from("bookings")
        .select("*")
        .not("status", "in", '("Saved","Saved_Template","saved")')
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (err: any) {
      console.error("Admin fetch error:", err);
      Alert.alert(
        "Error Loading Bookings",
        err?.message || "Please check your Supabase Admin RLS policies.",
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    let active = true;
    const init = async () => {
      if (active) {
        await loadAdminData();
      }
    };
    init();
    return () => {
      active = false;
    };
  }, [loadAdminData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAdminData();
    setRefreshing(false);
  }, [loadAdminData]);

  const handleUpdateStatus = async (booking: any, newStatus: string) => {
    const confirmMsg =
      newStatus === "Completed"
        ? `Mark booking #${booking.id.slice(0, 6).toUpperCase()} as Completed? This will also send a Review Request notification to the customer.`
        : newStatus === "Cancelled"
          ? `Are you sure you want to Cancel booking #${booking.id.slice(0, 6).toUpperCase()}?`
          : `Verify payment & Confirm booking #${booking.id.slice(0, 6).toUpperCase()}?`;

    Alert.alert(`Update to ${newStatus}`, confirmMsg, [
      { text: "No", style: "cancel" },
      {
        text: `Yes, ${newStatus}`,
        style: newStatus === "Cancelled" ? "destructive" : "default",
        onPress: async () => {
          setUpdatingId(booking.id);
          try {
            const client = createClerkSupabaseClient(() => getTokenRef.current());

            const updatePayload: Record<string, any> = {
              status: newStatus,
            };

            if (newStatus === "Completed" && booking.payment_id === "CASH_OR_SPOT_QR") {
              updatePayload.payment_id = "PAID_CASH_OR_QR";
            }

            const { error } = await client
              .from("bookings")
              .update(updatePayload)
              .eq("id", booking.id);

            if (error) throw error;

            setBookings((prev) =>
              prev.map((b) => (b.id === booking.id ? { ...b, ...updatePayload } : b)),
            );
          } catch (err: any) {
            Alert.alert("Update Failed", err?.message || "Could not update status.");
          } finally {
            setUpdatingId(null);
          }
        },
      },
    ]);
  };

  const handleCallCustomer = (phone?: string) => {
    if (!phone) {
      Alert.alert("No Phone", "Customer phone number is not available.");
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsAppCustomer = (item: any) => {
    const rawPhone = item.primary_phone || item.phone || "";
    const digits = rawPhone.replace(/\D/g, "");
    if (!digits) {
      Alert.alert("No Phone", "Customer phone number is not available.");
      return;
    }
    const cleanPhone = digits.length === 10 ? `91${digits}` : digits;
    const msg = `Hello from *Speed Car Wash* 🚗!\n\nRegarding your booking *#${item.id
      .slice(0, 6)
      .toUpperCase()}*:\n• Service: ${item.service_name}\n• Date: ${
      item.booking_date
    }\n• Amount: ₹${item.total_amount || item.amount}\n• Status: *${
      item.status
    }*\n\nPlease let us know if you have any questions!`;

    Linking.openURL(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`).catch(() =>
      Alert.alert("Error", "Could not open WhatsApp."),
    );
  };

  const handleOpenMaps = (address?: string) => {
    if (!address) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const totalBookingsCount = bookings.length;
  const completedCount = bookings.filter((b) => b.status?.toLowerCase() === "completed").length;
  const totalRevenue = bookings
    .filter((b) => ["confirmed", "completed"].includes(b.status?.toLowerCase() || ""))
    .reduce((sum, b) => sum + Number(b.total_amount ?? b.amount ?? 0), 0);

  const cashToCollect = bookings
    .filter((b) => b.payment_id === "CASH_OR_SPOT_QR" && b.status?.toLowerCase() === "confirmed")
    .reduce((sum, b) => sum + Number(b.total_amount ?? b.amount ?? 0), 0);

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus =
      filter === "All" ? true : (b.status || "").toLowerCase() === filter.toLowerCase();

    if (!matchesStatus) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    const idMatch = (b.id || "").toLowerCase().includes(q);
    const serviceMatch = (b.service_name || "").toLowerCase().includes(q);
    const phoneMatch = (b.primary_phone || b.phone || "").toLowerCase().includes(q);
    const addressMatch = (b.address || "").toLowerCase().includes(q);
    const vehicleMatch = (b.services_booked?.vehicle?.name || "").toLowerCase().includes(q);
    const utrMatch = (b.payment_id || "").toLowerCase().includes(q);

    return idMatch || serviceMatch || phoneMatch || addressMatch || vehicleMatch || utrMatch;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary || "#2563EB"} />
        <Text style={styles.loadingText}>Loading Admin Dashboard...</Text>
      </SafeAreaView>
    );
  }

  if (isAdmin === false) {
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons name="lock-closed-outline" size={56} color="#EF4444" />
        <Text style={styles.restrictedTitle}>Admin Access Only</Text>
        <Text style={styles.restrictedSub}>
          Your account does not have administrator privileges enabled in Supabase.
        </Text>
        <TouchableOpacity
          style={styles.backHomeBtn}
          onPress={() => router.replace("/(tabs)" as any)}
        >
          <Text style={styles.backHomeBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const renderBookingCard = ({ item }: { item: any }) => {
    const amount = Number(item.total_amount ?? item.amount ?? 0);
    const phone = item.primary_phone || item.phone || "N/A";
    const vehicle = item.services_booked?.vehicle;
    const isCashOnSpot = item.payment_id === "CASH_OR_SPOT_QR";
    const isPaidOnSpot = item.payment_id === "PAID_CASH_OR_QR";
    const isUtrSubmitted = item.payment_id?.startsWith("UTR-");
    const isUpiPaid = item.payment_id?.startsWith("UPI-") || isUtrSubmitted;
    const status = item.status || "Pending";

    return (
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <View style={styles.refBadge}>
            <Text style={styles.refText}>#{item.id.slice(0, 6).toUpperCase()}</Text>
          </View>

          <View
            style={[
              styles.serviceTypeBadge,
              item.service_type === "pickup"
                ? { backgroundColor: "#EFF6FF" }
                : { backgroundColor: "#F3E8FF" },
            ]}
          >
            <Ionicons
              name={item.service_type === "pickup" ? "navigate-outline" : "storefront-outline"}
              size={12}
              color={item.service_type === "pickup" ? "#2563EB" : "#7E22CE"}
            />
            <Text
              style={[
                styles.serviceTypeText,
                {
                  color: item.service_type === "pickup" ? "#2563EB" : "#7E22CE",
                },
              ]}
            >
              {(item.service_type || "PICKUP").toUpperCase()}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              status === "Confirmed" && styles.statusConfirmed,
              status === "Pending" && styles.statusPending,
              status === "Completed" && styles.statusCompleted,
              status === "Cancelled" && styles.statusCancelled,
            ]}
          >
            <Text style={styles.statusBadgeText}>{status}</Text>
          </View>
        </View>

        <View style={styles.titleAmountRow}>
          <Text style={styles.serviceTitle} numberOfLines={2}>
            {item.service_name || "Car Wash Service"}
          </Text>
          <Text style={styles.amountText}>₹{amount}</Text>
        </View>

        {/* Payment Verification Banner */}
        <View
          style={[
            styles.paymentBanner,
            (isUpiPaid && status !== "Pending") || isPaidOnSpot
              ? styles.paymentBannerGreen
              : isCashOnSpot || (isUtrSubmitted && status === "Pending")
                ? styles.paymentBannerAmber
                : styles.paymentBannerGray,
          ]}
        >
          <Ionicons
            name={
              (isUpiPaid && status !== "Pending") || isPaidOnSpot
                ? "checkmark-circle"
                : isUtrSubmitted
                  ? "shield-half-outline"
                  : isCashOnSpot
                    ? "cash-outline"
                    : "time-outline"
            }
            size={15}
            color={
              (isUpiPaid && status !== "Pending") || isPaidOnSpot
                ? "#15803D"
                : isCashOnSpot || isUtrSubmitted
                  ? "#B45309"
                  : "#475569"
            }
          />
          <Text
            style={[
              styles.paymentBannerText,
              {
                color:
                  (isUpiPaid && status !== "Pending") || isPaidOnSpot
                    ? "#15803D"
                    : isCashOnSpot || isUtrSubmitted
                      ? "#B45309"
                      : "#475569",
              },
            ]}
          >
            {isUtrSubmitted && status === "Pending"
              ? `Verify 12-Digit ${item.payment_id} in Bank SMS -> Tap Confirm`
              : isUpiPaid
                ? `UPI Verified (${item.payment_id}) ✅`
                : isPaidOnSpot
                  ? "Cash / Spot QR Collected ✅"
                  : isCashOnSpot
                    ? `Collect ₹${amount} on Spot (Cash / QR)`
                    : `Payment Pending (${item.payment_id || "Unpaid"})`}
          </Text>
        </View>

        <View style={styles.detailsBox}>
          {vehicle && (
            <View style={styles.detailRow}>
              <Ionicons name="car-sport-outline" size={15} color="#64748B" />
              <Text style={styles.detailText}>
                {vehicle.name}{" "}
                {vehicle.registration_number ? `• ${vehicle.registration_number}` : ""}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={15} color="#64748B" />
            <Text style={styles.detailText}>{item.booking_date || "Date not specified"}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={15} color="#64748B" />
            <Text style={styles.detailText}>
              {phone}
              {item.alt_phone ? ` (Alt: ${item.alt_phone})` : ""}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={15} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={2}>
              {item.address || "Workshop Center"}
            </Text>
          </View>
        </View>

        <View style={styles.commRow}>
          <TouchableOpacity style={styles.commBtn} onPress={() => handleCallCustomer(phone)}>
            <Ionicons name="call" size={15} color="#2563EB" />
            <Text style={styles.commBtnText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.commBtn, styles.commBtnWhatsApp]}
            onPress={() => handleWhatsAppCustomer(item)}
          >
            <Ionicons name="logo-whatsapp" size={15} color="#16A34A" />
            <Text style={[styles.commBtnText, { color: "#16A34A" }]}>WhatsApp</Text>
          </TouchableOpacity>

          {item.address && (
            <TouchableOpacity style={styles.commBtn} onPress={() => handleOpenMaps(item.address)}>
              <Ionicons name="map-outline" size={15} color="#475569" />
              <Text style={[styles.commBtnText, { color: "#475569" }]}>Maps</Text>
            </TouchableOpacity>
          )}
        </View>

        {updatingId === item.id ? (
          <View style={{ paddingVertical: 12, alignItems: "center" }}>
            <ActivityIndicator size="small" color="#2563EB" />
          </View>
        ) : (
          <View style={styles.actionRow}>
            {status !== "Confirmed" && status !== "Completed" && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.confirmBtn]}
                onPress={() => handleUpdateStatus(item, "Confirmed")}
              >
                <Ionicons name="checkmark-circle-outline" size={16} color="#FFF" />
                <Text style={styles.actionBtnText}>Confirm</Text>
              </TouchableOpacity>
            )}

            {status !== "Completed" && status !== "Cancelled" && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.completeBtn]}
                onPress={() => handleUpdateStatus(item, "Completed")}
              >
                <Ionicons name="sparkles-outline" size={16} color="#FFF" />
                <Text style={styles.actionBtnText}>Mark Completed</Text>
              </TouchableOpacity>
            )}

            {status !== "Cancelled" && status !== "Completed" && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={() => handleUpdateStatus(item, "Cancelled")}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIconBtn}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.headerTitle}>Admin Control Center</Text>
          <Text style={styles.headerSub}>Manage live bookings & payments</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.headerIconBtn}>
          <Ionicons name="refresh" size={20} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Bookings</Text>
          <Text style={styles.statValue}>{totalBookingsCount}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Completed</Text>
          <Text style={[styles.statValue, { color: "#2563EB" }]}>{completedCount}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Revenue</Text>
          <Text style={[styles.statValue, { color: "#16A34A" }]}>₹{totalRevenue}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Cash Pending</Text>
          <Text style={[styles.statValue, { color: "#D97706" }]}>₹{cashToCollect}</Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search UTR, phone, car, service, or #ID..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={{ height: 46 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {(["All", "Pending", "Confirmed", "Completed", "Cancelled"] as FilterStatus[]).map(
            (tab) => {
              const count =
                tab === "All"
                  ? bookings.length
                  : bookings.filter((b) => (b.status || "").toLowerCase() === tab.toLowerCase())
                      .length;
              const active = filter === tab;

              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setFilter(tab)}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {tab} ({count})
                  </Text>
                </TouchableOpacity>
              );
            },
          )}
        </ScrollView>
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="clipboard-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No {filter} bookings found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  loadingText: { marginTop: 12, fontSize: 14, color: "#64748B", fontWeight: "600" },
  restrictedTitle: { fontSize: 20, fontWeight: "800", color: "#0F172A", marginTop: 12 },
  restrictedSub: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
  },
  backHomeBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backHomeBtnText: { color: "#FFF", fontWeight: "700" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#0F172A" },
  headerSub: { fontSize: 11.5, color: "#64748B", marginTop: 1 },

  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  statLabel: { fontSize: 10.5, color: "#64748B", fontWeight: "600" },
  statValue: { fontSize: 15, fontWeight: "800", color: "#0F172A", marginTop: 3 },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 12,
    marginTop: 10,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 13.5, color: "#0F172A" },

  filterScroll: {
    paddingHorizontal: 12,
    alignItems: "center",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
  },
  filterChipActive: { backgroundColor: "#2563EB" },
  filterChipText: { fontSize: 12, fontWeight: "700", color: "#475569" },
  filterChipTextActive: { color: "#FFFFFF" },

  listContent: { padding: 12, paddingBottom: 60 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  refBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  refText: { fontSize: 11, fontWeight: "800", color: "#334155" },
  serviceTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  serviceTypeText: { fontSize: 10.5, fontWeight: "800" },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
  },
  statusConfirmed: { backgroundColor: "#DCFCE7" },
  statusPending: { backgroundColor: "#FEF3C7" },
  statusCompleted: { backgroundColor: "#DBEAFE" },
  statusCancelled: { backgroundColor: "#FEE2E2" },
  statusBadgeText: { fontSize: 11, fontWeight: "800", color: "#1E293B" },

  titleAmountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  serviceTitle: {
    flex: 1,
    fontSize: 15.5,
    fontWeight: "800",
    color: "#0F172A",
    marginRight: 8,
  },
  amountText: { fontSize: 17, fontWeight: "900", color: "#2563EB" },

  paymentBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    marginBottom: 10,
  },
  paymentBannerGreen: { backgroundColor: "#DCFCE7" },
  paymentBannerAmber: { backgroundColor: "#FEF3C7" },
  paymentBannerGray: { backgroundColor: "#F1F5F9" },
  paymentBannerText: { fontSize: 12, fontWeight: "700", flex: 1 },

  detailsBox: {
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 10,
    gap: 5,
    marginBottom: 10,
  },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  detailText: { fontSize: 12.5, color: "#334155", fontWeight: "500", flex: 1 },

  commRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  commBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
  },
  commBtnWhatsApp: {
    borderColor: "#BBF7D0",
    backgroundColor: "#F0FDF4",
  },
  commBtnText: { fontSize: 12, fontWeight: "700", color: "#2563EB" },

  actionRow: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
    borderRadius: 9,
  },
  confirmBtn: { backgroundColor: "#2563EB" },
  completeBtn: { backgroundColor: "#16A34A" },
  cancelBtn: {
    flex: 0.6,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  actionBtnText: { color: "#FFFFFF", fontSize: 12.5, fontWeight: "700" },
  cancelBtnText: { color: "#DC2626", fontSize: 12.5, fontWeight: "700" },

  emptyBox: { alignItems: "center", paddingVertical: 50 },
  emptyTitle: { marginTop: 10, fontSize: 14, color: "#94A3B8", fontWeight: "600" },
});
