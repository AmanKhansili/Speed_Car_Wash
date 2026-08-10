import React, { createContext, useContext, useState, useEffect } from "react";
import { savePendingBooking, getPendingBooking } from "@/utils/bookingStorage";

interface BookingData {
  serviceId?: string;
  serviceName?: string;
  date?: string;
  serviceType?: "pickup" | "walkin";
  address?: string;
  addressText?: string;
  [key: string]: any;
}

interface BookingContextType {
  bookingData: BookingData;
  updateBooking: (data: Partial<BookingData>) => void;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookingData, setBookingData] = useState<BookingData>({});

  // App open hone par pehle se saved booking load karein (if any)
  useEffect(() => {
    const loadStoredData = async () => {
      const storedData = await getPendingBooking();
      if (storedData) {
        setBookingData(storedData);
      }
    };
    loadStoredData();
  }, []);

  // Jab bhi state update ho, AsyncStorage mein bhi persist karein
  const updateBooking = (newData: Partial<BookingData>) => {
    setBookingData((prev) => {
      const updated = { ...prev, ...newData };
      savePendingBooking(updated); // Sync to Local Memory
      return updated;
    });
  };

  const resetBooking = () => {
    setBookingData({});
  };

  return (
    <BookingContext.Provider value={{ bookingData, updateBooking, resetBooking }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};