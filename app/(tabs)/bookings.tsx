import { View, StyleSheet, ScrollView } from "react-native";
import SectionHeader from "@/components/common/SectionHeader";
import BookingTabs from "@/components/booking/BookingTab";

export default function BookingsScreen() {
  return (
    <View style={styles.container}>
      {/* Top Header */}
      <SectionHeader title="Booking" />

      {/* Main Scrollable Area */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <BookingTabs />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingBottom: 20, // Extra padding bottom ScrollView scroll smoothness ke liye
  },
});