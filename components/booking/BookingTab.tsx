import RatingModal from "@/components/booking/RatingModal";
import Colors from "@/constants/colors";
import { createClerkSupabaseClient } from "@/utils/supabase";
import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const DEFAULT_UPI_ID = process.env.EXPO_PUBLIC_MERCHANT_UPI_ID || "paytmqr5hk7au@ptys";
const MERCHANT_NAME = process.env.EXPO_PUBLIC_MERCHANT_NAME || "Speed Car Wash";
const SUPPORT_WHATSAPP = process.env.EXPO_PUBLIC_SUPPORT_PHONE || "918938936776";

function isValidUtr(utr: string): boolean {
  const cleaned = utr.trim();
  if (!/^\d{12}$/.test(cleaned)) return false;
  if (/^(\d)\1{11}$/.test(cleaned)) return false;
  return true;
}

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

  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [bookings, setBookings] = useState<BookingDisplayItem[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<BookingDisplayItem | null>(null);
  const [ratingTarget, setRatingTarget] = useState<BookingDisplayItem | null>(null);

  const isFetchingRef = useRef(false);

  // Retry UPI Modal State
  const [retryBookingTarget, setRetryBookingTarget] = useState<BookingDisplayItem | null>(null);
  const [utrInput, setUtrInput] = useState("");
  const [submittingUtr, setSubmittingUtr] = useState(false);

  const loadData = useCallback(async () => {
    if (!userId || isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const client = createClerkSupabaseClient(() => getTokenRef.current());
      const { data, error } = await client
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
            paymentId: item.payment_id || "Pending",
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
      isFetchingRef.current = false;
    }
  }, [userId]);

  useEffect(() => {
    let ignore = false;

    const runInit = async () => {
      if (!userId) {
        if (!ignore) setLoading(false);
        return;
      }
      await loadData();
    };

    runInit();

    return () => {
      ignore = true;
    };
  }, [userId, loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleRetryPayment = async (booking: BookingDisplayItem) => {
    if (!userId) return;

    const note = `Booking-${booking.id.slice(0, 8).toUpperCase()}`;
    const upiUrl = `upi://pay?pa=${DEFAULT_UPI_ID}&pn=${encodeURIComponent(
      MERCHANT_NAME,
    )}&am=${booking.numericAmount}&cu=INR&tn=${encodeURIComponent(note)}&tr=${booking.id}`;

    setUtrInput("");
    setRetryBookingTarget(booking);

    const canOpen = await Linking.canOpenURL(upiUrl).catch(() => false);
    if (canOpen) {
      await Linking.openURL(upiUrl).catch(() => {});
    }
  };

  const handleSubmitRetryUtr = async () => {
    if (!retryBookingTarget || !userId) return;

    if (!isValidUtr(utrInput)) {
      Alert.alert(
        "Invalid UTR Number",
        "Please enter the valid 12-digit UPI Ref / UTR number from your payment receipt.",
      );
      return;
    }

    setSubmittingUtr(true);
    try {
      const client = createClerkSupabaseClient(() => getTokenRef.current());
      const paymentRef = `UTR-${utrInput.trim()}`;

      const { error } = await client
        .from("bookings")
        .update({
          payment_id: paymentRef,
          status: "Pending",
        })
        .eq("id", retryBookingTarget.id);

      if (error) throw error;

      setRetryBookingTarget(null);
      setUtrInput("");
      Alert.alert(
        "UTR Submitted ⏳",
        `UTR ${paymentRef} recorded. Once Admin verifies your payment, status will update to Confirmed.`,
      );
      loadData();
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Could not submit UTR.");
    } finally {
      setSubmittingUtr(false);
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
            const client = createClerkSupabaseClient(() => getTokenRef.current());
            const { error } = await client
              .from("bookings")
              .update({ status: "Cancelled" })
              .eq("id", id);

            if (error) throw error;

            setBookings((prev) =>
              prev.map((item) =>
                item.id === id ? { ...item, status: "Cancelled", type: "past" } : item,
              ),
            );
          } catch {
            Alert.alert("Error", "Could not cancel booking");
          }
        },
      },
    ]);
  };

  const handleWhatsAppSupport = (item: BookingDisplayItem) => {
    const msg = `Hi Speed Car Wash! I have a question regarding my booking #${item.id
      .slice(0, 6)
      .toUpperCase()} (${item.title} on ${item.date}).`;
    Linking.openURL(`https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(msg)}`).catch(() =>
      Alert.alert("Error", "Could not open WhatsApp."),
    );
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!ratingTarget || !userId) return;

    try {
      const client = createClerkSupabaseClient(() => getTokenRef.current());
      const { data: profileData } = await client
        .from("profiles")
        .select("name")
        .eq("clerk_user_id", userId)
        .maybeSingle();

      const authenticName =
        profileData?.name?.trim() ||
        user?.fullName ||
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
        "Verified Customer";

      const { error } = await client.from("reviews").insert({
        booking_id: ratingTarget.id,
        clerk_user_id: userId,
        user_name: authenticName,
        rating,
        comment: comment || null,
        service_name: ratingTarget.title,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      Alert.alert(
        "Review Submitted! ⭐",
        "Thank you for your feedback! It helps us keep your ride looking its best.",
      );
    } catch (err) {
      console.error("Review Submit Error:", err);
      Alert.alert("Submission Failed", "Could not save your review right now. Please try again.");
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

  const renderBookingCard = ({ item }: { item: BookingDisplayItem }) => {
    const statusLower = item.status.toLowerCase();
    const isPendingOrFailed = statusLower === "pending" || statusLower === "failed";
    const isCompleted = statusLower === "completed";
    const isConfirmed = statusLower === "confirmed";
    const isCashOnSpot = item.paymentId === "CASH_OR_SPOT_QR";
    const isUtrSubmitted = item.paymentId?.startsWith("UTR-");
    const isUpiPaid = item.paymentId?.startsWith("UPI-") || isUtrSubmitted;

    return (
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginTop: 2,
              }}
            >
              <Text style={styles.cardPrice}>{item.price}</Text>
              <Text style={styles.paymentModeText}>
                {isUtrSubmitted && statusLower === "pending"
                  ? `• UTR Sent (${item.paymentId})`
                  : isUpiPaid
                    ? "Paid via UPI"
                    : isCashOnSpot
                      ? "• Pay After Wash"
                      : item.paymentId === "PAID_CASH_OR_QR"
                        ? "Paid on Spot"
                        : "Payment Pending"}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.badge,
              item.status === "Confirmed" && styles.confirmedBadge,
              item.status === "Pending" && styles.pendingBadge,
              item.status === "Cancelled" && styles.cancelledBadge,
              item.status === "Completed" && styles.completedBadge,
              item.status === "Failed" && styles.cancelledBadge,
            ]}
          >
            <Text style={styles.badgeText}>{item.status}</Text>
          </View>
        </View>

        {/* Live Status Stepper for Active Bookings */}
        {statusLower !== "cancelled" && statusLower !== "failed" && (
          <View style={styles.stepperWrap}>
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, styles.stepDotDone]}>
                <Ionicons name="checkmark" size={10} color="#FFF" />
              </View>
              <Text style={styles.stepLabelActive}>Booked</Text>
            </View>

            <View style={[styles.stepLine, (isConfirmed || isCompleted) && styles.stepLineDone]} />

            <View style={styles.stepItem}>
              <View style={[styles.stepDot, (isConfirmed || isCompleted) && styles.stepDotDone]}>
                {isConfirmed || isCompleted ? (
                  <Ionicons name="checkmark" size={10} color="#FFF" />
                ) : null}
              </View>
              <Text style={isConfirmed || isCompleted ? styles.stepLabelActive : styles.stepLabel}>
                Confirmed
              </Text>
            </View>

            <View style={[styles.stepLine, isCompleted && styles.stepLineDone]} />

            <View style={styles.stepItem}>
              <View style={[styles.stepDot, isCompleted && styles.stepDotDone]}>
                {isCompleted ? <Ionicons name="checkmark" size={10} color="#FFF" /> : null}
              </View>
              <Text style={isCompleted ? styles.stepLabelActive : styles.stepLabel}>Completed</Text>
            </View>
          </View>
        )}

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

        <View style={styles.cardActions}>
          {isPendingOrFailed ? (
            <>
              {!isUtrSubmitted && (
                <TouchableOpacity
                  style={styles.retryPayBtn}
                  activeOpacity={0.8}
                  onPress={() => handleRetryPayment(item)}
                >
                  <Ionicons name="flash-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.retryPayBtnText}>Pay {item.price} via UPI</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.whatsappBtn}
                onPress={() => handleWhatsAppSupport(item)}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-whatsapp" size={15} color="#16A34A" />
                <Text style={styles.whatsappBtnText}>Support</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => handleCancel(item.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {isCompleted && (
                <TouchableOpacity
                  style={styles.invoiceBtn}
                  activeOpacity={0.8}
                  onPress={() => setSelectedInvoice(item)}
                >
                  <Ionicons name="receipt-outline" size={15} color="#2563EB" />
                  <Text style={styles.invoiceBtnText}>View Receipt</Text>
                </TouchableOpacity>
              )}

              {isCompleted && (
                <TouchableOpacity
                  style={[
                    styles.invoiceBtn,
                    { backgroundColor: "#FEF3C7", borderColor: "#FDE68A" },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setRatingTarget(item)}
                >
                  <Ionicons name="star" size={15} color="#D97706" />
                  <Text style={[styles.invoiceBtnText, { color: "#D97706" }]}>Rate Service</Text>
                </TouchableOpacity>
              )}

              {isConfirmed && item.type === "upcoming" && (
                <>
                  <TouchableOpacity
                    style={styles.whatsappBtn}
                    onPress={() => handleWhatsAppSupport(item)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="logo-whatsapp" size={15} color="#16A34A" />
                    <Text style={styles.whatsappBtnText}>Support</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => handleCancel(item.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
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

      <FlatList
        data={loading ? [] : filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          (loading || filteredBookings.length === 0) && styles.emptyContainer,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary || "#2563EB"]}
            tintColor={Colors.primary || "#2563EB"}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyBox}>
            {loading && !refreshing ? (
              <ActivityIndicator size="large" color={Colors.primary || "#2563EB"} />
            ) : (
              <>
                <Ionicons name="calendar-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyText}>No {activeTab} bookings found.</Text>
              </>
            )}
          </View>
        )}
      />

      {/* Retry 12-Digit UTR Verification Modal */}
      <Modal
        visible={!!retryBookingTarget}
        transparent
        animationType="slide"
        onRequestClose={() => setRetryBookingTarget(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlayCenter}
        >
          <View style={styles.utrModalCard}>
            <Text style={styles.utrModalTitle}>Verify UPI Payment</Text>
            <Text style={styles.utrModalSub}>
              Enter the 12-digit UTR / UPI Reference Number for {retryBookingTarget?.price}
            </Text>

            <TextInput
              style={styles.utrInput}
              placeholder="12-digit UTR (e.g. 428719305821)"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={12}
              value={utrInput}
              onChangeText={(txt) => setUtrInput(txt.replace(/\D/g, ""))}
            />

            <View style={{ flexDirection: "row", gap: 10, width: "100%", marginTop: 14 }}>
              <TouchableOpacity
                style={styles.utrCancelBtn}
                onPress={() => {
                  setRetryBookingTarget(null);
                  setUtrInput("");
                }}
              >
                <Text style={styles.utrCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.utrSubmitBtn,
                  !isValidUtr(utrInput) && { backgroundColor: "#94A3B8" },
                ]}
                onPress={handleSubmitRetryUtr}
                disabled={submittingUtr}
              >
                {submittingUtr ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.utrSubmitText}>Submit UTR</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Official Receipt Modal */}
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
  emptyContainer: { flexGrow: 1, justifyContent: "center" },
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
    fontWeight: "700",
    color: Colors.primary || "#2563EB",
  },
  paymentModeText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#64748B",
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

  stepperWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 10,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  stepDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotDone: {
    backgroundColor: "#16A34A",
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 6,
  },
  stepLineDone: {
    backgroundColor: "#16A34A",
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
  },
  stepLabelActive: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0F172A",
  },

  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 10 },
  cardDetails: { gap: 6 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  detailText: { fontSize: 13, color: "#64748B" },
  cardActions: { flexDirection: "row", gap: 8, marginTop: 12 },
  retryPayBtn: {
    flex: 1.4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryPayBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
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
  invoiceBtnText: {
    color: Colors.primary || "#2563EB",
    fontSize: 13,
    fontWeight: "600",
  },
  whatsappBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  whatsappBtnText: {
    color: "#16A34A",
    fontSize: 12.5,
    fontWeight: "700",
  },
  cancelBtn: {
    flex: 0.8,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  cancelBtnText: { color: "#EF4444", fontSize: 12.5, fontWeight: "600" },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: { marginTop: 8, color: "#94A3B8", fontSize: 14 },

  modalOverlayCenter: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  utrModalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
  },
  utrModalTitle: { fontSize: 17, fontWeight: "800", color: "#0F172A" },
  utrModalSub: {
    fontSize: 12.5,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 14,
  },
  utrInput: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#0F172A",
    textAlign: "center",
  },
  utrCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
  },
  utrCancelText: { color: "#DC2626", fontWeight: "700", fontSize: 13 },
  utrSubmitBtn: {
    flex: 1.3,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#16A34A",
    alignItems: "center",
  },
  utrSubmitText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },

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
  invoiceCompany: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.primary || "#2563EB",
  },
  invoiceSub: { fontSize: 12, color: "#64748B", marginTop: 2 },
  invoiceRefBox: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  invoiceRefLabel: { fontSize: 10, fontWeight: "700", color: "#94A3B8" },
  invoiceRefValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 2,
  },
  invoiceMeta: { gap: 8, marginBottom: 16 },
  metaRow: { flexDirection: "row", justifyContent: "space-between" },
  metaLabel: { fontSize: 13, color: "#64748B" },
  metaValue: { fontSize: 13, color: "#0F172A", fontWeight: "600" },
  billTable: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 14,
    marginBottom: 20,
  },
  tableHead: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  tableName: { fontSize: 13, color: "#334155" },
  tablePrice: { fontSize: 13, fontWeight: "600", color: "#0F172A" },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    marginTop: 8,
    paddingTop: 10,
  },
  totalLabel: { fontSize: 15, fontWeight: "800", color: "#0F172A" },
  totalAmount: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.primary || "#2563EB",
  },
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
