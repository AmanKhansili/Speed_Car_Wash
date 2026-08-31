import Colors from "@/constants/colors";
import { createClerkSupabaseClient } from "@/utils/supabase";
import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Subscription = {
  id: string;
  plan_name: string;
  tier: string;
  status: string;
  current_period_end: string;
  base_price: number;
  total_amount: number;
  created_at: string;
};

const TIER_COLORS: Record<string, string> = {
  "Standard Member": "#94A3B8",
  "Gold Member": "#D4A24C",
  "Premium Member": "#7C3AED",
};

const CACHE_KEY = "MEMBERSHIP_STATUS_CACHE";

export default function MembershipStatusScreen() {
  const { userId, getToken, isLoaded, isSignedIn } = useAuth();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [current, setCurrent] = useState<Subscription | null>(null);
  const [history, setHistory] = useState<Subscription[]>([]);

  const db = useMemo(() => createClerkSupabaseClient(getToken), [getToken]);

  // 1. Instant Cache Load
  useEffect(() => {
    (async () => {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.current) setCurrent(parsed.current);
          if (parsed.history) setHistory(parsed.history);
        } else {
          setLoading(true); // Sirf pehli baar loader dikhega agar cache bilkul empty ho
        }
      } catch (e) {
        console.error("Cache read error", e);
      }
    })();
  }, []);

  // 2. Fetch from Supabase
  const fetchSubscriptions = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await db
        .from("subscriptions")
        .select(
          "id, plan_name, tier, status, current_period_end, base_price, total_amount, created_at",
        )
        .eq("clerk_user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching subscriptions:", error.message);
      } else {
        const rows = (data as Subscription[]) || [];
        const activeOne =
          rows.find(
            (r) =>
              r.status?.toLowerCase() === "active" &&
              new Date(r.current_period_end).getTime() > Date.now(),
          ) || null;

        setCurrent(activeOne);
        setHistory(rows);

        // Background me cache save
        AsyncStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ current: activeOne, history: rows }),
        ).catch(() => {});
      }
    } catch (err) {
      console.error("Unexpected error in fetching subscriptions:", err);
    } finally {
      setLoading(false);
    }
  }, [db, userId]);

  useEffect(() => {
    if (isLoaded && isSignedIn && userId) {
      fetchSubscriptions();
    }
  }, [isLoaded, isSignedIn, userId, fetchSubscriptions]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSubscriptions();
    setRefreshing(false);
  };

  const daysLeft = current
    ? Math.ceil(
        (new Date(current.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      )
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Membership</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading && !current && history.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary || "#2563EB"} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary || "#2563EB"]}
              tintColor={Colors.primary || "#2563EB"}
            />
          }
        >
          {current ? (
            <>
              <View
                style={[
                  styles.currentCard,
                  { backgroundColor: TIER_COLORS[current.tier] || "#1E293B" },
                ]}
              >
                <Text style={styles.currentBadge}>ACTIVE MEMBERSHIP</Text>
                <Text style={styles.currentTier}>{current.tier}</Text>
                <Text style={styles.currentExpiry}>
                  {daysLeft > 0
                    ? `Expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`
                    : "Expires today"}
                </Text>
                <Text style={styles.currentDate}>
                  Valid till{" "}
                  {new Date(current.current_period_end).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              </View>

              {daysLeft <= 5 && (
                <View style={styles.renewBanner}>
                  <Ionicons name="alert-circle" size={18} color="#B45309" />
                  <Text style={styles.renewText}>
                    Your membership is expiring soon. Renew to keep enjoying benefits without
                    interruption.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.renewBtn}
                onPress={() => router.push("/membership" as any)}
              >
                <Text style={styles.renewBtnText}>
                  {daysLeft <= 5 ? "Renew Membership" : "Upgrade / Change Plan"}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.noMembership}>
              <Ionicons name="star-outline" size={40} color="#9CA3AF" />
              <Text style={styles.noMembershipTitle}>No Active Membership</Text>
              <Text style={styles.noMembershipSubtitle}>
                Get a membership plan to unlock exclusive benefits and pricing.
              </Text>
              <TouchableOpacity
                style={styles.getBtn}
                onPress={() => router.push("/membership" as any)}
              >
                <Text style={styles.getBtnText}>View Plans</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.sectionTitle}>Payment History</Text>
          {history.length === 0 ? (
            <Text style={styles.emptyText}>No membership payments yet.</Text>
          ) : (
            history.map((item) => (
              <View key={item.id} style={styles.historyCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyTier}>{item.tier}</Text>
                  <Text style={styles.historyDate}>
                    {new Date(item.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.historyAmount}>₹{item.total_amount ?? item.base_price}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      item.status?.toLowerCase() === "active"
                        ? styles.statusActive
                        : item.status?.toLowerCase() === "pending"
                          ? styles.statusPending
                          : styles.statusFailed,
                    ]}
                  >
                    <Text style={styles.statusPillText}>{item.status}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
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
  content: { padding: 16, paddingBottom: 40 },
  currentCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
  },
  currentBadge: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  currentTier: { color: "#FFF", fontSize: 24, fontWeight: "900" },
  currentExpiry: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  currentDate: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    marginTop: 2,
  },
  renewBanner: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "flex-start",
  },
  renewText: { flex: 1, fontSize: 12, color: "#92400E", lineHeight: 17 },
  renewBtn: {
    backgroundColor: Colors.primary || "#2563EB",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  renewBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  noMembership: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 24,
  },
  noMembershipTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginTop: 10,
  },
  noMembershipSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  getBtn: {
    backgroundColor: Colors.primary || "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  getBtnText: { color: "#FFF", fontWeight: "700" },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 10,
  },
  emptyText: { fontSize: 13, color: "#9CA3AF" },
  historyCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 10,
  },
  historyTier: { fontSize: 14, fontWeight: "700", color: "#111827" },
  historyDate: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  historyAmount: { fontSize: 14, fontWeight: "700", color: "#111827" },
  statusPill: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusActive: { backgroundColor: "#DCFCE7" },
  statusPending: { backgroundColor: "#FEF3C7" },
  statusFailed: { backgroundColor: "#FEE2E2" },
  statusPillText: { fontSize: 10, fontWeight: "700", color: "#374151" },
});
