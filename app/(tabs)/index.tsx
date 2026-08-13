import Colors from "@/constants/colors";
import Radius from "@/constants/radius";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
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
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useUser, useClerk } from "@clerk/expo";

export default function HomeScreen() {
  const [address, setAddress] = useState("Fetching location...");
  const { user, isLoaded: isClerkLoaded } = useUser();

  useEffect(() => {
    (async () => {
      try {
        // 🚀 3. User se Location ki Permission mango
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          // Agar user 'Deny' kar de, toh ek default location set kar do
          setAddress("Delhi, India");
          return;
        }

        // 🚀 4. Current Coordinates (Lat/Lng) nikalo
        let location = await Location.getCurrentPositionAsync({});

        // 🚀 5. Coordinates ko real address mein convert karo
        let geoCode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        // 🚀 6. Address ko format karke UI par dikha do
        if (geoCode.length > 0) {
          const currentPlace = geoCode[0];
          // Ye kuch aisa dikhega: "Connaught Place, Delhi"
          const formattedAddress = `${currentPlace.district || currentPlace.city}, ${currentPlace.region}`;
          setAddress(formattedAddress);
        }
      } catch (error) {
        console.log("Location Error:", error);
        setAddress("Delhi, India"); // Fallback location
      }
    })();
  }, []);

  const router = useRouter();
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Image
              source={require("@/assets/logo/logo.png")}
              style={{ width: 70, height: 50 }}
              resizeMode="contain"
            />
          </View>

          <View style={styles.locationContainer}>
            <View>
              <Text style={styles.locationLabel}>
                <Ionicons name="location" size={11} color="#EF4444" />
                Current Location
              </Text>
              <Text style={styles.locationText}>
                {address}
                <Ionicons
                  name="chevron-down"
                  size={12}
                  color="#6B7280"
                  style={{ alignSelf: "center" }}
                />
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color={Colors.text}
            />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* GREETING */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>Hello, {user?.firstName} 👋</Text>
          <Text style={styles.greetingSub}>
            Keep your car clean, Keep your ride fresh
          </Text>
        </View>

        <HeroBanner />
        <QuickActions />

        {/* POPULAR SERVICES */}
        <SectionTitle
          title="Popular Services"
          onPress={() => router.push("/services")}
        />

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
        <SectionTitle
          title="Customer Reviews"
          onPress={() => router.push("/services")}
        />

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
  scrollContent: { paddingBottom: 70 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    // paddingTop: 16,
    paddingBottom: 10,
  },

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
  greetingTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 6,
  },
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

  locationContainer: { flexDirection: "row", alignItems: "center", gap: 6 },
  locationLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    textAlign: "center",
  },
  locationText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: "700",
    textAlign: "center",
  },
});
