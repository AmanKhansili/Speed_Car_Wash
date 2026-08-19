import { createClerkSupabaseClient } from "@/utils/supabase";
import { useAuth, useClerk } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AuthGate from "@/components/auth/AuthGate";
import MembershipBanner from "@/components/profile/MembershipBanner";
import MyVehiclesSection from "@/components/profile/MyVehiclesSection";
import ProfileMenuList from "@/components/profile/ProfileMenuList";
import ProfileStats from "@/components/profile/ProfileStats";
import UserInfoCard from "@/components/profile/userInfoCard";
import Colors from "@/constants/colors";

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { userId, getToken, isLoaded: isClerkLoaded, isSignedIn } = useAuth();

  const [supabaseProfile, setSupabaseProfile] = useState<any>(null);
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    completed: 0,
    upcoming: 0,
    savedServices: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const client = createClerkSupabaseClient(getToken);

      // 1. Profile Data
      const { data: profileData } = await client
        .from("profiles")
        .select("phone, created_at")
        .eq("clerk_user_id", userId)
        .maybeSingle();

      if (profileData) setSupabaseProfile(profileData);

      // 2. Fetch all bookings for this user
      const { data: bookingsData, error: bErr } = await client
        .from("bookings")
        .select("*")
        .or(`clerk_user_id.eq.${userId},user_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (!bErr && bookingsData) {
        // Quick book cards (Saved status)
        const quickCards = bookingsData.filter(
          (b: any) => b.status === "Saved" || b.status === "Saved_Template" || b.status === "saved",
        );
        setSavedCards(quickCards);

        // Stats calculation
        const completed = bookingsData.filter(
          (b: any) => b.status?.toLowerCase() === "completed",
        ).length;

        const upcoming = bookingsData.filter((b: any) =>
          ["confirmed", "pending", "upcoming"].includes(b.status?.toLowerCase()),
        ).length;

        setStats({
          totalBookings: bookingsData.length,
          completed,
          upcoming,
          savedServices: quickCards.length,
        });
      }
    } catch (err) {
      console.error("Profile load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      if (isClerkLoaded && userId && isMounted) {
        loadData();
      }
      return () => {
        isMounted = false;
      };
    }, [userId, isClerkLoaded]),
  );

  if (!isClerkLoaded || isLoading) {
    return (
      <View style={[styles.container, styles.loadingCenter]}>
        <ActivityIndicator size="large" color={Colors.primary || "#2563EB"} />
      </View>
    );
  }

  if (!isSignedIn) return <AuthGate />;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => router.push("/settings" as any)}
        >
          <Ionicons name="settings-outline" size={22} color={Colors.text || "#0F172A"} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <UserInfoCard
          phone={supabaseProfile?.phone}
          onEditPress={() => router.push("/edit-profile" as any)}
          onChangeAvatar={() => {}}
          onAddPhone={() => {}}
          onAddEmail={() => {}}
        />

        <MembershipBanner
          memberSince="New Member"
          onPressBanner={() => router.push("/membership" as any)}
        />

        {/* Quick Actions (Cards ya Empty State) */}
        <MyVehiclesSection
          savedCards={savedCards}
          onAddCarPress={() => router.push("/booking/step1-selection" as any)}
        />

        {/* Stats */}
        <ProfileStats
          totalBookings={stats.totalBookings}
          completed={stats.completed}
          upcoming={stats.upcoming}
          savedServices={stats.savedServices}
          onStatPress={(type) => {
            type === "saved"
              ? router.push("/saved-services" as any)
              : router.push("/(tabs)/bookings" as any);
          }}
        />

        <ProfileMenuList onLogoutPress={() => signOut()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background || "#F8FAFC" },
  loadingCenter: { justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 56,
    backgroundColor: Colors.surface || "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border || "#F1F5F9",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: Colors.text || "#0F172A" },
  settingsBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  scrollContent: { padding: 16, paddingBottom: 40 },
});
