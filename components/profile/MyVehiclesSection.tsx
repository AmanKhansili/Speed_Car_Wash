import Colors from "@/constants/colors";
import { useBookingStore } from "@/store/bookingStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface MyVehiclesSectionProps {
  savedCards?: any[];
  onAddCarPress: () => void;
  onDeleteCard?: (cardId: string) => Promise<void>;
}

export default function MyVehiclesSection({
  savedCards = [],
  onAddCarPress,
  onDeleteCard,
}: MyVehiclesSectionProps) {
  const router = useRouter();
  const { setCartServices } = useBookingStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const hasCards = savedCards && savedCards.length > 0;

  const handleQuickBookNow = (card: any) => {
    const servicesList = Array.isArray(card.services_booked)
      ? card.services_booked
      : card.services_booked?.items || [];

    if (servicesList.length > 0) {
      setCartServices(servicesList);
    }

    const preCoupon = card.services_booked?.coupon || "";
    const preDiscount = card.services_booked?.discount_amount
      ? String(card.services_booked.discount_amount)
      : "";

    router.push({
      pathname: "/booking/step2-datetime" as any,
      params: {
        vehicleId: card.services_booked?.vehicle?.id || card.vehicle_id,
        serviceType: card.service_type || "pickup",
        primaryPhone: card.primary_phone || card.phone || "",
        altPhone: card.alt_phone || "",
        addressText: card.address || "",
        preAppliedCoupon: preCoupon,
        preDiscount: preDiscount,
      },
    });
  };

  const confirmDeleteCard = (cardId: string, serviceName: string) => {
    Alert.alert(
      "Delete Saved Card",
      `Are you sure you want to remove "${serviceName}" from Quick Actions?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!onDeleteCard) return;
            setDeletingId(cardId);
            try {
              await onDeleteCard(cardId);
            } catch (err: any) {
              Alert.alert("Error", err?.message || "Could not delete card.");
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.7} onPress={onAddCarPress}>
          <Ionicons name="add" size={16} color={Colors.primary || "#2563EB"} />
          <Text style={styles.addBtnText}>Add Car</Text>
        </TouchableOpacity>
      </View>

      {!hasCards ? (
        <TouchableOpacity style={styles.emptyCard} activeOpacity={0.8} onPress={onAddCarPress}>
          <Ionicons name="flash-outline" size={32} color={Colors.primary || "#2563EB"} />
          <Text style={styles.emptyTitle}>No quick-action cards saved</Text>
          <Text style={styles.emptySubText}>Tap here to select vehicle and services</Text>
        </TouchableOpacity>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {savedCards.map((card) => {
            const serviceName =
              card.service_name ||
              (Array.isArray(card.services_booked)
                ? card.services_booked[0]?.title
                : card.services_booked?.items?.[0]?.title) ||
              "Car Wash Service";

            const carName =
              card.services_booked?.vehicle?.name ||
              card.vehicle_name ||
              "Saved Vehicle";

            const serviceType = card.service_type === "pickup" ? "Pickup" : "Walk-in";
            const contactPhone = card.primary_phone || card.phone || "N/A";
            const displayAddress =
              card.address ||
              (card.service_type === "pickup" ? "Saved Pickup Location" : "Service Hub");
            const price = card.total_amount ?? card.amount ?? 0;
            const isDeleting = deletingId === card.id;

            return (
              <View key={card.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.headerTitleRow}>
                    <Ionicons name="flash" size={18} color="#F59E0B" />
                    <Text style={styles.serviceName} numberOfLines={1}>
                      {serviceName}
                    </Text>
                  </View>

                  <View style={styles.headerRightActions}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{serviceType}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.deleteCardBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      onPress={() => confirmDeleteCard(card.id, serviceName)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <ActivityIndicator size="small" color="#EF4444" />
                      ) : (
                        <Ionicons name="trash-outline" size={17} color="#9CA3AF" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.carTag}>
                  <Ionicons name="car-sport" size={14} color={Colors.primary || "#2563EB"} />
                  <Text style={styles.carNameText} numberOfLines={1}>
                    {carName}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <Ionicons name="call-outline" size={15} color="#6B7280" />
                    <Text style={styles.detailText}>{contactPhone}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={15} color="#6B7280" />
                    <Text style={styles.detailText} numberOfLines={2}>
                      {displayAddress}
                    </Text>
                  </View>
                </View>

                <View style={styles.priceRow}>
                  <View>
                    <Text style={styles.priceLabel}>Estimated Cost</Text>
                    <Text style={styles.priceValue}>₹{price}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.bookNowBtn}
                    activeOpacity={0.8}
                    onPress={() => handleQuickBookNow(card)}
                  >
                    <Text style={styles.bookNowText}>Book Now</Text>
                    <Ionicons name="arrow-forward" size={15} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f0ff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary || "#2563EB",
    marginLeft: 2,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 14, fontWeight: "600", color: "#0F172A", marginTop: 8 },
  emptySubText: { fontSize: 12, color: "#64748B", marginTop: 2 },
  scrollContent: { gap: 12, paddingBottom: 6 },
  card: {
    width: 285,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  serviceName: { fontSize: 15, fontWeight: "800", color: "#1F2937", flex: 1 },
  headerRightActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  badge: { backgroundColor: "#EFF6FF", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: "700", color: Colors.primary || "#2563EB" },
  deleteCardBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: "#F8FAFC",
  },
  carTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F1F5F9",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  carNameText: { fontSize: 12, fontWeight: "700", color: "#334155" },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 10 },
  detailsContainer: { gap: 8, marginBottom: 14 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailText: { fontSize: 13, color: "#4B5563", flex: 1 },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
  },
  priceLabel: { fontSize: 11, color: "#6B7280", fontWeight: "600" },
  priceValue: { fontSize: 17, fontWeight: "800", color: Colors.primary || "#2563EB" },
  bookNowBtn: {
    backgroundColor: Colors.primary || "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  bookNowText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
});