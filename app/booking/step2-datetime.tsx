import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useBooking } from "@/context/BookingContext";

// AAPKA DATE TIME COMPONENT
import DateTimeSelector from "@/components/booking/DateTimeSelector";
import Colors from "@/constants/colors";

export default function Step2DateTimeScreen() {
  const router = useRouter();
  const { bookingData, updateBooking } = useBooking();

  const [selectedDate, setSelectedDate] = useState(bookingData.date || "");
  const [selectedTime, setSelectedTime] = useState(bookingData.time || "");

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert("Selection Required", "Please select a date and a time slot.");
      return;
    }

    updateBooking({ date: selectedDate, time: selectedTime });
    router.push("/booking/step3-location");
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* AAPKA DATE TIME COMPONENT */}
        <DateTimeSelector
          selectedDate={selectedDate}
          selectedTimeSlot={selectedTime}
          onSelectDate={setSelectedDate}
          onSelectTimeSlot={setSelectedTime}
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.btnText}>Continue to Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  scrollContent: { paddingBottom: 100 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderColor: Colors.border || "#E5E7EB",
  },
  continueBtn: {
    backgroundColor: Colors.primary || "#2563EB",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});