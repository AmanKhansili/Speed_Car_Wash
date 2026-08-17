import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
  useCallback,
} from "react";
import { LocalUserData, UserLocation, Vehicle, NewVehicle } from "@/types/user";
import {
  getLocalUserData,
  savePhoneLocally,
  saveLocationLocally,
  saveVehicleLocally,
  removeVehicleLocally,
  setSelectedVehicleLocally,
  addVehicleWithSync,
} from "@/utils/userStorage";
import { createClerkSupabaseClient } from "@/utils/supabase";

interface UserContextType {
  userData: LocalUserData;
  isLoaded: boolean;
  updatePhone: (phone: string) => Promise<void>;
  updateLocation: (loc: UserLocation) => Promise<void>;
  addVehicle: (veh: NewVehicle) => Promise<Vehicle>;
  updateVehicle: (veh: Vehicle) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  selectVehicle: (id: string) => Promise<void>;
  syncWithDB: () => Promise<void>;
}

interface UserProviderProps {
  children: ReactNode;
  userId?: string | null;
  getToken?: () => Promise<string | null>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children, userId, getToken }: UserProviderProps) => {
  const [userData, setUserData] = useState<LocalUserData>({
    mobileNumber: "",
    location: null,
    vehicles: [],
    selectedVehicleId: null,
    lastUpdated: Date.now(),
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

  useEffect(() => {
    const initData = async () => {
      try {
        const data = await getLocalUserData();
        setUserData(data);
      } catch (err) {
        console.error("[UserContext] Initialization error:", err);
      } finally {
        setIsLoaded(true);
      }
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
    setUserData(updated);
  };

  const updateLocation = async (location: UserLocation) => {
    const updated = await saveLocationLocally(location);
    setUserData(updated);
  };

  const addVehicle = async (newVehicle: NewVehicle): Promise<Vehicle> => {
    if (!userId) {
      throw new Error("User not authenticated. Please sign in to add a vehicle.");
    }
    if (!clerkSupabase) {
      throw new Error("Auth session not ready yet. Please try again in a moment.");
    }

    const { vehicle: createdVehicle, userData: updatedLocalData } =
      await addVehicleWithSync(newVehicle, userId, clerkSupabase);

    setUserData(updatedLocalData);
    return createdVehicle;
  };

  const updateVehicle = async (vehicle: Vehicle) => {
    const updated = await saveVehicleLocally(vehicle);
    setUserData(updated);
  };

  const deleteVehicle = async (id: string) => {
    const updated = await removeVehicleLocally(id, true, clerkSupabase ?? undefined);
    setUserData(updated);
  };

  const selectVehicle = async (id: string) => {
    const updated = await setSelectedVehicleLocally(id);
    setUserData(updated);
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