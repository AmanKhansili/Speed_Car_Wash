import Colors from "@/constants/colors";
import useUser from "@/context/userContext";
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

const DEFAULT_UPI_ID = process.env.EXPO_PUBLIC_MERCHANT_UPI_ID || "paytmqr5hk7au@ptys";
const MERCHANT_NAME = process.env.EXPO_PUBLIC_MERCHANT_NAME || "Speed Car Wash";

function isValidUtr(utr: string): boolean {
  const cleaned = utr.trim();
  if (!/^\d{12}$/.test(cleaned)) return false;
  if (/^(\d)\1{11}$/.test(cleaned)) return false;
  return true;
}

export default function MembershipCheckoutScreen() {
  const { userId, getToken } = useAuth();
  const { userData } = useUser();

  const params = useLocalSearchParams<{
    planId?: string;
    planName?: string;
    billingCycle?: "monthly" | "quarterly";
    amount?: string;
  }>();

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    userData?.vehicles?.[0]?.id || "",
  );

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQrModalVisible, setIsQrModalVisible] = useState(false);
  const [utrInput, setUtrInput] = useState("");

  const clerkSupabase = useMemo(() => createClerkSupabaseClient(getToken), [getToken]);

  const estimatedBase = Number(params.amount) || 0;
  const discountedBase = Math.max(0, estimatedBase - discount);
  const gst = Math.round(discountedBase * 0.18);
  const grandTotal = discountedBase > 0 ? discountedBase + gst : 0;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      Alert.alert("Error", "Please enter a coupon code");
      return;
    }
    if (appliedCoupon) {
      Alert.alert("Coupon Applied", "A coupon is already applied. Remove it first.");
      return;
    }
    const upper = couponCode.trim().toUpperCase();
    if (upper === "FIRST50") {
      setDiscount(50);
      setAppliedCoupon(upper);
      Alert.alert("Success", "Coupon FIRST50 applied! ₹50 off.");
    } else if (upper === "CARWASH100") {
      setDiscount(100);
      setAppliedCoupon(upper);
      Alert.alert("Success", "Coupon CARWASH100 applied! ₹100 off.");
    } else {
      Alert.alert("Invalid Coupon", "Use FIRST50 or CARWASH100.");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon("");
    setCouponCode("");
    setDiscount(0);
  };

  const generateUpiUrl = () => {
    const note = `Membership-${params.planName || "Plan"}`;
    return `upi://pay?pa=${DEFAULT_UPI_ID}&pn=${encodeURIComponent(
      MERCHANT_NAME,
    )}&am=${grandTotal}&cu=INR&tn=${encodeURIComponent(note)}`;
  };

  const handleVerifyAndActivate = async () => {
    if (!userId) return;
    if (!isValidUtr(utrInput)) {
      Alert.alert(
        "Invalid UTR Number",
        "Please enter the valid 12-digit UPI Ref / UTR number from your payment receipt.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const txnId = `UTR-${utrInput.trim()}`;
      const daysToAdd = params.billingCycle === "quarterly" ? 90 : 30;
      const periodEnd = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString();

      await clerkSupabase.from("subscriptions").insert([
        {
          clerk_user_id: userId,
          tier: params.planName || "Gold",
          billing_cycle: params.billingCycle || "monthly",
          amount: grandTotal,
          status: "active",
          payment_id: txnId,
          current_period_end: periodEnd,
          created_at: new Date().toISOString(),
        },
      ]);

      await clerkSupabase
        .from("profiles")
        .update({
          membership_tier: (params.planName || "gold").toLowerCase(),
          updated_at: new Date().toISOString(),
        })
        .eq("clerk_user_id", userId);

      setIsSubmitting(false);
      setIsQrModalVisible(false);
      setUtrInput("");

      Alert.alert(
        "Welcome to Premium! 🎉",
        `Your ${params.planName} Membership is now ACTIVE.\nRef ID: ${txnId}`,
        [
          {
            text: "Go to Profile",
            onPress: () => router.replace("/(tabs)/profile" as any),
          },
        ],
      );
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert("Error", err?.message || "Could not activate membership. Contact support.");
    }
  };

  const handleMembershipPayment = async () => {
    if (!selectedVehicleId) {
      Alert.alert("Vehicle Required", "Please select a vehicle for this membership.");
      return;
    }
    if (!userId) {
      Alert.alert("Error", "Please log in again to continue.");
      return;
    }

    const upiUrl = generateUpiUrl();
    setUtrInput("");
    setIsQrModalVisible(true);

    const canOpen = await Linking.canOpenURL(upiUrl).catch(() => false);
    if (canOpen) {
      await Linking.openURL(upiUrl).catch(() => {});
    }
  };

  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(
    generateUpiUrl(),
  )}`;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text || "#111827"} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Membership Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.planCard}>
          <Text style={styles.planBadge}>{params.billingCycle?.toUpperCase()} PLAN</Text>
          <Text style={styles.planTitle}>{params.planName} Membership</Text>
          <Text style={styles.planPrice}>₹{grandTotal}</Text>
        </View>

        <Text style={styles.sectionTitle}>Select Vehicle for Membership</Text>
        <View style={styles.vehicleList}>
          {userData?.vehicles && userData.vehicles.length > 0 ? (
            userData.vehicles.map((v: any) => {
              const isSelected = selectedVehicleId === v.id;
              const vehicleName = v.make
                ? `${v.make} ${v.model}`
                : `${v.brand || ""} ${v.model || ""}`.trim() || "Vehicle";
              return (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.vehicleCard, isSelected && styles.selectedVehicleCard]}
                  onPress={() => setSelectedVehicleId(v.id)}
                >
                  <Ionicons
                    name="car-sport"
                    size={22}
                    color={isSelected ? Colors.primary || "#2563EB" : "#6B7280"}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.vehicleName}>{vehicleName}</Text>
                    <Text style={styles.vehicleReg}>
                      {v.registration_number || v.registrationNumber || "No Reg Number"}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={Colors.primary || "#2563EB"}
                    />
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <TouchableOpacity
              style={styles.addVehicleBtn}
              onPress={() => router.push("/(tabs)/profile" as any)}
            >
              <Text style={styles.addVehicleText}>+ Add Vehicle in Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionTitle}>Offers & Discounts</Text>
        <View style={styles.card}>
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
        </View>

        <Text style={styles.sectionTitle}>Price Breakdown</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.infoLabel}>Base Price ({params.billingCycle})</Text>
            <Text style={styles.servicePrice}>₹{estimatedBase}</Text>
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
          <View style={[styles.row, { marginTop: 6, marginBottom: 0 }]}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#111827" }}>Total Payable</Text>
            <Text style={{ fontSize: 18, fontWeight: "900", color: "#2563EB" }}>₹{grandTotal}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.qrPreviewBtn}
          onPress={() => {
            setUtrInput("");
            setIsQrModalVisible(true);
          }}
        >
          <Ionicons name="qr-code-outline" size={18} color="#2563EB" />
          <Text style={styles.qrPreviewBtnText}>
            Show Bank QR Scanner & Enter UTR (₹{grandTotal})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={handleMembershipPayment}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.confirmBtnText}>Pay ₹{grandTotal} via Direct UPI</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* QR Code & 12-Digit UTR Modal */}
      <Modal
        visible={isQrModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsQrModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pay & Enter 12-Digit UTR</Text>
              <TouchableOpacity onPress={() => setIsQrModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Image
              source={{ uri: qrCodeImageUrl }}
              style={{ width: 160, height: 160, marginVertical: 10 }}
              resizeMode="contain"
            />
            <Text style={{ fontSize: 17, fontWeight: "800", color: "#2563EB" }}>₹{grandTotal}</Text>
            <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
              UPI ID: {DEFAULT_UPI_ID}
            </Text>

            <TouchableOpacity
              style={styles.copyUpiInlineBtn}
              onPress={() => {
                Clipboard.setString(DEFAULT_UPI_ID);
                Alert.alert("Copied", DEFAULT_UPI_ID);
              }}
            >
              <Ionicons name="copy-outline" size={14} color="#2563EB" />
              <Text style={{ color: "#2563EB", fontWeight: "700", fontSize: 12 }}>Copy UPI ID</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.utrInput}
              placeholder="Enter 12-digit UTR (e.g. 428719305821)"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={12}
              value={utrInput}
              onChangeText={(txt) => setUtrInput(txt.replace(/\D/g, ""))}
            />

            <View
              style={{
                flexDirection: "row",
                gap: 10,
                marginTop: 14,
                width: "100%",
              }}
            >
              <TouchableOpacity
                style={styles.cancelUpiBtn}
                onPress={() => {
                  setIsQrModalVisible(false);
                  setUtrInput("");
                }}
              >
                <Text style={{ color: "#DC2626", fontWeight: "700", fontSize: 13 }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.paidBtn, !isValidUtr(utrInput) && { backgroundColor: "#94A3B8" }]}
                onPress={handleVerifyAndActivate}
                disabled={isSubmitting}
              >
                <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 13 }}>
                  Verify UTR & Activate
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  content: { padding: 16, paddingBottom: 120 },
  planCard: {
    backgroundColor: "#1E293B",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  planBadge: {
    color: "#38BDF8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  planTitle: { color: "#FFF", fontSize: 22, fontWeight: "800" },
  planPrice: { color: "#FFF", fontSize: 28, fontWeight: "900", marginTop: 8 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 10,
    marginTop: 10,
  },
  vehicleList: { gap: 10, marginBottom: 12 },
  vehicleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  selectedVehicleCard: {
    borderColor: Colors.primary || "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  vehicleName: { fontSize: 15, fontWeight: "700", color: "#111827" },
  vehicleReg: { fontSize: 12, color: "#6B7280" },
  addVehicleBtn: {
    padding: 14,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  addVehicleText: { color: Colors.primary || "#2563EB", fontWeight: "700" },
  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  infoLabel: { fontSize: 14, color: "#6B7280" },
  servicePrice: { fontSize: 14, color: "#111827", fontWeight: "600" },
  couponSection: { flexDirection: "row", gap: 8 },
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
    marginTop: 8,
  },
  qrPreviewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 13,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  qrPreviewBtnText: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 14,
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
  },
  confirmBtn: {
    backgroundColor: Colors.primary || "#2563EB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmBtnText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 18,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  modalTitle: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  copyUpiInlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
  },
  utrInput: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#0F172A",
    textAlign: "center",
  },
  cancelUpiBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
  },
  paidBtn: {
    flex: 1.3,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#16A34A",
    alignItems: "center",
  },
});
