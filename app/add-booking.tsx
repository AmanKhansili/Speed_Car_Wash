import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import Colors from "@/constants/colors";
import SectionHeader from "@/components/common/SectionHeader";
import VehicleSelector from "@/components/booking/VehicleSelector";
import DateTimeSelector from "@/components/booking/DateTimeSelector";
import AddressSelector from "@/components/booking/AddressSelector";
import ServiceSelector from "@/components/booking/ServiceSelector";
import PaymentSummary from "@/components/booking/PaymentSummary";



export default function AddBookingScreen() {
  // Form State
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("v1");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("s1");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("09:00 AM");
  const [selectedAddressId, setSelectedAddressId] = useState<string>("a1");

  const handleConfirmBooking = () => {
    const bookingPayload = {
      vehicleId: selectedVehicleId,
      serviceId: selectedServiceId,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      addressId: selectedAddressId,
    };
    console.log("Submitting Booking:", bookingPayload);
    // Navigate or trigger API action
  };

  const handleAddNewVehicle = () => {
    console.log("Add New Vehicle pressed");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <SectionHeader title="Add Booking" />

        {/* Main Scrollable Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <VehicleSelector
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={(id) => setSelectedVehicleId(id)}
            onAddNewVehicle={handleAddNewVehicle}
          />

          {/* SECTION 2: SERVICE SELECTION */}
          <ServiceSelector
            selectedServiceId={selectedServiceId}
            onSelectService={(id) => setSelectedServiceId(id)}
          />

          <DateTimeSelector
            selectedDate={selectedDate}
            selectedTimeSlot={selectedTimeSlot}
            onSelectDate={(date) => setSelectedDate(date)}
            onSelectTimeSlot={(time) => setSelectedTimeSlot(time)}
          />

          <AddressSelector
            selectedAddressId={selectedAddressId}
            onSelectAddress={(id) => setSelectedAddressId(id)}
            onAddNewAddress={() => console.log("Open Add Address Modal")}
          />

          <PaymentSummary />
        </ScrollView>

        {/* Sticky Bottom CTA */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.submitBtn}
            activeOpacity={0.85}
            onPress={handleConfirmBooking}
          >
            <Text style={styles.submitBtnText}>Confirm Booking</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  container: {
    flex: 1,
    gap: 1,
    backgroundColor: Colors.background,
  },

  /* Scroll Area */
  scrollContent: {
    paddingVertical: 16,
    paddingBottom: 30,
  },

  /* Sticky Footer */
 footer: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
