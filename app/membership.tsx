import Colors from "@/constants/colors";
import Radius from "@/constants/radius";
import Shadow from "@/constants/shadow";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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

export default function MembershipScreen() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly">("monthly");

  const plans = [
    {
      id: "1",
      name: "Silver",
      badge: "STARTER",
      color: "#9CA3AF",
      monthlyPrice: "₹999",
      quarterlyPrice: "₹2,699",
      savings: "Save ₹298",
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
      color: "#FBBF24",
      monthlyPrice: "₹1,999",
      quarterlyPrice: "₹5,399",
      savings: "Save ₹598",
      features: [
        "4 Exterior Washes per month",
        "2 Interior Deep Cleanings",
        "Teflon Coating once a year",
        "Priority Booking",
      ],
    },
    {
      id: "3",
      name: "Platinum",
      badge: "PREMIUM",
      color: "#A78BFA",
      monthlyPrice: "₹2,999",
      quarterlyPrice: "₹7,999",
      savings: "Save ₹998",
      features: [
        "Unlimited Exterior Washes",
        "Unlimited Interior Cleanings",
        "Free A.C. Treatment (Monthly)",
        "Free Engine Degreasing (Monthly)",
        "VIP Home Pickup & Drop",
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Premium Plans</Text>
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

          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleBtn, billingCycle === "monthly" && styles.activeToggle]}
              onPress={() => setBillingCycle("monthly")}
            >
              <Text
                style={[styles.toggleText, billingCycle === "monthly" && styles.activeToggleText]}
              >
                Monthly
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, billingCycle === "quarterly" && styles.activeToggle]}
              onPress={() => setBillingCycle("quarterly")}
            >
              <Text
                style={[styles.toggleText, billingCycle === "quarterly" && styles.activeToggleText]}
              >
                Quarterly
              </Text>

              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-10%</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + 16}
          decelerationRate="fast"
          contentContainerStyle={styles.cardsScrollContainer}
        >
          {plans.map((plan) => (
            <View key={plan.id} style={[styles.card, { borderColor: plan.color }]}>
              <View style={[styles.badgeContainer, { backgroundColor: plan.color + "20" }]}>
                <Text style={[styles.badgeText, { color: plan.color }]}>{plan.badge}</Text>
              </View>
              <Text style={styles.planName}>{plan.name}</Text>

              <View style={styles.priceContainer}>
                <Text style={styles.price}>
                  {billingCycle === "monthly" ? plan.monthlyPrice : plan.quarterlyPrice}
                </Text>
                <Text style={styles.duration}>
                  {billingCycle === "monthly" ? "/month" : "/quarter"}
                </Text>
              </View>

              {billingCycle === "quarterly" && (
                <Text style={styles.savingsText}>{plan.savings}</Text>
              )}

              <View style={styles.divider} />

              <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={plan.color}
                      style={{ marginRight: 10 }}
                    />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={[styles.subscribeBtn, { backgroundColor: plan.color }]}>
                <Text style={styles.subscribeBtnText}>Choose {plan.name}</Text>
              </TouchableOpacity>
            </View>
          ))}
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
  topSection: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 },
  title: { fontSize: 32, fontWeight: "800", color: Colors.text, lineHeight: 40, marginBottom: 8 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: 24 },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: Radius.round,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: Radius.round,
    position: "relative",
  },
  activeToggle: { backgroundColor: Colors.surface, ...Shadow.light },
  toggleText: { fontSize: 15, fontWeight: "600", color: Colors.textSecondary },
  activeToggleText: { color: Colors.text, fontWeight: "700" },
  discountBadge: {
    position: "absolute",
    top: -10,
    right: 10,
    backgroundColor: Colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  discountText: { color: "#FFF", fontSize: 10, fontWeight: "800" },
  cardsScrollContainer: { paddingHorizontal: 24, gap: 16, paddingBottom: 20 },
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 24,
    borderWidth: 2,
    ...Shadow.card,
  },
  badgeContainer: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.md,
    marginBottom: 16,
  },
  badgeText: { fontSize: 12, fontWeight: "800", letterSpacing: 0.5 },
  planName: { fontSize: 24, fontWeight: "800", color: Colors.text, marginBottom: 8 },
  priceContainer: { flexDirection: "row", alignItems: "baseline" },
  price: { fontSize: 36, fontWeight: "900", color: Colors.text },
  duration: { fontSize: 16, fontWeight: "600", color: Colors.textSecondary, marginLeft: 4 },
  savingsText: { fontSize: 13, fontWeight: "700", color: Colors.success, marginTop: 4 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 24 },
  featuresContainer: { gap: 16, marginBottom: 32 },
  featureItem: { flexDirection: "row", alignItems: "center" },
  featureText: { fontSize: 15, color: Colors.textSecondary, flex: 1 },
  subscribeBtn: { paddingVertical: 16, borderRadius: Radius.xl, alignItems: "center" },
  subscribeBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
