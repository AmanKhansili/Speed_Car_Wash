import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Storage Key Name
const PENDING_BOOKING_KEY = "@pending_booking_data";

// 1. Booking Data Type Definition
export interface BookingData {
  vehicleId?: string;
  vehicleName?: string;
  serviceId?: string;
  serviceTitle?: string;
  servicePrice?: number | string;
  date?: string;
  serviceType?: "pickup" | "walkin";
  address?: string;
  addressText?: string;
  phone?: string;
  [key: string]: any;
}

// 2. Context Type Interface
interface BookingContextType {
  bookingData: BookingData;
  updateBooking: (data: Partial<BookingData>) => void;
  resetBooking: () => void;
  isLoading: boolean;
}

// 3. Create Context
const BookingContext = createContext<BookingContextType | undefined>(undefined);

// 4. Booking Provider Component
export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [bookingData, setBookingData] = useState<BookingData>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // App startup par AsyncStorage se existing booking load karein
  useEffect(() => {
    const loadStoredBookingData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(PENDING_BOOKING_KEY);
        if (jsonValue != null) {
          setBookingData(JSON.parse(jsonValue));
        }
      } catch (error) {
        console.error("Failed to load booking data from AsyncStorage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredBookingData();
  }, []);

  // Context State update karne aur AsyncStorage me save karne ka method
  const updateBooking = async (newData: Partial<BookingData>) => {
    try {
      const updatedData = { ...bookingData, ...newData };
      setBookingData(updatedData);

      // Mobile ki memory (AsyncStorage) me store kar dein
      const jsonValue = JSON.stringify(updatedData);
      await AsyncStorage.setItem(PENDING_BOOKING_KEY, jsonValue);
    } catch (error) {
      console.error("Failed to save booking data to AsyncStorage:", error);
    }
  };

  // Booking confirm ya clear hone par data erase karne ka method
  const resetBooking = async () => {
    try {
      setBookingData({});
      await AsyncStorage.removeItem(PENDING_BOOKING_KEY);
    } catch (error) {
      console.error("Failed to clear booking data from AsyncStorage:", error);
    }
  };

  return (
    <BookingContext.Provider
      value={{ bookingData, updateBooking, resetBooking, isLoading }}
    >
      {children}
    </BookingContext.Provider>
  );
};

// 5. Custom Hook to access Booking Context
export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};