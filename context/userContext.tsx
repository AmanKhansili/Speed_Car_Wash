import { LocalUserData, NewVehicle, UserLocation, Vehicle } from "@/types/user";
import { createClerkSupabaseClient } from "@/utils/supabase";
import {
  addVehicleWithSync,
  getLocalUserData,
  overwriteVehiclesLocally,
  removeVehicleLocally,
  saveLocationLocally,
  savePhoneLocally,
  setSelectedVehicleLocally,
} from "@/utils/userStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// 1. Context Type Interface
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

// 2. Provider Component
export const UserProvider = ({ children, userId, getToken }: UserProviderProps) => {
  const [userData, setUserData] = useState<LocalUserData & { bookings?: any[] }>({
    mobileNumber: "",
    location: null,
    vehicles: [],
    selectedVehicleId: null,
    lastUpdated: Date.now(),
    bookings: [],
  });
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Stable token getter ref to avoid re-instantiating client
  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const clerkSupabase = useMemo(() => {
    return createClerkSupabaseClient(async () => {
      if (getTokenRef.current) {
        return await getTokenRef.current();
      }
      return null;
    });
  }, []);

  const syncWithDB = useCallback(async () => {
    if (!userId) return;

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

      const updatedLocalData = await overwriteVehiclesLocally(formattedVehicles, newSelectedId);

      setUserData((prev) => ({
        ...prev,
        ...updatedLocalData,
      }));
    } catch (error) {
      console.warn("[UserContext] DB Sync failed, using cached storage:", error);
    }
  }, [userId, clerkSupabase]);

  // Initial local storage read
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

  // Sync only once when userId becomes available
  useEffect(() => {
    if (userId && isLoaded) {
      syncWithDB();
    }
  }, [userId, isLoaded, syncWithDB]);

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

  const addVehicle = async (veh: NewVehicle): Promise<Vehicle> => {
    if (!userId) {
      throw new Error("addVehicle: userId is missing");
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
    if (!userId) return;

    const { error } = await clerkSupabase
      .from("vehicles")
      .update({
        make: vehicle.brand,
        model: vehicle.model,
        vehicle_type: vehicle.category,
        registration_number: vehicle.registrationNumber,
      })
      .eq("id", vehicle.id)
      .eq("clerk_user_id", userId);

    if (error) {
      console.error("[UserContext] Update vehicle failed in DB:", error);
      throw error;
    }

    await syncWithDB();
  };

  const deleteVehicle = async (id: string) => {
    if (!userId) {
      throw new Error("deleteVehicle: userId is missing");
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
