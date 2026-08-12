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
import { useBookingStore } from "@/store/bookingStore";
import * as Location from "expo-location";
import { useRouter } from "expo-router";

// 🚀 Dynamic Popular Services Data
const POPULAR_SERVICES = [
  {
    id: "pop_1",
    title: "Silver Wash",
    subtitle: "Vacuum, Shampoo & Underbody",
    price: 400,
    rating: "4.7",
    reviews: "124",
    tag: "Popular",
    image: require("@/assets/images/services/exterior.png"),
  },
  {
    id: "pop_2",
    title: "Platinum Wash",
    subtitle: "Foam Wash, Interior Dry Clean & Polish",
    price: 1400,
    rating: "4.9",
    reviews: "56",
    tag: "Popular",
    image: require("@/assets/images/services/interior.png"),
  },
  {
    id: "pop_3",
    title: "Teflon Coating",
    subtitle: "PTFE Polymer Paint Protection",
    price: 2500,
    rating: "5.0",
    reviews: "34",
    tag: "Popular",
    image: require("@/assets/images/services/ceramic.png"),
  },
  {
    id: "pop_4",
    title: "Wax Rubbing & Buffing",
    subtitle: "Scratch Repair & Paint Gloss Restore",
    price: 1400,
    rating: "4.8",
    reviews: "75",
    tag: "Popular",
    image: require("@/assets/images/services/detailing.png"),
  },
];

export default function HomeScreen() {
  const [address, setAddress] = useState("Fetching location...");
  const router = useRouter();

  // 🚀 Zustand se addService function nikala
  const { addService } = useBookingStore();

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setAddress("Delhi, India");
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        let geoCode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (geoCode.length > 0) {
          const currentPlace = geoCode[0];
          const formattedAddress = `${currentPlace.district || currentPlace.city}, ${currentPlace.region}`;
          setAddress(formattedAddress);
        }
      } catch (error) {
        console.log("Location Error:", error);
        setAddress("Delhi, India");
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
            <Ionicons name="notifications-outline" size={22} color={Colors.text} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* GREETING */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>Hello, Aman 👋</Text>
          <Text style={styles.greetingSub}>Keep your car clean, Keep your ride fresh</Text>
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
          {/* 🚀 Dynamic Map Logic for Popular Services */}
          {POPULAR_SERVICES.map((item) => (
            <ServiceCard
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              price={`₹${item.price}`} // String format for UI
              rating={item.rating}
              reviews={item.reviews}
              tag={item.tag}
              image={item.image}
              style={{ marginRight: 16 }}
              onAddPress={() => {
                // 1. Service ko cart/store mein add karo
                addService({
                  id: item.id,
                  title: item.title,
                  price: item.price,
                });
                // 2. Direct Booking page par bhej do
                router.push("/booking/step1-selection" as any);
              }}
            />
          ))}
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
  scrollContent: { paddingBottom: 70 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
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
  greetingTitle: { fontSize: 24, fontWeight: "800", color: Colors.text, marginBottom: 6 },
  greetingSub: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  horizontalScroll: { paddingLeft: 16, paddingRight: 8, paddingBottom: 16 },
  locationContainer: { flexDirection: "row", alignItems: "center", gap: 6 },
  locationLabel: { fontSize: 11, color: "#6B7280", fontWeight: "600", textAlign: "center" },
  locationText: { fontSize: 12, color: Colors.text, fontWeight: "700", textAlign: "center" },
});
