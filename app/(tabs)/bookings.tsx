import { View, StyleSheet, ScrollView } from "react-native";
import SectionHeader from "@/components/common/SectionHeader";
import BookingTabs  from "@/components/booking/BookingTab";
import { useUser } from "@clerk/expo";
import AuthGate from "@/components/auth/AuthGate";

export default function BookingsScreen() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return null;
   
  if (!isSignedIn) return <AuthGate />;

  return (
    <View style={styles.container}>
      <SectionHeader title="Booking" />

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
    paddingBottom: 20, 
  },
});