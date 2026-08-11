import { Stack } from "expo-router";

export default function BookingLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#FFF" },
        headerTintColor: "#000",
        headerTitleStyle: { fontWeight: "bold" },
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen name="step1-selection" options={{ title: "Select Vehicle & Service" }} />
      <Stack.Screen name="step2-datetime" options={{ title: "Select Your Preference" }} />
      <Stack.Screen name="summary" options={{ title: "Booking Summary" }} />
    </Stack>
  );
}