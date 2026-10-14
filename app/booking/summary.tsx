import Colors from "@/constants/colors";
import useUser from "@/context/userContext";
import { useBookingStore } from "@/store/bookingStore";
import { createClerkSupabaseClient } from "@/utils/supabase";
import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DEFAULT_UPI_ID = process.env.EXPO_PUBLIC_MERCHANT_UPI_ID || "amankhansilee@oksbi";
const MERCHANT_NAME = process.env.EXPO_PUBLIC_MERCHANT_NAME || "Speed Car Wash";

type PaymentMethod = "upi" | "pay_after_service";

function isValidUtr(utr: string): boolean {
  const cleaned = utr.trim();
  if (!/^\d{12}$/.test(cleaned)) return false;
  // Reject trivial fake strings like 000000000000 or 111111111111
  if (/^(\d)\1{11}$/.test(cleaned)) return false;
  return true;
}

export default function BookingSummaryScreen() {
  const { userId, getToken } = useAuth();
  const { userData } = useUser();

  const params = useLocalSearchParams<{
    vehicleId?: string;
    serviceId?: string;
    date?: string;
    serviceType?: string;
    addressText?: string;
    primaryPhone?: string;
    altPhone?: string;
    preAppliedCoupon?: string;
    preDiscount?: string;
  }>();

  const initialCoupon = params.preAppliedCoupon || "";
  const initialDiscount = Number(params.preDiscount) || 0;

  const [couponCode, setCouponCode] = useState(initialCoupon);
  const [discount, setDiscount] = useState(initialDiscount);
  const [appliedCoupon, setAppliedCoupon] = useState(initialCoupon);

  const { selectedServices, getTotalPrice, clearCart } = useBookingStore();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingCard, setIsSavingCard] = useState(false);

  // UPI Verification & QR Modal State
  const [isUpiModalVisible, setIsUpiModalVisible] = useState(false);
  const [utrInput, setUtrInput] = useState("");

  const clerkSupabase = useMemo(() => createClerkSupabaseClient(getToken), [getToken]);

  const selectedCar =
    userData?.vehicles?.find((v) => v.id === params.vehicleId) || userData?.vehicles?.[0];

  const carDetails = selectedCar
    ? {
        id: selectedCar.id,
        name: `${selectedCar.brand} ${selectedCar.model}`.trim(),
        registration_number: selectedCar.registrationNumber,
      }
    : null;

  const subTotal = getTotalPrice();
  const discountedSubTotal = Math.max(0, subTotal - discount);
  const gst = Math.round(discountedSubTotal * 0.18);
  const platformFee = 49;
  const grandTotal = discountedSubTotal > 0 ? discountedSubTotal + gst + platformFee : 0;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      Alert.alert("Error", "Please enter a coupon code");
      return;
    }
    if (appliedCoupon) {
      Alert.alert("Coupon Applied", "A coupon is already applied. Remove it first.");
      return;
    }

    if (couponCode.toUpperCase() === "FIRST50") {
      setDiscount(50);
      setAppliedCoupon("FIRST50");
      Alert.alert("Success", "Coupon applied successfully! ₹50 off.");
    } else if (couponCode.toUpperCase() === "CARWASH100") {
      setDiscount(100);
      setAppliedCoupon("CARWASH100");
      Alert.alert("Success", "Coupon applied successfully! ₹100 off.");
    } else {
      Alert.alert("Invalid Coupon", "Use FIRST50 or CARWASH100 for testing.");
    }
  };

  const handleRemoveCoupon = () => {
    setDiscount(0);
    setAppliedCoupon("");
    setCouponCode("");
  };

  const primaryServiceName =
    selectedServices.length > 0
      ? selectedServices.map((s) => s.title).join(", ")
      : "Car Wash Service";

  const generateUpiUrl = () => {
    const note = `SpeedCarWash-${primaryServiceName.slice(0, 18)}`;
    return `upi://pay?pa=${DEFAULT_UPI_ID}&pn=${encodeURIComponent(
      MERCHANT_NAME,
    )}&am=${grandTotal}&cu=INR&tn=${encodeURIComponent(note)}`;
  };

  const copyUpiId = () => {
    Clipboard.setString(DEFAULT_UPI_ID);
    Alert.alert("Copied!", `UPI ID copied to clipboard: ${DEFAULT_UPI_ID}`);
  };

  // Helper to create booking in Supabase ONLY when confirmed by user
  const createBookingInSupabase = async (
    mode: "PAY_AFTER_SERVICE" | "DIRECT_UPI",
    paymentIdValue: string,
    bookingStatus: "Confirmed" | "Pending",
  ) => {
    if (!userId) {
      throw new Error("Please log in again to continue.");
    }

    const bookingPayload = {
      clerk_user_id: userId,
      user_id: userId,
      service_type: params.serviceType || "pickup",
      service_name: primaryServiceName,
      services_booked: {
        items: selectedServices,
        vehicle: carDetails,
        coupon: appliedCoupon || null,
        discount_amount: discount,
        payment_mode: mode,
      },
      booking_date: params.date || new Date().toDateString(),
      scheduled_date: params.date ? new Date(params.date).toISOString() : new Date().toISOString(),
      phone: params.primaryPhone || "",
      primary_phone: params.primaryPhone || "",
      alt_phone: params.altPhone || "",
      address:
        params.addressText ||
        (params.serviceType === "pickup" ? "Pickup Location" : "Workshop Center"),
      amount: grandTotal,
      total_amount: grandTotal,
      payment_id: paymentIdValue,
      status: bookingStatus,
    };

    const { data: booking, error: bookingError } = await clerkSupabase
      .from("bookings")
      .insert([bookingPayload])
      .select()
      .single();

    if (bookingError) throw bookingError;
    return booking;
  };

  // Main CTA Handler
  const handlePaymentAndBooking = async () => {
    if (grandTotal <= 0) {
      Alert.alert("Error", "Your cart is empty!");
      return;
    }

    if (!userId) {
      Alert.alert("Error", "Please log in again to continue.");
      return;
    }

    // Path A: Pay After Wash (Cash / Spot QR)
    if (paymentMethod === "pay_after_service") {
      setIsSubmitting(true);
      try {
        await createBookingInSupabase("PAY_AFTER_SERVICE", "CASH_OR_SPOT_QR", "Confirmed");
        setIsSubmitting(false);
        clearCart();
        Alert.alert(
          "Booking Confirmed! 🎉",
          `Your car wash is scheduled.\nYou can pay ₹${grandTotal} via Cash or QR code scanner after service completion.`,
          [
            {
              text: "View Bookings",
              onPress: () => router.replace("/(tabs)/bookings" as any),
            },
          ],
        );
      } catch (err: any) {
        setIsSubmitting(false);
        Alert.alert("Error", err?.message || "Something went wrong, please try again.");
      }
      return;
    }

    // Path B: Direct UPI Payment
    // Do NOT create booking in DB yet! First launch UPI app and show UTR Verification Modal.
    const upiUrl = generateUpiUrl();
    setUtrInput("");
    setIsUpiModalVisible(true);

    const canOpen = await Linking.canOpenURL(upiUrl).catch(() => false);
    if (canOpen) {
      await Linking.openURL(upiUrl).catch(() => {});
    }
  };

  // Verify 12-Digit UTR and Submit UPI Booking
  const handleVerifyUtrAndBook = async () => {
    if (!isValidUtr(utrInput)) {
      Alert.alert(
        "Invalid UTR / Ref Number",
        "Please enter the valid 12-digit UPI Transaction ID / UTR number from your payment receipt (e.g. Google Pay, PhonePe, Paytm).\n\nIf you cancelled or did not pay, tap Cancel.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanedUtr = utrInput.trim();
      const paymentRef = `UTR-${cleanedUtr}`;

      // Save with status 'Pending' so Admin verifies the 12-digit UTR in their Bank SMS first
      await createBookingInSupabase("DIRECT_UPI", paymentRef, "Pending");

      setIsSubmitting(false);
      setIsUpiModalVisible(false);
      setUtrInput("");
      clearCart();

      Alert.alert(
        "Payment Submitted for Verification ⏳",
        `Your booking request is recorded with UTR: ${cleanedUtr}.\n\nOnce Admin verifies your UPI payment in bank records, your status will automatically update to Confirmed!`,
        [
          {
            text: "View Bookings",
            onPress: () => router.replace("/(tabs)/bookings" as any),
          },
        ],
      );
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert("Error", err?.message || "Could not submit booking. Please try again.");
    }
  };

  const handleSaveConfiguration = async () => {
    if (grandTotal <= 0) {
      Alert.alert("Error", "Your cart is empty!");
      return;
    }
    if (!userId) {
      Alert.alert("Error", "Please log in again to continue.");
      return;
    }

    setIsSavingCard(true);
    try {
      const quickCardPayload = {
        clerk_user_id: userId,
        user_id: userId,
        service_type: params.serviceType || "pickup",
        service_name: primaryServiceName,
        services_booked: {
          items: selectedServices,
          vehicle: carDetails,
          coupon: appliedCoupon || null,
          discount_amount: discount,
        },
        booking_date: params.date || "Template",
        scheduled_date: params.date
          ? new Date(params.date).toISOString()
          : new Date().toISOString(),
        phone: params.primaryPhone || "",
        primary_phone: params.primaryPhone || "",
        alt_phone: params.altPhone || "",
        address:
          params.addressText ||
          (params.serviceType === "pickup" ? "Saved Pickup Location" : "Service Hub"),
        amount: grandTotal,
        total_amount: grandTotal,
        status: "Saved",
      };

      const { error: bookingError } = await clerkSupabase
        .from("bookings")
        .insert([quickCardPayload]);

      if (bookingError) throw bookingError;

      setIsSavingCard(false);
      Alert.alert("Card Saved! 🎉", "Your configuration is saved in Quick Actions on Profile.", [
        {
          text: "Go to Profile",
          onPress: () => {
            clearCart();
            router.replace("/(tabs)/profile" as any);
          },
        },
      ]);
    } catch (err: any) {
      setIsSavingCard(false);
      Alert.alert("Error", err?.message || "Something went wrong.");
    }
  };

  const currentUpiUrl = generateUpiUrl();
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(
    currentUpiUrl,
  )}`;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Booking Summary</Text>

        {/* Selected Services Card */}
        <View style={styles.card}>
          {selectedServices.map((service) => (
            <View key={service.id} style={styles.row}>
              <Text style={styles.serviceTitle}>{service.title}</Text>
              <Text style={styles.servicePrice}>₹{service.price}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          {carDetails && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Vehicle:</Text>
              <Text style={styles.infoValue}>{carDetails.name}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type:</Text>
            <Text style={styles.infoValue}>{params.serviceType?.toUpperCase()}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date & Time:</Text>
            <Text style={styles.infoValue}>{params.date || "Not Selected"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoValue} numberOfLines={2}>
              {params.addressText || "Workshop Center"}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Coupon Code Section */}
          <View style={styles.couponSection}>
            <TextInput
              style={[
                styles.couponInput,
                appliedCoupon ? { backgroundColor: "#F3F4F6", color: "#6B7280" } : null,
              ]}
              placeholder="Enter Coupon (e.g. FIRST50)"
              placeholderTextColor="#9CA3AF"
              value={couponCode}
              onChangeText={setCouponCode}
              autoCapitalize="characters"
              editable={!appliedCoupon}
            />

            {appliedCoupon ? (
              <TouchableOpacity style={styles.removeBtn} onPress={handleRemoveCoupon}>
                <Text style={styles.removeBtnText}>Remove</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyCoupon}>
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            )}
          </View>

          {appliedCoupon ? (
            <Text style={styles.appliedText}>
              ✅ Coupon {appliedCoupon} applied (₹{discount} off)
            </Text>
          ) : null}

          <View style={styles.divider} />

          {/* Bill Breakdown */}
          <View style={styles.row}>
            <Text style={styles.infoLabel}>Subtotal</Text>
            <Text style={styles.servicePrice}>₹{subTotal}</Text>
          </View>

          {discount > 0 && (
            <View style={styles.row}>
              <Text style={[styles.infoLabel, { color: "#16A34A" }]}>
                Discount ({appliedCoupon})
              </Text>
              <Text style={[styles.servicePrice, { color: "#16A34A" }]}>-₹{discount}</Text>
            </View>
          )}

          <View style={styles.row}>
            <Text style={styles.infoLabel}>GST (18%)</Text>
            <Text style={styles.servicePrice}>₹{gst}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.infoLabel}>Platform Fee</Text>
            <Text style={styles.servicePrice}>₹{platformFee}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>₹{grandTotal}</Text>
          </View>
        </View>

        {/* Payment Method Selector */}
        <Text style={styles.sectionHeader}>Select Payment Mode</Text>

        {/* Option 1: Direct UPI */}
        <TouchableOpacity
          style={[
            styles.paymentOptionCard,
            paymentMethod === "upi" && styles.paymentOptionCardSelected,
          ]}
          onPress={() => setPaymentMethod("upi")}
          activeOpacity={0.85}
        >
          <View style={styles.paymentRadioRow}>
            <View style={[styles.radioOuter, paymentMethod === "upi" && styles.radioOuterSelected]}>
              {paymentMethod === "upi" && <View style={styles.radioInner} />}
            </View>
            <View style={styles.paymentTextGroup}>
              <View style={styles.paymentTitleRow}>
                <Ionicons name="flash" size={18} color="#2563EB" />
                <Text style={styles.paymentTitle}>Instant UPI (GPay, PhonePe, Paytm)</Text>
              </View>
              <Text style={styles.paymentSubtitle}>
                Pay directly to bank account via any UPI app or scan QR
              </Text>
            </View>
          </View>

          {paymentMethod === "upi" && (
            <View style={styles.upiDetailsBox}>
              <View style={styles.upiIdRow}>
                <View>
                  <Text style={styles.upiIdLabel}>Merchant UPI ID</Text>
                  <Text style={styles.upiIdText}>{DEFAULT_UPI_ID}</Text>
                </View>
                <TouchableOpacity style={styles.copyBtn} onPress={copyUpiId} activeOpacity={0.7}>
                  <Ionicons name="copy-outline" size={15} color="#2563EB" />
                  <Text style={styles.copyBtnText}>Copy</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.upiActionRow}>
                <TouchableOpacity
                  style={styles.showQrBtn}
                  onPress={() => {
                    setUtrInput("");
                    setIsUpiModalVisible(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="qr-code-outline" size={18} color="#0F172A" />
                  <Text style={styles.showQrBtnText}>Show QR Scanner & Enter UTR</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Option 2: Pay After Wash */}
        <TouchableOpacity
          style={[
            styles.paymentOptionCard,
            paymentMethod === "pay_after_service" && styles.paymentOptionCardSelected,
          ]}
          onPress={() => setPaymentMethod("pay_after_service")}
          activeOpacity={0.85}
        >
          <View style={styles.paymentRadioRow}>
            <View
              style={[
                styles.radioOuter,
                paymentMethod === "pay_after_service" && styles.radioOuterSelected,
              ]}
            >
              {paymentMethod === "pay_after_service" && <View style={styles.radioInner} />}
            </View>
            <View style={styles.paymentTextGroup}>
              <View style={styles.paymentTitleRow}>
                <Ionicons name="cash-outline" size={18} color="#16A34A" />
                <Text style={styles.paymentTitle}>Pay After Wash (Cash / Spot QR)</Text>
              </View>
              <Text style={styles.paymentSubtitle}>
                Pay cash or scan technician QR on-spot after car wash completion
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveTemplateBtn}
          onPress={handleSaveConfiguration}
          disabled={isSavingCard || isSubmitting}
          activeOpacity={0.8}
        >
          {isSavingCard ? (
            <ActivityIndicator color={Colors.primary || "#2563EB"} />
          ) : (
            <Text style={styles.saveTemplateBtnText}>Save as Quick-Book Card</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.confirmBtn,
            paymentMethod === "pay_after_service" && styles.confirmBtnGreen,
          ]}
          onPress={handlePaymentAndBooking}
          disabled={isSubmitting || isSavingCard}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.confirmBtnText}>
              {paymentMethod === "pay_after_service"
                ? `Confirm Booking (Pay ₹${grandTotal} Later)`
                : `Pay ₹${grandTotal} via UPI & Book`}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* UPI Payment & 12-Digit UTR Verification Modal */}
      <Modal
        visible={isUpiModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsUpiModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Complete UPI Payment</Text>
                <Text style={styles.modalSubTitle}>
                  Pay ₹{grandTotal} & enter 12-digit UTR to confirm
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsUpiModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.qrContainer}>
              <Image source={{ uri: qrCodeImageUrl }} style={styles.qrImage} resizeMode="contain" />
              <Text style={styles.qrAmountText}>Amount: ₹{grandTotal}</Text>
              <Text style={styles.qrVpaText}>UPI ID: {DEFAULT_UPI_ID}</Text>

              <View style={styles.qrQuickActions}>
                <TouchableOpacity
                  style={styles.openUpiAgainBtn}
                  onPress={() => Linking.openURL(currentUpiUrl).catch(() => {})}
                >
                  <Ionicons name="open-outline" size={14} color="#2563EB" />
                  <Text style={styles.openUpiAgainText}>Open UPI App</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.openUpiAgainBtn} onPress={copyUpiId}>
                  <Ionicons name="copy-outline" size={14} color="#2563EB" />
                  <Text style={styles.openUpiAgainText}>Copy UPI ID</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 12-Digit UTR Input */}
            <View style={styles.utrSection}>
              <Text style={styles.utrLabel}>Enter 12-Digit UPI Ref / UTR No. (Required)*</Text>
              <TextInput
                style={styles.utrInput}
                placeholder="e.g. 428719305821"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                maxLength={12}
                value={utrInput}
                onChangeText={(txt) => setUtrInput(txt.replace(/\D/g, ""))}
              />
              <Text style={styles.utrHint}>
                Found in Google Pay / PhonePe / Paytm payment receipt.
              </Text>
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setIsUpiModalVisible(false);
                  setUtrInput("");
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelBtnText}>Cancel (Not Paid)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalConfirmBtn,
                  !isValidUtr(utrInput) && styles.modalConfirmBtnDisabled,
                ]}
                onPress={handleVerifyUtrAndBook}
                activeOpacity={0.8}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.modalConfirmBtnText}>Verify UTR & Book</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background || "#F9FAFB" },
  content: { padding: 16, paddingBottom: 170 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text || "#111827",
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.surface || "#FFF",
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border || "#E5E7EB",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: { fontSize: 14, color: Colors.textSecondary || "#6B7280" },
  infoValue: {
    fontSize: 14,
    color: Colors.text || "#111827",
    fontWeight: "500",
    maxWidth: "60%",
    textAlign: "right",
  },
  serviceTitle: { fontSize: 15, color: Colors.textSecondary || "#4B5563" },
  servicePrice: {
    fontSize: 15,
    color: Colors.text || "#111827",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border || "#E5E7EB",
    marginVertical: 12,
  },
  couponSection: { flexDirection: "row", gap: 8, marginBottom: 8 },
  couponInput: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 14,
    color: "#111827",
  },
  applyBtn: {
    backgroundColor: Colors.primary || "#2563EB",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  applyBtnText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
  removeBtn: {
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  removeBtnText: { color: "#DC2626", fontWeight: "700", fontSize: 14 },
  appliedText: {
    fontSize: 12,
    color: "#16A34A",
    fontWeight: "600",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text || "#111827",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.primary || "#2563EB",
  },

  sectionHeader: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 20,
    marginBottom: 10,
  },
  paymentOptionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 12,
  },
  paymentOptionCardSelected: {
    borderColor: "#2563EB",
    backgroundColor: "#F8FAFF",
  },
  paymentRadioRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#94A3B8",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
    marginRight: 12,
  },
  radioOuterSelected: {
    borderColor: "#2563EB",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563EB",
  },
  paymentTextGroup: {
    flex: 1,
  },
  paymentTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  paymentSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 3,
    lineHeight: 16,
  },

  upiDetailsBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  upiIdRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    padding: 10,
    borderRadius: 10,
  },
  upiIdLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  upiIdText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 1,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyBtnText: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "700",
  },
  upiActionRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  showQrBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#E2E8F0",
    paddingVertical: 10,
    borderRadius: 10,
  },
  showQrBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    gap: 10,
  },
  confirmBtn: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmBtnGreen: {
    backgroundColor: "#16A34A",
  },
  confirmBtnText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  saveTemplateBtn: {
    backgroundColor: "#EFF6FF",
    padding: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2563EB",
    alignItems: "center",
  },
  saveTemplateBtnText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "700",
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    width: "100%",
    maxWidth: 370,
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalSubTitle: {
    fontSize: 12,
    color: "#64748B",
  },
  modalCloseBtn: {
    padding: 4,
  },
  qrContainer: {
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    width: "100%",
  },
  qrImage: {
    width: 160,
    height: 160,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  qrAmountText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2563EB",
    marginTop: 6,
  },
  qrVpaText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  qrQuickActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  openUpiAgainBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  openUpiAgainText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
  },

  utrSection: {
    width: "100%",
    marginTop: 12,
    marginBottom: 14,
  },
  utrLabel: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  utrInput: {
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
  utrHint: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
    textAlign: "center",
  },

  modalBtnRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  modalCancelBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingVertical: 12,
    borderRadius: 10,
  },
  modalCancelBtnText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 13,
  },
  modalConfirmBtn: {
    flex: 1.3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#16A34A",
    paddingVertical: 12,
    borderRadius: 10,
  },
  modalConfirmBtnDisabled: {
    backgroundColor: "#94A3B8",
  },
  modalConfirmBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
});
