import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import Colors from "@/constants/colors";

const getNextDays = (daysCount = 14) => {
  const days = [];
  const today = new Date();

  for (let i = 0; i < daysCount; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);

    const dayName = d
      .toLocaleDateString("en-US", { weekday: "short" })
      .toUpperCase();
    const dateNum = d.getDate().toString().padStart(2, "0");
    const fullDate = d.toISOString().split("T")[0];

    days.push({
      id: fullDate,
      dayName: i === 0 ? "TODAY" : dayName,
      dateNum,
      rawDate: d,
    });
  }
  return days;
};

// Time Slots Data
const TIME_SLOTS = [
  { id: "t1", time: "09:00 AM", isAvailable: true },
  { id: "t2", time: "10:30 AM", isAvailable: true },
  { id: "t3", time: "12:00 PM", isAvailable: false },
  { id: "t4", time: "02:00 PM", isAvailable: true },
  { id: "t5", time: "03:30 PM", isAvailable: true },
  { id: "t6", time: "05:00 PM", isAvailable: true },
  { id: "t7", time: "06:30 PM", isAvailable: true },
];

interface DateTimeSelectorProps {
  selectedDate: string; // YYYY-MM-DD
  selectedTimeSlot: string;
  onSelectDate: (date: string) => void;
  onSelectTimeSlot: (time: string) => void;
}

export default function DateTimeSelector({
  selectedDate,
  selectedTimeSlot,
  onSelectDate,
  onSelectTimeSlot,
}: DateTimeSelectorProps) {
  const dateList = getNextDays(14);
  const activeDate = selectedDate || dateList[0].id;

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Handle Native Calendar Selection
  const handleCalendarChange = (
    event: DateTimePickerEvent,
    date?: Date
  ) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) {
      setCalendarDate(date);
      const formattedDate = date.toISOString().split("T")[0];
      onSelectDate(formattedDate);
    }
  };

  // Display text for custom date button
  const getFormattedCustomDateText = () => {
    const isCustomDateInStrip = dateList.some((d) => d.id === activeDate);
    if (!isCustomDateInStrip && selectedDate) {
      return `Selected: ${selectedDate}`;
    }
    return "More Dates (Open Calendar)";
  };

  return (
    <View style={styles.container}>
      {/* SECTION HEADER */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Select Date & Time</Text>
      </View>

      {/* HORIZONTAL DATE STRIP */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateStripContent}
      >
        {dateList.map((item) => {
          const isSelected = item.id === activeDate;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              style={[
                styles.dateCard,
                isSelected && styles.selectedDateCard,
              ]}
              onPress={() => onSelectDate(item.id)}
            >
              <Text
                style={[
                  styles.dayNameText,
                  isSelected && styles.selectedDayNameText,
                ]}
              >
                {item.dayName}
              </Text>
              <Text
                style={[
                  styles.dateNumText,
                  isSelected && styles.selectedDateNumText,
                ]}
              >
                {item.dateNum}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* SMALL CALENDAR OPENER BUTTON BELOW DATES */}
      <View style={styles.calendarTriggerWrapper}>
        <TouchableOpacity
          style={styles.calendarTriggerBtn}
          activeOpacity={0.7}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons
            name="calendar-clear-outline"
            size={14}
            color={Colors.primary}
          />
          <Text style={styles.calendarTriggerText}>
            {getFormattedCustomDateText()}
          </Text>
          <Ionicons name="chevron-down" size={14} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* NATIVE DATE PICKER DIALOG */}
      {showDatePicker && (
        <DateTimePicker
          value={calendarDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={handleCalendarChange}
        />
      )}

      {/* TIME SLOT GRID */}
      <View style={styles.timeSection}>
        <View style={styles.timeHeader}>
          <Ionicons
            name="time-outline"
            size={16}
            color={Colors.textSecondary}
          />
          <Text style={styles.timeSubTitle}>Available Time Slots</Text>
        </View>

        <View style={styles.slotsGrid}>
          {TIME_SLOTS.map((slot) => {
            const isSelected = slot.time === selectedTimeSlot;
            const isDisabled = !slot.isAvailable;

            return (
              <TouchableOpacity
                key={slot.id}
                disabled={isDisabled}
                activeOpacity={0.8}
                style={[
                  styles.timeChip,
                  isSelected && styles.selectedTimeChip,
                  isDisabled && styles.disabledTimeChip,
                ]}
                onPress={() => onSelectTimeSlot(slot.time)}
              >
                <Text
                  style={[
                    styles.timeText,
                    isSelected && styles.selectedTimeText,
                    isDisabled && styles.disabledTimeText,
                  ]}
                >
                  {slot.time}
                </Text>

                {isDisabled && <Text style={styles.bookedTag}>Booked</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    marginTop: 30,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.secondary,
  },

  /* Date Strip */
  dateStripContent: {
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 4,
  },
  dateCard: {
    width: 62,
    height: 74,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  selectedDateCard: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 10,
  },
  dayNameText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  selectedDayNameText: {
    color: "#93C5FD",
  },
  dateNumText: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text,
  },
  selectedDateNumText: {
    color: "#FFFFFF",
  },

  /* Small Calendar Trigger Button */
  calendarTriggerWrapper: {
    paddingHorizontal: 16,
    marginTop: 10,
    alignItems: "flex-start",
  },
  calendarTriggerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  calendarTriggerText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
    
  },

  /* Time Slots Area */
  timeSection: {
    paddingHorizontal: 16,
    marginTop: 40,
  },
  timeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  timeSubTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    minWidth: "30%",
    flexGrow: 1,
  },
  selectedTimeChip: {
    borderColor: Colors.primary,
    backgroundColor: "#F0F5FF",
  },
  disabledTimeChip: {
    backgroundColor: "#F1F5F9",
    borderColor: "#E2E8F0",
    opacity: 0.7,
  },
  timeText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
  },
  selectedTimeText: {
    color: Colors.primary,
    fontWeight: "700",
  },
  disabledTimeText: {
    color: "#94A3B8",
    textDecorationLine: "line-through",
  },
  bookedTag: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.danger,
    marginTop: 2,
  },
});