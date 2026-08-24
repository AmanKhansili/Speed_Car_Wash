import Colors from "@/constants/colors";
import Radius from "@/constants/radius";
import Shadow from "@/constants/shadow";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.82;

interface Plan {
  id: string;
  name: string;
  badge: string;
  color: string;
  monthlyPrice: number;
  quarterlyPrice: number;
  features: string[];
}

export default function MembershipScreen() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly">("monthly");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("2"); // Default Gold
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const plans: Plan[] = [
    {
      id: "1",
      name: "Silver",
      badge: "STARTER",
      color: "#6B7280",
      monthlyPrice: 999,
      quarterlyPrice: 2699,
      features: [
        "2 Exterior Washes per month",
        "1 Interior Vacuum cleaning",
        "Basic Dashboard Polish",
        "Standard Support",
      ],
    },
    {
      id: "2",
      name: "Gold",
      badge: "MOST POPULAR",
      color: "#D97706",
      monthlyPrice: 1999,
      quarterlyPrice: 5399,
      features: [
        "4 Exterior Washes per month",
        "2 Interior Deep Cleanings",
        "Teflon Coating once a year",
        "Priority Booking Slot",
      ],
    },
    {
      id: "3",
      name: "Platinum",
      badge: "PREMIUM",
      color: "#7C3AED",
      monthlyPrice: 2999,
      quarterlyPrice: 7999,
      features: [
        "Unlimited Exterior Washes",
        "Unlimited Interior Cleanings",
        "Free A.C. Treatment (Monthly)",
        "Free Engine Degreasing (Monthly)",
        "VIP Home Pickup & Drop",
      ],
    },
  ];

  const handleSubscribe = async (plan: Plan) => {
    setLoadingPlanId(plan.id);

    try {
      const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.quarterlyPrice;
      
      // TODO: Replace this with your backend payment API call (e.g., Razorpay/Cashfree order creation)
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulating Network Request

      // Success Navigation to Order Confirmation Page
      router.push({
        pathname: "/membership/checkout", // Extra Page Requirement
        params: {
          planId: plan.id,
          planName: plan.name,
          billingCycle,
          amount: price,
        },
      });
    } catch (error) {
      Alert.alert("Payment Failed", "Something went wrong. Please try again.");
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Membership Plans</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.topSection}>
          <Text style={styles.title}>Choose Your{"\n"}Perfect Plan</Text>
          <Text style={styles.subtitle}>
            Unlock exclusive benefits and save more on your car care routine.
          </Text>

          {/* Billing Cycle Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleBtn, billingCycle === "monthly" && styles.activeToggle]}
              onPress={() => setBillingCycle("monthly")}
            >
              <Text
                style={[
                  styles.toggleText,
                  billingCycle === "monthly" && styles.activeToggleText,
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, billingCycle === "quarterly" && styles.activeToggle]}
              onPress={() => setBillingCycle("quarterly")}
            >
              <Text
                style={[
                  styles.toggleText,
                  billingCycle === "quarterly" && styles.activeToggleText,
                ]}
              >
                Quarterly
              </Text>

              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>10% OFF</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Plan Cards Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + 16}
          decelerationRate="fast"
          contentContainerStyle={styles.cardsScrollContainer}
        >
          {plans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.quarterlyPrice;
            const savings = plan.monthlyPrice * 3 - plan.quarterlyPrice;
            const isLoading = loadingPlanId === plan.id;

            return (
              <TouchableOpacity
                key={plan.id}
                activeOpacity={0.9}
                onPress={() => setSelectedPlanId(plan.id)}
                style={[
                  styles.card,
                  { borderColor: isSelected ? plan.color : "#E5E7EB" },
                  isSelected && styles.selectedCardShadow,
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.badgeContainer, { backgroundColor: plan.color + "18" }]}>
                    <Text style={[styles.badgeText, { color: plan.color }]}>{plan.badge}</Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color={plan.color} />
                  )}
                </View>

                <Text style={styles.planName}>{plan.name}</Text>

                <View style={styles.priceContainer}>
                  <Text style={styles.price}>₹{price.toLocaleString("en-IN")}</Text>
                  <Text style={styles.duration}>
                    {billingCycle === "monthly" ? " / month" : " / quarter"}
                  </Text>
                </View>

                {billingCycle === "quarterly" && savings > 0 ? (
                  <Text style={styles.savingsText}>Save ₹{savings.toLocaleString("en-IN")}</Text>
                ) : (
                  <Text style={styles.savingsPlaceholder}>Billed monthly</Text>
                )}

                <View style={styles.divider} />

                {/* Features List */}
                <View style={styles.featuresContainer}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={plan.color}
                        style={{ marginRight: 10 }}
                      />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                {/* CTA Button */}
                <TouchableOpacity
                  disabled={isLoading}
                  onPress={() => handleSubscribe(plan)}
                  style={[styles.subscribeBtn, { backgroundColor: plan.color }]}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.subscribeBtnText}>
                      {isSelected ? "Proceed with " + plan.name : "Select " + plan.name}
                    </Text>
                  )}
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </ScrollView>
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
    borderRadius: Radius.round,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    ...Shadow.light,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: Colors.text },
  topSection: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 },
  title: { fontSize: 30, fontWeight: "800", color: Colors.text, lineHeight: 38, marginBottom: 8 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginBottom: 20 },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: Radius.round,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: Radius.round,
    position: "relative",
  },
  activeToggle: { backgroundColor: Colors.surface, ...Shadow.light },
  toggleText: { fontSize: 14, fontWeight: "600", color: Colors.textSecondary },
  activeToggleText: { color: Colors.text, fontWeight: "700" },
  discountBadge: {
    position: "absolute",
    top: -8,
    right: 8,
    backgroundColor: "#DC2626",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  discountText: { color: "#FFF", fontSize: 9, fontWeight: "800" },
  cardsScrollContainer: { paddingHorizontal: 24, gap: 16, paddingBottom: 20 },
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 20,
    borderWidth: 2,
    ...Shadow.card,
  },
  selectedCardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badgeContainer: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.md,
    marginBottom: 12,
  },
  badgeText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  planName: { fontSize: 22, fontWeight: "800", color: Colors.text, marginBottom: 6 },
  priceContainer: { flexDirection: "row", alignItems: "baseline" },
  price: { fontSize: 32, fontWeight: "900", color: Colors.text },
  duration: { fontSize: 14, fontWeight: "600", color: Colors.textSecondary, marginLeft: 4 },
  savingsText: { fontSize: 13, fontWeight: "700", color: "#059669", marginTop: 4 },
  savingsPlaceholder: { fontSize: 13, color: "transparent", marginTop: 4 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 20 },
  featuresContainer: { gap: 12, marginBottom: 24, minHeight: 160 },
  featureItem: { flexDirection: "row", alignItems: "center" },
  featureText: { fontSize: 14, color: Colors.textSecondary, flex: 1, lineHeight: 18 },
  subscribeBtn: { paddingVertical: 14, borderRadius: Radius.xl, alignItems: "center" },
  subscribeBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
});