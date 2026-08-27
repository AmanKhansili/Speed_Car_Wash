import RatingModal from "@/components/booking/RatingModal";
import Colors from "@/constants/colors";
import { createClerkSupabaseClient } from "@/utils/supabase";
import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ServiceCheckScreen() {
  const router = useRouter();
  const { bookingId, type } = useLocalSearchParams<{ bookingId: string; type: string }>();
  const { userId, getToken } = useAuth();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const clerkSupabase = createClerkSupabaseClient(getToken);
      const { data, error } = await clerkSupabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (error) throw error;
      setBooking(data);

      // Agar review_request type hai, seedha RatingModal khol do
      if (type === "review_request") {
        setShowRatingModal(true);
      }
    } catch (err) {
      console.error("Failed to fetch booking:", err);
      Alert.alert("Error", "Could not load booking details.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (completed: boolean) => {
    if (!booking) return;
    setSubmitting(true);
    try {
      const clerkSupabase = createClerkSupabaseClient(getToken);

      if (completed) {
        const { error } = await clerkSupabase
          .from("bookings")
          .update({ status: "Completed" })
          .eq("id", booking.id);

        if (error) throw error;

        setBooking({ ...booking, status: "Completed" });
        setShowRatingModal(true);
      } else {
        // Status pending hi rehne dena hai, koi update nahi
        Alert.alert("Got it", "We'll check back with you again.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (err) {
      Alert.alert("Error", "Could not update booking status.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!booking || !userId) return;
    try {
      const clerkSupabase = createClerkSupabaseClient(getToken);

      const { data: profileData } = await clerkSupabase
        .from("profiles")
        .select("name")
        .eq("clerk_user_id", userId)
        .maybeSingle();

      const authenticName =
        profileData?.name?.trim() ||
        user?.fullName ||
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
        "Verified Customer";

      const { error } = await clerkSupabase.from("reviews").insert({
        booking_id: booking.id,
        clerk_user_id: userId,
        user_name: authenticName,
        rating,
        comment: comment || null,
        service_name: booking.service_name || "Car Wash Service",
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      Alert.alert("Review Submitted! ⭐", "Thank you for your feedback!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert("Submission Failed", "Could not save your review right now.");
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary || "#2563EB"} />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.centered}>
        <Text>Booking not found.</Text>
      </View>
    );
  }

  // Status check flow (Yes/No)
  if (type === "status_check" && booking.status !== "Completed") {
    return (
      <View style={styles.centered}>
        <View style={styles.card}>
          <Ionicons name="help-circle-outline" size={48} color={Colors.primary || "#2563EB"} />
          <Text style={styles.title}>Was your service completed today?</Text>
          <Text style={styles.subtitle}>{booking.service_name || "Car Wash Service"}</Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.noBtn}
              onPress={() => handleStatusUpdate(false)}
              disabled={submitting}
            >
              <Text style={styles.noBtnText}>No</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.yesBtn}
              onPress={() => handleStatusUpdate(true)}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.yesBtnText}>Yes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Review flow (RatingModal)
  return (
    <View style={styles.centered}>
      <RatingModal
        visible={showRatingModal}
        serviceTitle={booking.service_name || "Car Wash Service"}
        onClose={() => router.back()}
        onSubmit={handleSubmitReview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    elevation: 3,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#0F172A", marginTop: 12, textAlign: "center" },
  subtitle: { fontSize: 13, color: "#64748B", marginTop: 4, textAlign: "center" },
  actions: { flexDirection: "row", gap: 12, width: "100%", marginTop: 20 },
  noBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  noBtnText: { color: "#64748B", fontWeight: "600", fontSize: 14 },
  yesBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.primary || "#2563EB",
    alignItems: "center",
  },
  yesBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
});