import BookingTabs from "@/components/booking/BookingTab";
import SectionHeader from "@/components/common/SectionHeader";
import { StyleSheet, View } from "react-native";

export default function BookingsScreen() {
  return (
    <View style={styles.container}>
      <SectionHeader title="Booking" />
      <BookingTabs />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
});
