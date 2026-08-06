import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import SectionTitle from "../common/SectionTitle";
import MembershipCard from "../cards/MembershipCard";

import { membershipPlans, MembershipPlan } from "@/constants/data";

import Colors from "@/constants/colors";
import Radius from "@/constants/radius";
import Spacing from "@/constants/spacing";

type PlanType = "Monthly" | "Quarterly";

export default function MembershipPlans() {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("Monthly");

  const plans = useMemo(() => {
    if (selectedPlan === "Monthly") {
      return membershipPlans;
    }

    return membershipPlans.map((plan) => ({
      ...plan,
      duration: "Quarterly" as const,
      price: plan.price * 3 - Math.round(plan.price * 0.2),
      savings: "Save 20%",
    }));
  }, [selectedPlan]);

  return (
    <View style={styles.container}>
      <SectionTitle
        title="Membership Plans"
        subtitle="Save more with monthly & quarterly subscriptions"
      />

      <View style={styles.toggleContainer}>
        {(["Monthly", "Quarterly"] as const).map((item) => (
          <TouchableOpacity
            key={item}
            activeOpacity={0.9}
            onPress={() => setSelectedPlan(item)}
            style={[styles.toggleButton, selectedPlan === item && styles.activeButton]}
          >
            <Text style={[styles.toggleText, selectedPlan === item && styles.activeText]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        horizontal
        data={plans}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <MembershipCard
            title={item.title}
            subtitle={item.subtitle}
            price={item.price}
            savings={item.savings}
            popular={item.popular}
            features={item.features}
            icon={item.icon}
            color={item.color}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xl,
  },

  toggleContainer: {
    flexDirection: "row",
    alignSelf: "center",

    backgroundColor: "#EEF2FF",

    borderRadius: Radius.round,

    padding: 4,

    marginBottom: 24,
  },

  toggleButton: {
    paddingHorizontal: 22,
    paddingVertical: 10,

    borderRadius: Radius.round,
  },

  activeButton: {
    backgroundColor: Colors.primary,
  },

  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },

  activeText: {
    color: "#fff",
  },

  list: {
    paddingLeft: Spacing.lg,
    paddingRight: 8,
    paddingBottom: 8,
  },
});
