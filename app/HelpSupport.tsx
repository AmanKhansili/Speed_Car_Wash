import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import SectionHeader from "@/components/common/SectionHeader";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: "1",
    question: "How do I book a car wash service?",
    answer:
      "Go to the Home tab, select your vehicle, choose a service type and time slot, then confirm your booking. You'll get a confirmation once it's scheduled.",
  },
  {
    id: "2",
    question: "Can I reschedule or cancel a booking?",
    answer:
      "Yes. Open the booking from the Bookings tab and tap Reschedule or Cancel. Cancellations made at least 2 hours before the scheduled time are fully refundable.",
  },
  {
    id: "3",
    question: "What payment methods are accepted?",
    answer:
      "We accept UPI, credit/debit cards, and net banking through our secure payment partner. Cash on service is also available in select areas.",
  },
  {
    id: "4",
    question: "How long does a car wash typically take?",
    answer:
      "A standard wash takes 20-30 minutes. Detailed or full-service packages can take up to 60-90 minutes depending on your vehicle and package selected.",
  },
  {
    id: "5",
    question: "What if I'm not satisfied with the service?",
    answer:
      "Let us know within 24 hours via Help & Support or by rating the booking. We'll arrange a free re-wash or refund based on the issue.",
  },
  {
    id: "6",
    question: "How do I add or manage my vehicles?",
    answer:
      "Go to your Profile, scroll to My Vehicles, and tap Add Vehicle. You can edit or remove saved vehicles anytime from the same section.",
  },
];

const SUPPORT_PHONE = "+919876543210"; // TODO: replace with real support number
const SUPPORT_WHATSAPP = "919876543210"; // no + or spaces, for wa.me links
const SUPPORT_EMAIL = "support@yourcarwashapp.com"; // TODO: replace with real email

export default function HelpSupportScreen() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleCall = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE}`).catch(() =>
      Alert.alert("Error", "Could not open dialer.")
    );
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(
      "Hi, I need help with my car wash booking."
    )}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "WhatsApp is not installed on this device.")
    );
  };

  const handleEmail = () => {
    Linking.openURL(
      `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
        "Support Request"
      )}`
    ).catch(() => Alert.alert("Error", "Could not open email app."));
  };

  const contactOptions = [
    {
      id: "call",
      label: "Call Us",
      subtitle: "Mon-Sun, 9AM - 8PM",
      icon: "call-outline" as const,
      onPress: handleCall,
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      subtitle: "Quick replies",
      icon: "logo-whatsapp" as const,
      onPress: handleWhatsApp,
    },
    {
      id: "email",
      label: "Email Us",
      subtitle: "Reply within 24 hrs",
      icon: "mail-outline" as const,
      onPress: handleEmail,
    },
  ];

  return (
    <View style={styles.container}>

    <SectionHeader title="Help and Support" showSearchBar={false}/>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Contact Cards */}
        <Text style={styles.sectionTitle}>Get in touch</Text>
        <View style={styles.contactRow}>
          {contactOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.contactCard}
              activeOpacity={0.7}
              onPress={option.onPress}
            >
              <View style={styles.contactIconWrap}>
                <Ionicons
                  name={option.icon}
                  size={22}
                  color={Colors.primary || "#5D3FD3"}
                />
              </View>
              <Text style={styles.contactLabel}>{option.label}</Text>
              <Text style={styles.contactSubtitle} numberOfLines={1}>
                {option.subtitle}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick help</Text>
        <View style={styles.quickActionsList}>
          <TouchableOpacity
            style={styles.quickActionRow}
            activeOpacity={0.7}
            onPress={() => router.push("/(tabs)/bookings" as any)}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={Colors.textSecondary || "#6B7280"}
            />
            <Text style={styles.quickActionText}>Track my booking</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors.textLight || "#9CA3AF"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionRow}
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert(
                "Report an Issue",
                "Describe the issue and our team will get back to you shortly."
              )
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={Colors.textSecondary || "#6B7280"}
            />
            <Text style={styles.quickActionText}>Report an issue</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors.textLight || "#9CA3AF"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionRow}
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert(
                "Refund Status",
                "Refunds are processed within 5-7 business days to your original payment method."
              )
            }
          >
            <Ionicons
              name="cash-outline"
              size={20}
              color={Colors.textSecondary || "#6B7280"}
            />
            <Text style={styles.quickActionText}>Refund status</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors.textLight || "#9CA3AF"}
            />
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <Text style={styles.sectionTitle}>Frequently asked questions</Text>
        <View style={styles.faqList}>
          {FAQ_DATA.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.faqItem}
                activeOpacity={0.7}
                onPress={() => toggleFAQ(item.id)}
              >
                <View style={styles.faqQuestionRow}>
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={Colors.textSecondary || "#6B7280"}
                  />
                </View>
                {isExpanded && (
                  <Text style={styles.faqAnswer}>{item.answer}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.text || "#111827",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary || "#6B7280",
    marginTop: 20,
    marginBottom: 10,
  },
  contactRow: {
    flexDirection: "row",
    gap: 10,
  },
  contactCard: {
    flex: 1,
    backgroundColor: Colors.surface || "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border || "#F3F4F6",
  },
  contactIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight || "#F3F0FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text || "#111827",
  },
  contactSubtitle: {
    fontSize: 11,
    color: Colors.textLight || "#9CA3AF",
    marginTop: 2,
  },
  quickActionsList: {
    backgroundColor: Colors.surface || "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border || "#F3F4F6",
    overflow: "hidden",
  },
  quickActionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border || "#F3F4F6",
  },
  quickActionText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text || "#111827",
  },
  faqList: {
    backgroundColor: Colors.surface || "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border || "#F3F4F6",
    overflow: "hidden",
  },
  faqItem: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border || "#F3F4F6",
  },
  faqQuestionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text || "#111827",
  },
  faqAnswer: {
    fontSize: 13,
    color: Colors.textSecondary || "#6B7280",
    marginTop: 8,
    lineHeight: 19,
  },
});