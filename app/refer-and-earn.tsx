import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";
import Colors from "@/constants/colors"; 

const REWARD_TIERS = [
  { referralNumber: "Give ₹100", reward: "Friend gets ₹100 OFF on 1st wash", icon: "gift-outline" },
  { referralNumber: "Get ₹150", reward: "Earn ₹150 wallet credits in your app", icon: "wallet-outline" },
  { referralNumber: "Unlimited Earn", reward: "Use credits to get 100% FREE washes", icon: "sparkles-outline" },
];

export default function ReferAndEarnScreen() {
  const { user } = useUser();
  const referralCode =
    "SCW-" + (user?.id ? user.id.slice(-6).toUpperCase() : "FRIEND1");

  const shareMessage = `✨ Premium Car Wash with Speed Car Wash!\n\nHey! Get ₹100 OFF on your first car wash booking. 🧼\n\nUse my invite code ${referralCode} at signup to claim your reward!\n\n🎁 How it works:\n• You get ₹100 OFF on your 1st booking\n• I get ₹150 wallet cashback once your wash is done 🎉\n\n📲 Download the Speed Car Wash App today:\nAndroid: https://play.google.com/store/apps/details?id=com.speedcarwash.app\niOS: https://apps.apple.com/app/speed-car-wash/id123456789`;

  const handleShare = async () => {
    try {
      await Share.share({ message: shareMessage });
    } catch (error) {
      Alert.alert("Share failed", "Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Hero banner */}
      <View style={styles.hero}>
        <Ionicons name="gift-outline" size={44} color={Colors.warning} />
        <Text style={styles.heroTitle}>Refer & Earn</Text>
        <Text style={styles.heroSubtitle}>
          Give ₹100, Get ₹150! Share the care and enjoy free washes using your wallet credits.
        </Text>
      </View>

      {/* Referral code card */}
      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>Your Referral Code</Text>
        <View style={styles.codeRow}>
          <Text selectable style={styles.codeText}>
            {referralCode}
          </Text>
          <Text style={styles.longPressHint}>Tap & hold to copy</Text>
        </View>

        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={20} color={Colors.surface} />
          <Text style={styles.shareBtnText}>Share with Friends</Text>
        </TouchableOpacity>
      </View>

      {/* Tier list */}
      <Text style={styles.sectionTitle}>Referral Benefits</Text>
      <View style={styles.tierList}>
        {REWARD_TIERS.map((tier) => (
          <View key={tier.referralNumber} style={styles.tierCard}>
            <View style={styles.tierIconWrap}>
              <Ionicons name={tier.icon as any} size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tierLabel}>{tier.referralNumber}</Text>
              <Text style={styles.tierReward}>{tier.reward}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* How it works */}
      <Text style={styles.sectionTitle}>How It Works</Text>
      <View style={styles.stepsCard}>
        {[
          "Share your referral code with friends",
          "They signup & get instant ₹100 discount on their first booking",
          "Once their wash is completed, ₹150 is credited to your app wallet",
          "Use your wallet money to get completely FREE washes anytime!",
        ].map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{i + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  hero: {
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: Colors.primary,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.surface,
    marginTop: 10,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.primaryLight,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },
  codeCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 18,
    marginTop: -24,
    borderRadius: 18,
    padding: 18,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  codeLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontWeight: "600",
  },
  codeRow: {
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.secondaryLight,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: Colors.primaryLight,
  },
  codeText: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 1,
    color: Colors.text,
  },
  longPressHint: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 4,
  },
  shareBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 14,
    gap: 8,
  },
  shareBtnText: {
    color: Colors.surface,
    fontWeight: "700",
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.text,
    marginTop: 26,
    marginBottom: 12,
    marginHorizontal: 18,
  },
  tierList: {
    marginHorizontal: 18,
    gap: 10,
  },
  tierCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tierIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  tierLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  tierReward: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.primary,
    marginTop: 2,
  },
  bestBadge: {
    backgroundColor: Colors.warning,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  bestBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.text,
  },
  stepsCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 18,
    borderRadius: 14,
    padding: 16,
    gap: 14,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  stepNumberText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: "700",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
