import AuthGate from "@/components/auth/AuthGate";
import MembershipBanner from "@/components/profile/MembershipBanner";
import MyVehiclesSection from "@/components/profile/MyVehiclesSection";
import ProfileMenuList from "@/components/profile/ProfileMenuList";
import ProfileStats from "@/components/profile/ProfileStats";
import UserInfoCard from "@/components/profile/userInfoCard";
import Colors from "@/constants/colors";
import { createClerkSupabaseClient } from "@/utils/supabase";
import {
  clearLocalUserData,
  getCachedProfileData,
  getCachedStatsData,
  saveProfileCache,
  saveStatsCache,
} from "@/utils/userStorage";
import { useAuth, useClerk, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TIER_DISPLAY: Record<string, "Gold Member" | "Premium Member"> = {
  gold: "Gold Member",
  premium: "Premium Member",
};

interface SupabaseProfile {
  name?: string | null;
  phone: string | null;
  created_at: string;
  membership_tier?: string | null;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const { userId, getToken, isLoaded: isAuthLoaded } = useAuth();
  const isLoaded = isUserLoaded && isAuthLoaded;
  const db = useMemo(() => createClerkSupabaseClient(getToken), [getToken]);
  const [supabaseProfile, setSupabaseProfile] = useState<SupabaseProfile | null>(null);
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    completed: 0,
    upcoming: 0,
    savedServices: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [firstNameInput, setFirstNameInput] = useState("");
  const [lastNameInput, setLastNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);

  const activePhoneNumber = useMemo(() => {
    return (
      supabaseProfile?.phone ||
      user?.primaryPhoneNumber?.phoneNumber ||
      user?.phoneNumbers?.[0]?.phoneNumber ||
      ""
    );
  }, [supabaseProfile, user]);

  const fetchUserData = useCallback(
    async (forceRefresh = false) => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        // 1. Instant Local Cache Fetch
        const cachedProfile = await getCachedProfileData();
        const cachedStats = await getCachedStatsData();

        if (cachedProfile) setSupabaseProfile(cachedProfile);
        if (cachedStats) setStats(cachedStats);

        if (!cachedProfile || !cachedStats) {
          setIsLoading(true);
        } else {
          setIsLoading(false);
        }

        if (cachedProfile && cachedStats && !forceRefresh) {
          return;
        }

        // 2. Fetch Profile safely without overwriting existing DB data
        const { data: profileData, error: profileErr } = await db
          .from("profiles")
          .select("name, phone, created_at, membership_tier")
          .eq("clerk_user_id", userId)
          .maybeSingle();

        if (profileErr) {
          console.error("Error fetching profile:", profileErr);
          setIsLoading(false);
          return;
        }

        if (profileData) {
          // DB Record exists: Keep DB phone or fallback to Clerk if empty
          const finalPhone =
            profileData.phone ||
            user?.primaryPhoneNumber?.phoneNumber ||
            user?.phoneNumbers?.[0]?.phoneNumber ||
            null;

          const formattedProfile = {
            name: profileData.name,
            phone: finalPhone,
            created_at: profileData.created_at,
            membership_tier: profileData.membership_tier,
          };

          setSupabaseProfile(formattedProfile);
          await saveProfileCache(formattedProfile);
        } else {
          // Record genuinely missing -> safe to create first time
          const clerkPhone =
            user?.primaryPhoneNumber?.phoneNumber || user?.phoneNumbers?.[0]?.phoneNumber || null;

          const { data: newProfile, error: insertErr } = await db
            .from("profiles")
            .insert({
              clerk_user_id: userId,
              name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
              phone: clerkPhone,
              updated_at: new Date().toISOString(),
            })
            .select("name, phone, created_at, membership_tier")
            .single();

          if (insertErr) {
            console.error("Error creating profile:", insertErr);
            setIsLoading(false);
            return;
          }

          if (newProfile) {
            const formattedProfile = {
              name: newProfile.name,
              phone: newProfile.phone,
              created_at: newProfile.created_at,
              membership_tier: newProfile.membership_tier,
            };
            setSupabaseProfile(formattedProfile);
            await saveProfileCache(formattedProfile);
          }
        }

        // 3. Fetch Bookings
        const { data: bookingsData, error: bErr } = await db
          .from("bookings")
          .select("*")
          .or(`clerk_user_id.eq.${userId},user_id.eq.${userId}`)
          .order("created_at", { ascending: false });

        if (bErr) {
          console.error("Error fetching bookings:", bErr);
        }

        if (!bErr && bookingsData) {
          const quickCards = bookingsData.filter(
            (b: any) =>
              b.status === "Saved" ||
              b.status === "Saved_Template" ||
              b.status?.toLowerCase() === "saved",
          );
          setSavedCards(quickCards);

          const completed = bookingsData.filter(
            (b: any) => b.status?.toLowerCase() === "completed",
          ).length;

          const upcoming = bookingsData.filter((b: any) =>
            ["confirmed", "pending", "upcoming"].includes(b.status?.toLowerCase()),
          ).length;

          const freshStats = {
            totalBookings: bookingsData.length,
            completed,
            upcoming,
            savedServices: quickCards.length,
          };

          setStats(freshStats);
          await saveStatsCache(freshStats);
        }
      } catch (error) {
        console.error("Error fetching user profile data:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, db, user],
  );

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      if (isLoaded && userId && isMounted) {
        fetchUserData(true);
      }
      return () => {
        isMounted = false;
      };
    }, [userId, isLoaded, fetchUserData]),
  );

  const handleOpenEditModal = () => {
    setFirstNameInput(user?.firstName || "");
    setLastNameInput(user?.lastName || "");
    setPhoneInput(activePhoneNumber);
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    if (!firstNameInput.trim()) {
      Alert.alert("Validation Error", "Please enter your first name.");
      return;
    }

    try {
      setIsSavingProfile(true);

      // 1. Update Name in Clerk
      await user.update({
        firstName: firstNameInput.trim(),
        lastName: lastNameInput.trim(),
      });

      // 2. Explicitly Update Phone and Name in Supabase
      const formattedPhone = phoneInput.trim();
      const fullName = `${firstNameInput.trim()} ${lastNameInput.trim()}`.trim();

      const { error } = await db.from("profiles").upsert(
        {
          clerk_user_id: user.id,
          name: fullName,
          email: user.primaryEmailAddress?.emailAddress || null,
          phone: formattedPhone,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "clerk_user_id" },
      );

      if (error) throw error;

      const updatedProfile: SupabaseProfile = {
        name: fullName,
        created_at: supabaseProfile?.created_at || new Date().toISOString(),
        phone: formattedPhone,
        membership_tier: supabaseProfile?.membership_tier,
      };

      setSupabaseProfile(updatedProfile);
      await saveProfileCache(updatedProfile);

      setIsEditModalVisible(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not save profile details.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDeleteSavedCard = async (cardId: string) => {
    setSavedCards((prev) => prev.filter((c) => c.id !== cardId));
    setStats((prev) => ({
      ...prev,
      totalBookings: Math.max(0, prev.totalBookings - 1),
      savedServices: Math.max(0, prev.savedServices - 1),
    }));

    const { error } = await db.from("bookings").delete().eq("id", cardId);
    if (error) {
      fetchUserData(false);
      throw error;
    }
  };

  const handleHelpAndSupport = () => {
    Alert.alert("Help & Support", "How would you like to get assistance?", [
      {
        text: "Call Support",
        onPress: () => Linking.openURL("tel:+919876543210"),
      },
      {
        text: "WhatsApp Us",
        onPress: () =>
          Linking.openURL(
            "whatsapp://send?phone=+919876543210&text=Hi,%20I%20need%20assistance%20with%20my%20car%20wash%20booking.",
          ).catch(() => Alert.alert("Error", "WhatsApp is not installed on your device.")),
      },
      {
        text: "Email Support",
        onPress: () => Linking.openURL("mailto:support@speedcarwash.com"),
      },
      { text: "Cancel", style: "cancel" },
    ]);
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
            await clearLocalUserData();
            await signOut();
          } catch (error) {
            console.error("Logout Error:", error);
          }
        },
      },
    ]);
  };

  if (!isLoaded) {
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
          onPress={() => setIsSettingsModalVisible(true)}
        >
          <Ionicons name="settings-outline" size={22} color={Colors.text || "#0F172A"} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <UserInfoCard
          phone={activePhoneNumber}
          onEditPress={handleOpenEditModal}
          onAddPhone={handleOpenEditModal}
          onAddEmail={() =>
            Alert.alert("Email Address", "Email is managed securely via account settings.")
          }
        />

        {supabaseProfile?.membership_tier && supabaseProfile.membership_tier !== "standard" && (
          <MembershipBanner
            memberSince="New Member"
            tier={TIER_DISPLAY[supabaseProfile.membership_tier]}
            onPressBanner={() => router.push("/membership/status" as any)}
          />
        )}

        <MyVehiclesSection
          savedCards={savedCards}
          onAddCarPress={() => router.push("/booking/step1-selection" as any)}
          onDeleteCard={handleDeleteSavedCard}
        />

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

        <ProfileMenuList onLogoutPress={handleLogout} />
      </ScrollView>

      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardContainer}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => {
              Keyboard.dismiss();
              setIsEditModalVisible(false);
            }}
          >
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit Profile</Text>

                <Text style={styles.inputLabel}>First Name</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="First Name"
                  placeholderTextColor="#9CA3AF"
                  value={firstNameInput}
                  onChangeText={setFirstNameInput}
                />

                <Text style={styles.inputLabel}>Last Name</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Last Name"
                  placeholderTextColor="#9CA3AF"
                  value={lastNameInput}
                  onChangeText={setLastNameInput}
                />

                <Text style={styles.inputLabel}>Mobile Number</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="+91 9876543210"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  value={phoneInput}
                  onChangeText={setPhoneInput}
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setIsEditModalVisible(false)}
                    disabled={isSavingProfile}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalSaveBtn}
                    onPress={handleSaveProfile}
                    disabled={isSavingProfile}
                  >
                    {isSavingProfile ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <Text style={styles.modalSaveText}>Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={isSettingsModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsSettingsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsSettingsModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.settingsHeader}>
              <Text style={styles.modalTitle}>Settings</Text>
              <TouchableOpacity onPress={() => setIsSettingsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                setIsSettingsModalVisible(false);
                handleOpenEditModal();
              }}
            >
              <Ionicons name="person-outline" size={20} color={Colors.primary || "#2563EB"} />
              <Text style={styles.settingItemText}>Account Details</Text>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                setIsSettingsModalVisible(false);
                router.push("/membership" as any);
              }}
            >
              <Ionicons name="ribbon-outline" size={20} color={Colors.primary || "#2563EB"} />
              <Text style={styles.settingItemText}>Membership & Plans</Text>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                setIsSettingsModalVisible(false);
                handleHelpAndSupport();
              }}
            >
              <Ionicons name="headset-outline" size={20} color={Colors.primary || "#2563EB"} />
              <Text style={styles.settingItemText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingItem, { borderBottomWidth: 0 }]}
              onPress={() => {
                setIsSettingsModalVisible(false);
                handleLogout();
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={[styles.settingItemText, { color: "#EF4444" }]}>Log Out</Text>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  loadingCenter: { justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text || "#0F172A",
  },
  settingsBtn: { padding: 6 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  keyboardContainer: { flex: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
  },
  settingsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text || "#0F172A",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 12,
  },
  settingItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text || "#0F172A",
  },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 24 },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  modalCancelText: { fontSize: 15, fontWeight: "600", color: "#64748B" },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary || "#2563EB",
    alignItems: "center",
  },
  modalSaveText: { fontSize: 15, fontWeight: "600", color: "#FFFFFF" },
});
