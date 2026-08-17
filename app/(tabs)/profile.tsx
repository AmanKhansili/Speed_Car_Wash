import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useUser, useClerk } from "@clerk/expo";
import { supabase } from "@/utils/supabase";

import Colors from "@/constants/colors";
import UserInfoCard from "@/components/profile/userInfoCard";
import MembershipBanner from "@/components/profile/MembershipBanner";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileMenuList from "@/components/profile/ProfileMenuList";
import MyVehiclesSection, { Vehicle } from "@/components/profile/MyVehiclesSection";

interface SupabaseProfile {
  phone: string | null;
  created_at: string;
}

interface UserStats {
  totalBookings: number;
  completed: number;
  upcoming: number;
  savedServices: number;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user, isLoaded: isClerkLoaded } = useUser();

  // Local States
  const [supabaseProfile, setSupabaseProfile] = useState<SupabaseProfile | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalBookings: 0,
    completed: 0,
    upcoming: 0,
    savedServices: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isPhoneModalVisible, setIsPhoneModalVisible] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [isSavingPhone, setIsSavingPhone] = useState(false);

  const fetchUserData = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // 1. Profile Data
      const { data: profileData } = await supabase
        .from("profiles")
        .select("phone, created_at")
        .eq("clerk_user_id", user.id)
        .maybeSingle();

      if (profileData) {
        setSupabaseProfile(profileData);
      }

      // 2. Vehicles
      const { data: vehicleData } = await supabase
        .from("vehicles")
        .select("id, make, model, vehicle_type, registration_number, image_url")
        .eq("user_id", user.id);

      if (vehicleData) {
        const formattedVehicles: Vehicle[] = vehicleData.map((v) => ({
          id: v.id,
          name: `${v.make || ""} ${v.model || ""}`.trim() || "My Car",
          type: v.vehicle_type || "Car",
          number: v.registration_number || "N/A",
          image: v.image_url,
        }));
        setVehicles(formattedVehicles);
      }

      // 3. Booking Stats (Using clerk_user_id to maintain database consistency)
      const { count: totalCount } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("clerk_user_id", user.id);

      const { count: completedCount } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("clerk_user_id", user.id)
        .eq("status", "completed");

      const { count: upcomingCount } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("clerk_user_id", user.id)
        .in("status", ["upcoming", "pending", "confirmed"]);

      const { count: savedCount } = await supabase
        .from("saved_services")
        .select("*", { count: "exact", head: true })
        .eq("clerk_user_id", user.id);

      setStats({
        totalBookings: totalCount || 0,
        completed: completedCount || 0,
        upcoming: upcomingCount || 0,
        savedServices: savedCount || 0,
      });
    } catch (error) {
      console.error("Error fetching user profile data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Refresh profile details every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (isClerkLoaded && user) {
        fetchUserData();
      }
    }, [isClerkLoaded, user, fetchUserData])
  );

  const handleSavePhone = async () => {
    if (!user || !phoneInput.trim()) return;

    try {
      setIsSavingPhone(true);

      const { error } = await supabase.from("profiles").upsert(
        {
          clerk_user_id: user.id,
          phone: phoneInput.trim(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "clerk_user_id" }
      );

      if (error) throw error;

      setSupabaseProfile((prev) => ({
        created_at: prev?.created_at || new Date().toISOString(),
        phone: phoneInput.trim(),
      }));

      setIsPhoneModalVisible(false);
      setPhoneInput("");
      Alert.alert("Success", "Phone number saved successfully!");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not save phone number.");
    } finally {
      setIsSavingPhone(false);
    }
  };

  const formatMemberSince = (isoDate: string | null) => {
    if (!isoDate) return "New Member";
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            router.replace("/" as any);
            await signOut();
          } catch (error) {
            console.error("Logout Error:", error);
          }
        },
      },
    ]);
  };

  if (!isClerkLoaded || isLoading) {
    return (
      <View style={[styles.container, styles.loadingCenter]}>
        <ActivityIndicator size="large" color={Colors.primary || "#2563EB"} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity
          style={styles.settingsBtn}
          activeOpacity={0.7}
          onPress={() => router.push("/settings" as any)}
        >
          <Ionicons name="settings-outline" size={22} color={Colors.text || "#0F172A"} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <UserInfoCard
          phone={supabaseProfile?.phone}
          onEditPress={() => router.push("/edit-profile" as any)}
          onChangeAvatar={() => console.log("Open Avatar Picker")}
          onAddPhone={() => setIsPhoneModalVisible(true)}
          onAddEmail={() => console.log("Handled via Clerk")}
        />

        <MembershipBanner
          memberSince={formatMemberSince(supabaseProfile?.created_at ?? null)}
          onPressBanner={() => router.push("/membership" as any)}
        />

        <MyVehiclesSection
          vehicles={vehicles}
          onAddCarPress={() => router.push("/add-vehicle" as any)}
          onCarPress={(car) => router.push(`/vehicle-details/${car.id}` as any)}
        />

        <ProfileStats
          totalBookings={stats.totalBookings}
          completed={stats.completed}
          upcoming={stats.upcoming}
          savedServices={stats.savedServices}
          onStatPress={(type) => {
            if (type === "saved") router.push("/saved-services" as any);
            else router.push("/(tabs)/bookings" as any);
          }}
        />

        <ProfileMenuList onLogoutPress={handleLogout} />
      </ScrollView>

      {/* Phone Number Modal */}
      <Modal visible={isPhoneModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Phone Number</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="+91 9876543210"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={phoneInput}
              onChangeText={setPhoneInput}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setIsPhoneModalVisible(false);
                  setPhoneInput("");
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSavePhone}
                disabled={isSavingPhone}
              >
                {isSavingPhone ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || "#F8FAFC",
  },
  loadingCenter: {
    justifyContent: "center",
    alignItems: "center",
  },
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text || "#0F172A",
  },
  settingsBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: Colors.border || "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border || "#E5E7EB",
  },
  modalCancelText: {
    fontWeight: "600",
    color: "#6B7280",
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary || "#2563EB",
  },
  modalSaveText: {
    fontWeight: "700",
    color: "#FFFFFF",
  },
});