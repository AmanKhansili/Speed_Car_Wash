//* eslint-disable import/no-named-as-default */
import BookingTabs from "@/components/booking/BookingTab";
import SectionHeader from "@/components/common/SectionHeader";
import { useUser } from "@clerk/expo";
import AuthGate from "@/components/auth/AuthGate";
import { StyleSheet, View } from "react-native";

export default function BookingsScreen() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return null;
   
  if (!isSignedIn) return <AuthGate />;

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
