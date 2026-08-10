import Colors from "@/constants/colors";
import Radius from "@/constants/radius";
import Shadow from "@/constants/shadow";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ReviewCard from "@/components/cards/ReviewCard";
import ServiceCard from "@/components/cards/ServiceCard";
import SectionTitle from "@/components/common/SectionTitle";
import HeroBanner from "@/components/home/HeroBanner";
import MembershipBanner from "@/components/home/MembershipBanner";
import QuickActions from "@/components/home/QuickActions";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.logoPlaceholder}>
            <Image
              source={require("@/assets/logo/logo.png")}
              style={{ width: 70, height: 50 }}
              resizeMode="contain"
            />
          </View>

          <View style={styles.locationWrapper}>
            <Ionicons name="location" size={16} color={Colors.primary} />
            <Text style={styles.locationText}>Delhi, India</Text>
          </View>

          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={22} color={Colors.text} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* GREETING */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>Hello, Aman 👋</Text>
          <Text style={styles.greetingSub}>Keep your car clean,{"\n"}Keep your ride fresh</Text>
        </View>

        <HeroBanner />
        <QuickActions />

        {/* POPULAR SERVICES */}
        <SectionTitle title="Popular Services" onPress={() => router.push("/services")} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          <ServiceCard
            title="Exterior Wash"
            subtitle="Shine Like New"
            price="₹299"
            rating="4.9"
            reviews="120"
            tag="Popular"
            image={require("@/assets/images/services/exterior.png")}
            style={{ marginRight: 16 }}
          />
          <ServiceCard
            title="Interior Cleaning"
            subtitle="Fresh & Clean"
            price="₹499"
            rating="4.8"
            reviews="69"
            image={require("@/assets/images/services/interior.png")}
            style={{ marginRight: 16 }}
          />
          <ServiceCard
            title="Ceramic Coating"
            subtitle="Long Lasting Protection"
            price="₹1999"
            rating="5.0"
            reviews="10"
            tag="Popular"
            image={require("@/assets/images/services/ceramic.png")}
            style={{ marginRight: 16 }}
          />
          <ServiceCard
            title="Car Detailing"
            subtitle="Premium Shine"
            price="₹999"
            rating="4"
            reviews="9"
            image={require("@/assets/images/services/detailing.png")}
            style={{ marginRight: 16 }}
          />
        </ScrollView>

        {/* PREMIUM MEMBERSHIP BANNER */}
        <MembershipBanner />

        {/* CUSTOMER REVIEWS */}
        <SectionTitle title="Customer Reviews" onPress={() => router.push("/services")} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          <ReviewCard
            name="Aman"
            rating={5}
            review="Excellent service. My car looks brand new. Highly recommended!"
          />
          <ReviewCard
            name="Amit"
            rating={4}
            review="Very professional detailers. They arrived exactly on time."
          />
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  logoPlaceholder: {
    justifyContent: "center",
    height: 40,
  },
  logoText: { fontSize: 16, fontWeight: "900", color: Colors.text, fontStyle: "italic" },
  logoSubText: { fontSize: 10, fontWeight: "800", color: "#3B82F6" },
  locationWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.xl,
    ...Shadow.light,
  },
  locationText: { fontSize: 13, fontWeight: "600", color: Colors.text, marginLeft: 4 },
  notificationBtn: { padding: 4 },
  notificationDot: {
    position: "absolute",
    top: 4,
    right: 6,
    width: 8,
    height: 8,
    backgroundColor: Colors.error,
    borderRadius: Radius.round,
    borderWidth: 1,
    borderColor: Colors.background,
  },
  greetingSection: { paddingHorizontal: 16, marginBottom: 24 },
  greetingTitle: { fontSize: 24, fontWeight: "800", color: Colors.text, marginBottom: 6 },
  greetingSub: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: Colors.text },
  viewAllText: { fontSize: 13, fontWeight: "700", color: Colors.primary },
  horizontalScroll: { paddingLeft: 16, paddingRight: 8, paddingBottom: 16 }, 
});
