import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import SectionHeader from "@/components/common/SectionHeader";
import UserInfoCard from "@/components/profile/userInfoCard";
import MembershipBanner from "@/components/profile/MembershipBanner";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileMenuList from "@/components/profile/ProfileMenuList";
import MyVehiclesSection from "@/components/profile/MyVehiclesSection";

export default function ProfileScreen() {
  const handleMenuPress = (menuId: string) => {
    console.log("Selected Menu Item:", menuId);
    if (menuId === "logout") {
      // Trigger Logout Logic
    }
  };

  return (
    <View style={styles.container}>
      <SectionHeader title="Profile" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity style={styles.settingsBtn} activeOpacity={0.7}>
          <Ionicons name="settings-outline" size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <UserInfoCard
          onEditPress={() => console.log("Navigate to Edit Profile")}
          onChangeAvatar={() => console.log("Open Image Picker")}
        />
        <MembershipBanner
          memberSince="May 2024"
          onPressBanner={() => console.log("Open Membership Details")}
        />
        <MyVehiclesSection
          onAddCarPress={() => console.log("Navigate to Add Car Screen")}
          onCarPress={(car) => console.log("Selected Car:", car.name)}
        />
        <ProfileStats
          onStatPress={(type) => console.log(`Selected Stat: ${type}`)}
        />
        <ProfileMenuList onItemPress={handleMenuPress} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || "#F8FAFC",
  },

  /* Header Styling */
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

  /* Scroll View Padding */
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
});