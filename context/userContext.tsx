import { LocalUserData, UserLocation, Vehicle } from "@/types/user";
import {
  getLocalUserData,
  removeVehicleLocally,
  saveLocationLocally,
  savePhoneLocally,
  saveVehicleLocally,
  setSelectedVehicleLocally,
  addVehicleWithSync,
} from "@/utils/userStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

// 1. Context Type Interface (Added bookings support)
interface UserContextType {
  userData: LocalUserData & { bookings?: any[] };
  updatePhone: (phone: string) => Promise<void>;
  updateLocation: (loc: UserLocation) => Promise<void>;
  addVehicle: (veh: NewVehicle) => Promise<Vehicle>;
  updateVehicle: (veh: Vehicle) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  selectVehicle: (id: string) => Promise<void>;
  updateBookings: (bookings: any[]) => Promise<void>;
  syncWithDB: () => Promise<void>;
}

interface UserProviderProps {
  children: ReactNode;
  userId?: string | null;
  getToken?: () => Promise<string | null>;
}

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
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Clerk session token wala Supabase client — memoized, taaki reuse ho
  const clerkSupabase = useMemo(() => {
    if (!getToken) return null;
    return createClerkSupabaseClient(getToken);
  }, [getToken]);

  const syncWithDB = useCallback(async () => {
    if (!userId || !clerkSupabase) return;

    try {
      const { data: dbVehicles, error } = await clerkSupabase
        .from("vehicles")
        .select("*")
        .eq("clerk_user_id", userId);

      if (error) throw error;

      if (dbVehicles && dbVehicles.length > 0) {
        const formattedVehicles: Vehicle[] = dbVehicles.map((item) => ({
          id: item.id,
          brand: item.make || item.brand || "Vehicle",
          model: item.model || "",
          category: item.vehicle_type || item.category || "Car",
          registrationNumber: item.registration_number || "",
        }));

        const currentLocal = await getLocalUserData();
        const updatedLocalData: LocalUserData = {
          ...currentLocal,
          vehicles: formattedVehicles,
          selectedVehicleId: currentLocal.selectedVehicleId || formattedVehicles[0].id,
          lastUpdated: Date.now(),
        };

        if (updatedLocalData.location) {
          await saveLocationLocally(updatedLocalData.location);
        }
        setUserData(updatedLocalData);
      }
    } catch (error) {
      console.warn("[UserContext] DB Sync failed, using cached storage:", error);
    }
  }, [userId, clerkSupabase]);

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

  useEffect(() => {
    if (userId && isLoaded && clerkSupabase) {
      syncWithDB();
    }
  }, [userId, isLoaded, clerkSupabase, syncWithDB]);

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
        isLoaded,
        updatePhone,
        updateLocation,
        addVehicle,
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
