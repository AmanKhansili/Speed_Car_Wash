import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

interface PaymentSummaryProps {
  basePrice?: number;
  taxes?: number;
  discount?: number;
  convenienceFee?: number;
}

export default function PaymentSummary({
  basePrice = 599,
  taxes = 108, // 18% GST approx
  discount: initialDiscount = 0,
  convenienceFee = 49,
}: PaymentSummaryProps) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(initialDiscount);
  const [couponApplied, setCouponApplied] = useState(false);

  // Apply Coupon Handler
  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === "FIRST100") {
      setAppliedDiscount(100);
      setCouponApplied(true);
    } else if (couponCode.trim().length > 0) {
      alert("Invalid Coupon Code. Try 'FIRST100'");
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setAppliedDiscount(0);
    setCouponApplied(false);
  };

  // Calculations
  const grandTotal = basePrice + taxes + convenienceFee - appliedDiscount;

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Payment Summary</Text>
      </View>

      {/* Coupon / Promo Code Card */}
      <View style={styles.couponCard}>
        {!couponApplied ? (
          <View style={styles.couponInputWrapper}>
            <Ionicons
              name="pricetag-outline"
              size={18}
              color={Colors.primary}
            />
            <TextInput
              style={styles.couponInput}
              placeholder="Enter Promo Code (Try FIRST100)"
              placeholderTextColor={Colors.textSecondary}
              value={couponCode}
              onChangeText={setCouponCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[
                styles.applyBtn,
                !couponCode.trim() && styles.disabledApplyBtn,
              ]}
              disabled={!couponCode.trim()}
              onPress={handleApplyCoupon}
              activeOpacity={0.8}
            >
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.appliedCouponContainer}>
            <View style={styles.appliedTextWrapper}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color="#16A34A"
              />
              <Text style={styles.appliedCouponText}>
                &lsquo;FIRST100&rsquo; Applied (₹100 OFF)
              </Text>
            </View>
            <TouchableOpacity onPress={removeCoupon} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={20} color="#DC2626" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Bill Breakdown Box */}
      <View style={styles.summaryCard}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Item Total (Service Price)</Text>
          <Text style={styles.rowValue}>₹{basePrice}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Taxes & Govt. Charges</Text>
          <Text style={styles.rowValue}>₹{taxes}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Convenience / Service Fee</Text>
          <Text style={styles.rowValue}>₹{convenienceFee}</Text>
        </View>

        {appliedDiscount > 0 && (
          <View style={styles.row}>
            <Text style={styles.discountLabel}>Promo Discount</Text>
            <Text style={styles.discountValue}>-₹{appliedDiscount}</Text>
          </View>
        )}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Grand Total */}
        <View style={styles.rowTotal}>
          <View>
            <Text style={styles.totalLabel}>Total Amount</Text>
            {appliedDiscount > 0 && (
              <Text style={styles.savingsTag}>
                You saved ₹{appliedDiscount} on this order
              </Text>
            )}
          </View>
          <Text style={styles.totalValue}>₹{grandTotal}</Text>
        </View>
      </View>

      {/* Trust & Safety Banner */}
      <View style={styles.trustBanner}>
        <Ionicons
          name="shield-checkmark-outline"
          size={16}
          color={Colors.primary}
        />
        <Text style={styles.trustText}>
          Safe & Secure Payments • 100% Satisfaction Guarantee
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.secondary,
  },

  /* Coupon Box */
  couponCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 8,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  couponInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  couponInput: {
    flex: 1,
    height: 40,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    marginLeft: 8,
  },
  applyBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledApplyBtn: {
    backgroundColor: Colors.border,
  },
  applyBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  appliedCouponContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  appliedTextWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  appliedCouponText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#16A34A",
  },

  /* Summary Card */
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  rowLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  rowValue: {
    fontSize: 13.5,
    fontWeight: "600",
    color: Colors.text,
  },
  discountLabel: {
    fontSize: 13,
    color: "#16A34A",
    fontWeight: "600",
  },
  discountValue: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#16A34A",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  rowTotal: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },
  savingsTag: {
    fontSize: 11,
    fontWeight: "600",
    color: "#16A34A",
    marginTop: 2,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.primary,
  },

  /* Trust Banner */
  trustBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F5FF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 12,
    gap: 6,
  },
  trustText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.primary,
  },
});