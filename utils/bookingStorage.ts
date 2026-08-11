import AsyncStorage from "@react-native-async-storage/async-storage";

const PENDING_BOOKING_KEY = "@pending_booking_data";

// 1. Pending Booking ko AsyncStorage mein save karein
export const savePendingBooking = async (data: object) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(PENDING_BOOKING_KEY, jsonValue);
  } catch (e) {
    console.error("Error saving booking data to AsyncStorage:", e);
  }
};

// 2. Pending Booking ko AsyncStorage se fetch karein
export const getPendingBooking = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(PENDING_BOOKING_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error("Error reading booking data from AsyncStorage:", e);
    return null;
  }
};

// 3. Login ke baad DB mein save hone par ise clear karein
export const clearPendingBooking = async () => {
  try {
    await AsyncStorage.removeItem(PENDING_BOOKING_KEY);
  } catch (e) {
    console.error("Error clearing pending booking:", e);
  }
};