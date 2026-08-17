import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  LocalUserData,
  UserLocation,
  Vehicle,
  NewVehicle,
} from "@/types/user";
import { supabase } from "@/utils/supabase"; // fallback, sirf jab clerk client na mile
import { SupabaseClient } from "@supabase/supabase-js";

const USER_DATA_KEY = "@app_user_local_data";

const DEFAULT_USER_DATA: LocalUserData = {
  mobileNumber: "",
  location: null,
  vehicles: [],
  selectedVehicleId: null,
  lastUpdated: Date.now(),
};

/**
 * Get complete local user data safely with fallback
 */
export const getLocalUserData = async (): Promise<LocalUserData> => {
  try {
    const jsonValue = await AsyncStorage.getItem(USER_DATA_KEY);

    if (!jsonValue) {
      return DEFAULT_USER_DATA;
    }

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

/**
 * Internal helper to persist data to AsyncStorage safely
 */
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

/**
 * Update mobile number locally
 */
export const savePhoneLocally = async (
  mobileNumber: string
): Promise<LocalUserData> => {
  const currentData = await getLocalUserData();

  const updatedData: LocalUserData = {
    ...currentData,
    mobileNumber,
    lastUpdated: Date.now(),
  };

  return saveLocalUserData(updatedData);
};

/**
 * Update location locally
 */
export const saveLocationLocally = async (
  location: UserLocation
): Promise<LocalUserData> => {
  const currentData = await getLocalUserData();

  const updatedData: LocalUserData = {
    ...currentData,
    location,
    lastUpdated: Date.now(),
  };

  return saveLocalUserData(updatedData);
};

/**
 * Save or update an existing vehicle locally
 */
export const saveVehicleLocally = async (
  vehicle: Vehicle
): Promise<LocalUserData> => {
  const currentData = await getLocalUserData();

  const existingIndex = currentData.vehicles.findIndex(
    (v) => v.id === vehicle.id
  );

  const updatedVehicles = [...currentData.vehicles];

  if (existingIndex >= 0) {
    updatedVehicles[existingIndex] = vehicle;
  } else {
    updatedVehicles.unshift(vehicle);
  }

  const updatedData: LocalUserData = {
    ...currentData,
    vehicles: updatedVehicles,
    selectedVehicleId: vehicle.id,
    lastUpdated: Date.now(),
  };

  return saveLocalUserData(updatedData);
};

/**
 * ADD NEW VEHICLE:
 * 1. Insert vehicle into Supabase using DB schema mapping (via Clerk-aware client)
 * 2. Return generated ID & row
 * 3. Save mapped Vehicle object into local storage
 */
export const addVehicleWithSync = async (
  vehicle: NewVehicle,
  clerkUserId: string,
  client: SupabaseClient
): Promise<{ vehicle: Vehicle; userData: LocalUserData }> => {
  if (!clerkUserId) {
    throw new Error("User is not authenticated. Please log in.");
  }

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
    throw new Error(
      error?.message || "Could not save vehicle to remote database."
    );
  }

  // Map DB Snake Case back to App Camel Case model
  const fullVehicle: Vehicle = {
    id: insertedRow.id,
    brand: insertedRow.make || vehicle.brand,
    model: insertedRow.model || vehicle.model,
    category: insertedRow.vehicle_type || vehicle.category,
    registrationNumber:
      insertedRow.registration_number || vehicle.registrationNumber || "",
  };

  const updatedUserData = await saveVehicleLocally(fullVehicle);

  return {
    vehicle: fullVehicle,
    userData: updatedUserData,
  };
};

/**
 * Remove vehicle locally and optionally delete from Supabase
 */
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

  const updatedVehicles = currentData.vehicles.filter(
    (vehicle) => vehicle.id !== vehicleId
  );

  const isSelected = currentData.selectedVehicleId === vehicleId;

  const newSelectedId = isSelected
    ? updatedVehicles.length > 0
      ? updatedVehicles[0].id
      : null
    : currentData.selectedVehicleId;

  const updatedData: LocalUserData = {
    ...currentData,
    vehicles: updatedVehicles,
    selectedVehicleId: newSelectedId,
    lastUpdated: Date.now(),
  };

  return saveLocalUserData(updatedData);
};

/**
 * Change selected vehicle locally
 */
export const setSelectedVehicleLocally = async (
  vehicleId: string
): Promise<LocalUserData> => {
  const currentData = await getLocalUserData();

  const vehicleExists = currentData.vehicles.some(
    (vehicle) => vehicle.id === vehicleId
  );

  if (!vehicleExists) {
    console.warn(
      `[UserStorage] Cannot select vehicle ${vehicleId}: vehicle not found locally.`
    );
    return currentData;
  }

  const updatedData: LocalUserData = {
    ...currentData,
    selectedVehicleId: vehicleId,
    lastUpdated: Date.now(),
  };

  return saveLocalUserData(updatedData);
};

/**
 * Clear local data on logout
 */
export const clearLocalUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_DATA_KEY);
  } catch (error) {
    console.error("[UserStorage] Error clearing local user data:", error);
  }
};