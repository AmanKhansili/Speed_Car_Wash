import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  LocalUserData,
  UserLocation,
  Vehicle,
  NewVehicle,
} from "@/types/user";
import { supabase } from "@/utils/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

const USER_DATA_KEY = "@app_user_local_data";
const PROFILE_CACHE_KEY = "@app_profile_cache";
const STATS_CACHE_KEY = "@app_stats_cache";

export interface CachedProfileData {
  phone: string | null;
  created_at: string;
}

export interface CachedUserStats {
  totalBookings: number;
  completed: number;
  upcoming: number;
  savedServices: number;
}

const DEFAULT_USER_DATA: LocalUserData = {
  mobileNumber: "",
  location: null,
  vehicles: [],
  selectedVehicleId: null,
  lastUpdated: Date.now(),
};

export const getLocalUserData = async (): Promise<LocalUserData> => {
  try {
    const jsonValue = await AsyncStorage.getItem(USER_DATA_KEY);
    if (!jsonValue) return DEFAULT_USER_DATA;
    const parsed = JSON.parse(jsonValue);
    return {
      ...DEFAULT_USER_DATA,
      ...parsed,
      vehicles: Array.isArray(parsed.vehicles) ? parsed.vehicles : [],
    };
  } catch (error) {
    console.error("[UserStorage] Error reading local data:", error);
    return DEFAULT_USER_DATA;
  }
};

const saveLocalUserData = async (
  data: LocalUserData
): Promise<LocalUserData> => {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
    return data;
  } catch (error) {
    console.error("[UserStorage] Failed to save local user data:", error);
    throw new Error("Could not update local storage.");
  }
};

export const savePhoneLocally = async (mobileNumber: string): Promise<LocalUserData> => {
  const currentData = await getLocalUserData();
  return saveLocalUserData({ ...currentData, mobileNumber, lastUpdated: Date.now() });
};

export const saveLocationLocally = async (location: UserLocation): Promise<LocalUserData> => {
  const currentData = await getLocalUserData();
  return saveLocalUserData({ ...currentData, location, lastUpdated: Date.now() });
};

export const saveVehicleLocally = async (vehicle: Vehicle): Promise<LocalUserData> => {
  const currentData = await getLocalUserData();
  const existingIndex = currentData.vehicles.findIndex((v) => v.id === vehicle.id);
  const updatedVehicles = [...currentData.vehicles];

  if (existingIndex >= 0) {
    updatedVehicles[existingIndex] = vehicle;
  } else {
    updatedVehicles.unshift(vehicle);
  }

  return saveLocalUserData({
    ...currentData,
    vehicles: updatedVehicles,
    selectedVehicleId: vehicle.id,
    lastUpdated: Date.now(),
  });
};

export const addVehicleWithSync = async (
  vehicle: NewVehicle,
  clerkUserId: string,
  client: SupabaseClient
): Promise<{ vehicle: Vehicle; userData: LocalUserData }> => {
  if (!clerkUserId) throw new Error("User is not authenticated. Please log in.");

  const dbPayload = {
    clerk_user_id: clerkUserId,
    make: vehicle.brand,
    model: vehicle.model,
    registration_number: vehicle.registrationNumber || null,
    vehicle_type: vehicle.category,
  };

  const { data: insertedRow, error } = await client
    .from("vehicles")
    .insert(dbPayload)
    .select("*")
    .single();

  if (error || !insertedRow) {
    console.error("[UserStorage] Supabase insert failed:", error);
    throw new Error(error?.message || "Could not save vehicle to remote database.");
  }

  const fullVehicle: Vehicle = {
    id: insertedRow.id,
    brand: insertedRow.make || vehicle.brand,
    model: insertedRow.model || vehicle.model,
    category: insertedRow.vehicle_type || vehicle.category,
    registrationNumber: insertedRow.registration_number || vehicle.registrationNumber || "",
  };

  const updatedUserData = await saveVehicleLocally(fullVehicle);
  return { vehicle: fullVehicle, userData: updatedUserData };
};

export const removeVehicleLocally = async (
  vehicleId: string,
  syncWithSupabase: boolean = true,
  client?: SupabaseClient
): Promise<LocalUserData> => {
  if (syncWithSupabase) {
    try {
      await (client ?? supabase).from("vehicles").delete().eq("id", vehicleId);
    } catch (err) {
      console.warn("[UserStorage] Remote deletion warning:", err);
    }
  }

  const currentData = await getLocalUserData();
  const updatedVehicles = currentData.vehicles.filter((v) => v.id !== vehicleId);
  const isSelected = currentData.selectedVehicleId === vehicleId;
  const newSelectedId = isSelected
    ? updatedVehicles.length > 0
      ? updatedVehicles[0].id
      : null
    : currentData.selectedVehicleId;

  return saveLocalUserData({
    ...currentData,
    vehicles: updatedVehicles,
    selectedVehicleId: newSelectedId,
    lastUpdated: Date.now(),
  });
};

export const setSelectedVehicleLocally = async (vehicleId: string): Promise<LocalUserData> => {
  const currentData = await getLocalUserData();
  const vehicleExists = currentData.vehicles.some((v) => v.id === vehicleId);

  if (!vehicleExists) return currentData;

  return saveLocalUserData({
    ...currentData,
    selectedVehicleId: vehicleId,
    lastUpdated: Date.now(),
  });
};

export const clearLocalUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      USER_DATA_KEY,
      PROFILE_CACHE_KEY,
      STATS_CACHE_KEY,
    ]);
  } catch (error) {
    console.error("[UserStorage] Error clearing local user data:", error);
  }
};

/* ====================================================================
 * PROFILE & STATS CACHING HELPERS
 * ==================================================================== */

export const getCachedProfileData = async (): Promise<CachedProfileData | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
    return jsonValue ? JSON.parse(jsonValue) : null;
  } catch (error) {
    return null;
  }
};

export const saveProfileCache = async (profile: CachedProfileData): Promise<void> => {
  try {
    await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error("[UserStorage] Error saving profile cache:", error);
  }
};

export const getCachedStatsData = async (): Promise<CachedUserStats | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STATS_CACHE_KEY);
    return jsonValue ? JSON.parse(jsonValue) : null;
  } catch (error) {
    return null;
  }
};

export const saveStatsCache = async (stats: CachedUserStats): Promise<void> => {
  try {
    await AsyncStorage.setItem(STATS_CACHE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error("[UserStorage] Error saving stats cache:", error);
  }
};

export const overwriteVehiclesLocally = async (
  vehicles: Vehicle[],
  selectedVehicleId: string | null
): Promise<LocalUserData> => {
  const currentData = await getLocalUserData();
  return saveLocalUserData({
    ...currentData,
    vehicles,
    selectedVehicleId,
    lastUpdated: Date.now(),
  });
};

