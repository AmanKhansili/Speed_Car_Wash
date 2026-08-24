import Colors from "@/constants/colors";
import useUser from "@/context/userContext";
import { createClerkSupabaseClient } from "@/utils/supabase";
import { useAuth, useUser as useClerkUser } from "@clerk/expo";
import { useRazorpay } from "@codearcade/expo-razorpay";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MembershipCheckoutScreen() {
  const { userId, getToken } = useAuth();
  const { user: clerkUser } = useClerkUser();
  const { userData } = useUser();

  const params = useLocalSearchParams<{
    planId?: string;
    planName?: string;
    billingCycle?: "monthly" | "quarterly";
    amount?: string; // display-only estimate; server recalculates the real price
  }>();

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    userData?.vehicles?.[0]?.id || "",
  );

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { openCheckout, RazorpayUI } = useRazorpay();

  const clerkSupabase = useMemo(
    () => createClerkSupabaseClient(getToken),
    [getToken],
  );

  // Display-only estimate — actual price/GST/discount is always recalculated server-side
  const estimatedBase = Number(params.amount) || 0;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      Alert.alert("Error", "Please enter a coupon code");
      return;
    }
    if (appliedCoupon) {
      Alert.alert(
        "Coupon Applied",
        "A coupon is already applied. Remove it first.",
      );
      return;
    }
    // Just a UI preview flag — server validates the real coupon against its own list
    setAppliedCoupon(couponCode.trim().toUpperCase());
    Alert.alert("Coupon Added", "We'll validate this coupon when you pay.");
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon("");
    setCouponCode("");
  };

  const handleMembershipPayment = async () => {
    if (!selectedVehicleId) {
      Alert.alert(
        "Vehicle Required",
        "Please select a vehicle for this membership.",
      );
      return;
    }
    if (!userId) {
      Alert.alert("Error", "Please log in again to continue.");
      return;
    }
    if (!params.planId) {
      Alert.alert("Error", "Missing plan information.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await clerkSupabase.functions.invoke(
        "create-membership-order",
        {
          body: {
            planId: params.planId,
            billingCycle: params.billingCycle,
            couponCode: appliedCoupon || undefined,
            clerkUserId: userId,
          },
        },
      );

      if (error || !data?.order?.id || !data?.subscription?.id) {
        throw new Error(error?.message || "Could not create membership order");
      }

      const { order, subscription, grandTotal } = data;

      // 2. Customer prefill data
      const customerName =
        clerkUser?.fullName || clerkUser?.firstName || "Valued Customer";
      const customerEmail =
        clerkUser?.primaryEmailAddress?.emailAddress || "customer@example.com";
      const customerPhone =
        clerkUser?.primaryPhoneNumber?.phoneNumber || "9999999999";

      const razor = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID;

      if (!razor) {
        throw new Error("Key not configured in checkout ");
      }

      openCheckout(
        {
          key: razor,
          amount: Math.round(grandTotal * 100),
          currency: "INR",
          order_id: order.id,
          name: "Speed Car Wash",
          description: `${params.planName} Membership (${params.billingCycle})`,
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerPhone,
          },
          theme: { color: Colors.primary || "#2563EB" },
        },
        {
          onSuccess: async (result: any) => {
            try {
              // 4. NEVER set status active from the client — verify server-side first
              const { data: verifyData, error: verifyError } =
                await clerkSupabase.functions.invoke(
                  "verify-razorpay-payment",
                  {
                    body: {
                      razorpay_order_id: result.razorpay_order_id ?? order.id,
                      razorpay_payment_id: result.razorpay_payment_id,
                      razorpay_signature: result.razorpay_signature,
                      subscriptionId: subscription.id,
                      clerkUserId: userId,
                    },
                  },
                );

              if (verifyError || !verifyData?.success) {
                throw new Error(
                  verifyError?.message || "Payment verification failed",
                );
              }

              Alert.alert(
                "Welcome to Premium! 🎉",
                `Your ${params.planName} Membership is now ACTIVE. \nRef ID: ${result.razorpay_payment_id}`,
                [
                  {
                    text: "Go to Profile",
                    onPress: () => router.replace("/(tabs)/profile" as any),
                  },
                ],
              );
            } catch (verifyErr: any) {
              Alert.alert(
                "Payment received, activation pending",
                "We couldn't confirm your payment automatically. Please contact support with your payment ID: " +
                  result.razorpay_payment_id,
              );
              console.error(verifyErr);
            } finally {
              setIsSubmitting(false);
            }
          },
          onFailure: async (error: any) => {
            await clerkSupabase
              .from("subscriptions")
              .update({
                status: "cancelled",
                updated_at: new Date().toISOString(),
              })
              .eq("id", subscription.id);

            setIsSubmitting(false);
            Alert.alert(
              "Payment Failed",
              error?.description || "Payment could not be completed.",
            );
          },
          onClose: () => setIsSubmitting(false),
        },
      );
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert("Error", err?.message || "Something went wrong.");
      console.error(err);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons
            name="chevron-back"
            size={24}
            color={Colors.text || "#111827"}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Membership Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.planCard}>
          <Text style={styles.planBadge}>
            {params.billingCycle?.toUpperCase()} PLAN
          </Text>
          <Text style={styles.planTitle}>{params.planName} Membership</Text>
          <Text style={styles.planPrice}>₹{estimatedBase}</Text>
        </View>

        <Text style={styles.sectionTitle}>Select Vehicle for Membership</Text>
        <View style={styles.vehicleList}>
          {userData?.vehicles && userData.vehicles.length > 0 ? (
            userData.vehicles.map((v: any) => {
              const isSelected = selectedVehicleId === v.id;
              const vehicleName = v.make
                ? `${v.make} ${v.model}`
                : v.model || "Vehicle";
              return (
                <TouchableOpacity
                  key={v.id}
                  style={[
                    styles.vehicleCard,
                    isSelected && styles.selectedVehicleCard,
                  ]}
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
                      {v.registration_number ||
                        v.registrationNumber ||
                        "No Reg Number"}
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
              <Text style={styles.addVehicleText}>
                + Add Vehicle in Profile
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionTitle}>Offers & Discounts</Text>
        <View style={styles.card}>
          <View style={styles.couponSection}>
            <TextInput
              style={[
                styles.couponInput,
                appliedCoupon
                  ? { backgroundColor: "#F3F4F6", color: "#6B7280" }
                  : null,
              ]}
              placeholder="Enter Coupon (e.g. WELCOME10)"
              placeholderTextColor="#9CA3AF"
              value={couponCode}
              onChangeText={setCouponCode}
              autoCapitalize="characters"
              editable={!appliedCoupon}
            />
            {appliedCoupon ? (
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={handleRemoveCoupon}
              >
                <Text style={styles.removeBtnText}>Remove</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={handleApplyCoupon}
              >
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            )}
          </View>
          {appliedCoupon ? (
            <Text style={styles.appliedText}>
              Coupon {appliedCoupon} will be validated at payment time
            </Text>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Price Breakdown</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.infoLabel}>
              Base Price ({params.billingCycle})
            </Text>
            <Text style={styles.servicePrice}>₹{estimatedBase}</Text>
          </View>
          <Text style={{ fontSize: 12, color: "#9CA3AF", marginTop: -4 }}>
            Final amount (with GST & any discount) is confirmed at checkout
          </Text>
        </View>
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
            <Text style={styles.confirmBtnText}>Continue to Pay</Text>
          )}
        </TouchableOpacity>
      </View>

      {RazorpayUI}
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
  content: { padding: 16, paddingBottom: 110 },
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
});
