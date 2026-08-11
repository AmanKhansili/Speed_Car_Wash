import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { LocalUserData, UserLocation, Vehicle } from "@/types/user";
import {
  getLocalUserData,
  savePhoneLocally,
  saveLocationLocally,
  saveVehicleLocally,
  removeVehicleLocally,
  setSelectedVehicleLocally,
} from "@/utils/userStorage";

// 1. Context Type Interface
interface UserContextType {
  userData: LocalUserData;
  updatePhone: (phone: string) => Promise<void>;
  updateLocation: (loc: UserLocation) => Promise<void>;
  updateVehicle: (veh: Vehicle) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  selectVehicle: (id: string) => Promise<void>;
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
  const [userData, setUserData] = useState<LocalUserData>({
    mobileNumber: "",
    location: null,
    vehicles: [],
    selectedVehicleId: null,
    lastUpdated: Date.now(),
  });

  // App load par Local Storage se state fill karein
  useEffect(() => {
    const initData = async () => {
      const data = await getLocalUserData();
      setUserData(data);
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
    setUserData(updated);
    await syncWithDB();
  };

  const updateLocation = async (location: UserLocation) => {
    const updated = await saveLocationLocally(location);
    setUserData(updated);
    await syncWithDB();
  };

  const updateVehicle = async (vehicle: Vehicle) => {
    const updated = await saveVehicleLocally(vehicle);
    setUserData(updated);
    await syncWithDB();
  };

  const deleteVehicle = async (id: string) => {
    if (removeVehicleLocally) {
      const updated = await removeVehicleLocally(id);
      setUserData(updated);
      await syncWithDB();
    } else {
      // Fallback in-memory update agar storage helper custom na ho
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
      setUserData(updated);
    } else {
      // Fallback in-memory update
      setUserData((prev) => ({
        ...prev,
        selectedVehicleId: id,
      }));
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
        syncWithDB,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};


export default function useUser(): UserContextType{
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};