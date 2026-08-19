import Colors from "@/constants/colors";
import Radius from "@/constants/radius";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
import { supabase } from "@/utils/supabase";
import { useUser } from "@clerk/expo";
import * as Location from "expo-location";
import { useFocusEffect, useRouter } from "expo-router";

const POPULAR_SERVICES = [
  {
    id: "pop_1",
    title: "Silver Wash",
    subtitle: "Vacuum, Shampoo & Underbody",
    price: 400,
    rating: "4.7",
    reviews: "124",
    tag: "Popular",
    image: require("@/assets/images/services/exterior.webp"),
  },
  {
    id: "pop_2",
    title: "Platinum Wash",
    subtitle: "Foam Wash, Interior Dry Clean & Polish",
    price: 1400,
    rating: "4.9",
    reviews: "56",
    tag: "Popular",
    image: require("@/assets/images/services/interior.webp"),
  },
  {
    id: "pop_3",
    title: "Teflon Coating",
    subtitle: "PTFE Polymer Paint Protection",
    price: 2500,
    rating: "5.0",
    reviews: "34",
    tag: "Popular",
    image: require("@/assets/images/services/ceramic.webp"),
  },
  {
    id: "pop_4",
    title: "Wax Rubbing & Buffing",
    subtitle: "Scratch Repair & Paint Gloss Restore",
    price: 1400,
    rating: "4.8",
    reviews: "75",
    tag: "Popular",
    image: require("@/assets/images/services/detailing.webp"),
  },
];

export interface DisplayReview {
  id: string;
  name: string;
  rating: number;
  review: string;
  serviceName?: string;
  date?: string;
}

export default function HomeScreen() {
  const [address, setAddress] = useState("Fetching location...");
  const [reviewsList, setReviewsList] = useState<DisplayReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [isAllReviewsModalOpen, setIsAllReviewsModalOpen] = useState(false);
  const router = useRouter();

  const { user } = useUser();
  const { addService } = useBookingStore();

  const isFetchingRef = useRef(false);

  const fetchLiveReviews = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      setLoadingReviews(true);
      const { data, error } = await supabase
        .from("reviews")
        .select("id, rating, comment, user_name, service_name, created_at")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const mappedReviews: DisplayReview[] = data.map((item: any) => ({
          id: item.id,
          name: item.user_name || "Verified Customer",
          rating: Number(item.rating) || 5,
          review: item.comment || "Service was prompt, clean, and top quality!",
          serviceName: item.service_name || "Car Wash",
          date: item.created_at ? new Date(item.created_at).toLocaleDateString() : "",
        }));
        setReviewsList(mappedReviews);
      }
    } catch (err) {
      console.log("❌ [Reviews] Fetch Error:", err);
    } finally {
      setLoadingReviews(false);
      isFetchingRef.current = false;
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLiveReviews();
    }, [fetchLiveReviews]),
  );

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
                <Ionicons name="location" size={11} color="#EF4444" /> Current Location
              </Text>
              <Text style={styles.locationText}>
                {address}{" "}
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
          <Text style={styles.greetingTitle}>Hello, {user?.firstName || "Guest"} 👋</Text>
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
          {POPULAR_SERVICES.map((item) => (
            <ServiceCard
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              price={`₹${item.price}`}
              rating={item.rating}
              reviews={item.reviews}
              tag={item.tag}
              image={item.image}
              style={{ marginRight: 16 }}
              onAddPress={() => {
                addService({
                  id: item.id,
                  title: item.title,
                  price: item.price,
                });
                router.push("/booking/step1-selection" as any);
              }}
            />
          ))}
        </ScrollView>

        {/* PREMIUM MEMBERSHIP BANNER */}
        <MembershipBanner />

        {/* CUSTOMER REVIEWS */}
        <SectionTitle title="Customer Reviews" onPress={() => setIsAllReviewsModalOpen(true)} />

        {loadingReviews && reviewsList.length === 0 ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="small" color={Colors.primary || "#2563EB"} />
          </View>
        ) : reviewsList.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {reviewsList.slice(0, 5).map((item) => (
              <ReviewCard
                key={item.id}
                name={item.name}
                rating={item.rating}
                review={item.review}
                serviceName={item.serviceName}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyReviewBox}>
            <Ionicons name="chatbubbles-outline" size={24} color="#94A3B8" />
            <Text style={styles.emptyReviewText}>
              No customer reviews yet. Book a service and be the first to review!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ALL REVIEWS FULL MODAL */}
      <Modal
        visible={isAllReviewsModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsAllReviewsModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsAllReviewsModalOpen(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>All Customer Reviews</Text>
                  <Text style={styles.modalSub}>{reviewsList.length} verified ratings</Text>
                </View>
                <TouchableOpacity onPress={() => setIsAllReviewsModalOpen(false)}>
                  <Ionicons name="close-circle" size={26} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {reviewsList.length === 0 ? (
                <View style={{ padding: 40, alignItems: "center" }}>
                  <Text style={{ color: "#64748B" }}>No reviews available.</Text>
                </View>
              ) : (
                <FlatList
                  data={reviewsList}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  renderItem={({ item }) => (
                    <View style={styles.modalReviewCard}>
                      <View style={styles.reviewCardHeader}>
                        <View style={styles.avatarCircle}>
                          <Ionicons name="person" size={18} color="#64748B" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={styles.reviewerName}>{item.name}</Text>
                          <Text style={styles.serviceTag}>
                            {item.serviceName} • {item.date}
                          </Text>
                        </View>
                        <View style={styles.starRow}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Ionicons
                              key={i}
                              name="star"
                              size={12}
                              color={i < item.rating ? "#F59E0B" : "#CBD5E1"}
                            />
                          ))}
                        </View>
                      </View>
                      <Text style={styles.reviewBody}>{item.review}</Text>
                    </View>
                  )}
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
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
  greetingTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 6,
  },
  greetingSub: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
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
  centerBox: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyReviewBox: {
    marginHorizontal: 16,
    padding: 20,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 6,
  },
  emptyReviewText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#0F172A" },
  modalSub: { fontSize: 12, color: "#64748B", marginTop: 2 },
  modalReviewCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  reviewCardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  reviewerName: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  serviceTag: { fontSize: 11, color: "#64748B", marginTop: 2 },
  starRow: { flexDirection: "row", gap: 2 },
  reviewBody: { fontSize: 13, color: "#334155", lineHeight: 18 },
});
