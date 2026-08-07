import { Stack } from "expo-router";
import { BookingProvider } from "@/context/BookingContext";

export default function BookingLayout() {
  return (
    <BookingProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#FFF" },
          headerTintColor: "#000",
          headerTitleStyle: { fontWeight: "bold" },
          headerBackTitle: "Back",
        }}
      >
        <Stack.Screen name="step1-selection" options={{ title: "Select Vehicle & Service" }} />
        <Stack.Screen name="step2-datetime" options={{ title: "Select Date & Time" }} />
        <Stack.Screen name="step3-location" options={{ title: "Select Location" }} />
        <Stack.Screen name="step4-summary" options={{ title: "Booking Summary" }} />
      </Stack>
    </BookingProvider>
  );
}