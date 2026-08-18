import { LocalUserData, UserLocation, Vehicle, NewVehicle } from "@/types/user";
import { createClerkSupabaseClient } from "@/utils/supabase"; // ⚠️ apna actual path confirm karo — jahan bhi ye helper defined hai
import {
  getLocalUserData,
  removeVehicleLocally,
  saveLocationLocally,
  savePhoneLocally,
  saveVehicleLocally,
  setSelectedVehicleLocally,
  addVehicleWithSync,
  overwriteVehiclesLocally,
} from "@/utils/userStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";

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
export const UserProvider = ({
  children,
  userId,
  getToken,
}: UserProviderProps) => {
  const [userData, setUserData] = useState<
    LocalUserData & { bookings?: any[] }
  >({
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

      const formattedVehicles: Vehicle[] = (dbVehicles || []).map((item) => ({
        id: item.id,
        brand: item.make || item.brand || "Vehicle",
        model: item.model || "",
        category: item.vehicle_type || item.category || "Car",
        registrationNumber: item.registration_number || "",
      }));

      const currentLocal = await getLocalUserData();
      const stillHasSelected = formattedVehicles.some(
        (v) => v.id === currentLocal.selectedVehicleId,
      );
      const newSelectedId = stillHasSelected
        ? currentLocal.selectedVehicleId
        : formattedVehicles[0]?.id || null;

      // AsyncStorage ko hamesha DB ke latest data se overwrite karo — chahe list empty ho jaaye
      const updatedLocalData = await overwriteVehiclesLocally(
        formattedVehicles,
        newSelectedId,
      );
      setUserData((prev) => ({ ...prev, ...updatedLocalData }));
    } catch (error) {
      console.warn(
        "[UserContext] DB Sync failed, using cached storage:",
        error,
      );
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
      setIsLoaded(true);
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

  // 🚀 Vehicle add karke DB + local dono sync karta hai
  const addVehicle = async (veh: NewVehicle): Promise<Vehicle> => {
    if (!userId) {
      throw new Error(
        "addVehicle: userId is missing, user shayad logged in nahi hai",
      );
    }
    if (!clerkSupabase) {
      throw new Error(
        "addVehicle: clerkSupabase client ready nahi hai (getToken missing?)",
      );
    }

    const result = await addVehicleWithSync(veh, userId, clerkSupabase);
    const newVehicle = result.vehicle;

    setUserData((prev) => ({
      ...prev,
      vehicles: [...prev.vehicles, newVehicle],
    }));
    await syncWithDB();
    return newVehicle;
  };

  const updateVehicle = async (vehicle: Vehicle) => {
    const updated = await saveVehicleLocally(vehicle);
    setUserData((prev) => ({ ...prev, ...updated }));
    await syncWithDB();
  };

  const deleteVehicle = async (id: string) => {
    if (!userId) {
      throw new Error(
        "deleteVehicle: userId is missing, maybe user is not logged in",
      );
    }
    if (!clerkSupabase) {
      throw new Error(
        "deleteVehicle: clerkSupabase client is ready (getToken missing?)",
      );
    }

    const { error } = await clerkSupabase
      .from("vehicles")
      .delete()
      .eq("id", id)
      .eq("clerk_user_id", userId);

    if (error) {
      console.error("[UserContext] Supabase delete failed:", error);
      throw error;
    }

    // Local AsyncStorage se bhi properly hatao (authenticated client, remote sync dobara nahi — pehle hi delete ho chuka)
    const updated = await removeVehicleLocally(id, false);
    setUserData((prev) => ({ ...prev, ...updated }));
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

  // 🚀 Bookings update aur save karne ka handler
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
