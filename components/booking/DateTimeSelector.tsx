import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

interface DateTimeSelectorProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
}

// 🟢 Timezone-safe Helper: Date Object -> YYYY-MM-DD
const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 🟢 Timezone-safe Helper: YYYY-MM-DD -> Local Date Object
const parseLocalDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

// Next 14 days calendar dates generator
const generateCalendarDates = () => {
  const dates = [];
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const today = new Date();

  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);

    const dayName = daysOfWeek[d.getDay()];
    const dateNum = d.getDate();
    const monthName = months[d.getMonth()];
    const fullDateString = formatLocalDate(d); // ✅ Timezone Safe

    dates.push({
      dayName: i === 0 ? "Today" : dayName,
      dateNum,
      monthName,
      fullDate: fullDateString,
    });
  }

  return dates;
};

export default function DateTimeSelector({
  selectedDate,
  onSelectDate,
}: DateTimeSelectorProps) {
  const calendarDates = generateCalendarDates();
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Date Change Handler
  const handleNativeDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    
    if (event.type !== "dismissed" && date) {
      const formattedDate = formatLocalDate(date); // ✅ Timezone Safe
      onSelectDate(formattedDate);
    }
  };

  return (
    <View style={styles.container}>
      {/* Calendar Header with Calendar Icon Trigger */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>📅 Select Date</Text>

        {/* Custom Date Selector Button */}
        <TouchableOpacity
          style={styles.calendarPickerBtn}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={18} color={Colors.primary || "#2563EB"} />
          <Text style={styles.calendarPickerText}>Custom Date</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Date Calendar Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.calendarContainer}
      >
        {calendarDates.map((item) => {
          const isSelected = item.fullDate === selectedDate;

          return (
            <TouchableOpacity
              key={item.fullDate}
              activeOpacity={0.8}
              style={[
                styles.dateCard,
                isSelected && styles.selectedDateCard,
              ]}
              onPress={() => onSelectDate(item.fullDate)}
            >
              <Text style={[styles.dayText, isSelected && styles.selectedText]}>
                {item.dayName}
              </Text>
              <Text style={[styles.dateNumText, isSelected && styles.selectedText]}>
                {item.dateNum}
              </Text>
              <Text style={[styles.monthText, isSelected && styles.selectedText]}>
                {item.monthName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Native Pop-up Calendar Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate ? parseLocalDate(selectedDate) : new Date()} // ✅ Safe Parsing
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          minimumDate={new Date()}
          onChange={handleNativeDateChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.secondary || "#111827",
  },
  calendarPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  calendarPickerText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary || "#2563EB",
  },
  calendarContainer: {
    gap: 10,
    paddingRight: 16,
  },
  dateCard: {
    width: 68,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border || "#E5E7EB",
    backgroundColor: Colors.surface || "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDateCard: {
    borderColor: Colors.primary || "#2563EB",
    backgroundColor: Colors.primary || "#2563EB",
    elevation: 3,
    shadowColor: Colors.primary || "#2563EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  dayText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary || "#6B7280",
    marginBottom: 2,
  },
  dateNumText: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text || "#111827",
  },
  monthText: {
    fontSize: 11,
    fontWeight: "500",
    color: Colors.textSecondary || "#6B7280",
    marginTop: 2,
  },
  selectedText: {
    color: "#FFFFFF",
  },
});