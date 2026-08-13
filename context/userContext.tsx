import { LocalUserData, UserLocation, Vehicle } from "@/types/user";
import {
  getLocalUserData,
  removeVehicleLocally,
  saveLocationLocally,
  savePhoneLocally,
  saveVehicleLocally,
  setSelectedVehicleLocally,
} from "@/utils/userStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

// 1. Context Type Interface (Added bookings support)
interface UserContextType {
  userData: LocalUserData & { bookings?: any[] };
  updatePhone: (phone: string) => Promise<void>;
  updateLocation: (loc: UserLocation) => Promise<void>;
  updateVehicle: (veh: Vehicle) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  selectVehicle: (id: string) => Promise<void>;
  updateBookings: (bookings: any[]) => Promise<void>;
  syncWithDB: () => Promise<void>;
}

// 2. Props Interface
interface UserProviderProps {
  children: ReactNode;
  userId?: string;
}

// 3. Initial Context
const UserContext = createContext<UserContextType | undefined>(undefined);

// 4. Provider Component
export const UserProvider = ({ children, userId }: UserProviderProps) => {
  const [userData, setUserData] = useState<LocalUserData & { bookings?: any[] }>({
    mobileNumber: "",
    location: null,
    vehicles: [],
    selectedVehicleId: null,
    lastUpdated: Date.now(),
    bookings: [],
  });

  // App load par Local Storage se state aur bookings fill karein
  useEffect(() => {
    const initData = async () => {
      const data = await getLocalUserData();
      const storedBookings = await AsyncStorage.getItem("user_bookings");
      const parsedBookings = storedBookings ? JSON.parse(storedBookings) : [];

      setUserData({
        ...data,
        bookings: parsedBookings,
      });
    };
    initData();
  }, []);

  // Backend Sync Logic
  const syncWithDB = async () => {
    if (!userId) return;

    try {
      await fetch("https://your-api-domain.com/api/user/sync-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          mobileNumber: userData.mobileNumber,
          location: userData.location,
          vehicles: userData.vehicles,
        }),
      });
    } catch (error) {
      console.error("DB Sync failed, kept in local storage:", error);
    }
  };

  // Handlers
  const updatePhone = async (phone: string) => {
    const updated = await savePhoneLocally(phone);
    setUserData((prev) => ({ ...prev, ...updated }));
    await syncWithDB();
  };

  const updateLocation = async (location: UserLocation) => {
    const updated = await saveLocationLocally(location);
    setUserData((prev) => ({ ...prev, ...updated }));
    await syncWithDB();
  };

  const updateVehicle = async (vehicle: Vehicle) => {
    const updated = await saveVehicleLocally(vehicle);
    setUserData((prev) => ({ ...prev, ...updated }));
    await syncWithDB();
  };

  const deleteVehicle = async (id: string) => {
    if (removeVehicleLocally) {
      const updated = await removeVehicleLocally(id);
      setUserData((prev) => ({ ...prev, ...updated }));
      await syncWithDB();
    } else {
      const updatedVehicles = userData.vehicles.filter((v) => v.id !== id);
      setUserData((prev) => ({
        ...prev,
        vehicles: updatedVehicles,
        selectedVehicleId: prev.selectedVehicleId === id ? null : prev.selectedVehicleId,
      }));
    }
  };

  const selectVehicle = async (id: string) => {
    if (setSelectedVehicleLocally) {
      const updated = await setSelectedVehicleLocally(id);
      setUserData((prev) => ({ ...prev, ...updated }));
    } else {
      setUserData((prev) => ({
        ...prev,
        selectedVehicleId: id,
      }));
    }
  };

  // 🚀 NAYA: Bookings update aur save karne ka handler
  const updateBookings = async (newBookings: any[]) => {
    try {
      await AsyncStorage.setItem("user_bookings", JSON.stringify(newBookings));
      setUserData((prev) => ({
        ...prev,
        bookings: newBookings,
      }));
    } catch (error) {
      console.error("Failed to save bookings:", error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        userData,
        updatePhone,
        updateLocation,
        updateVehicle,
        deleteVehicle,
        selectVehicle,
        updateBookings,
        syncWithDB,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
