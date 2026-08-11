import AsyncStorage from "@react-native-async-storage/async-storage";
import { LocalUserData, UserLocation, Vehicle } from "@/types/user";

const USER_DATA_KEY = "@app_user_local_data";

const DEFAULT_USER_DATA: LocalUserData = {
  mobileNumber: "",
  location: null,
  vehicles: [],
  selectedVehicleId: null,
  lastUpdated: Date.now(),
};

// 1. Full Local Data Get Karein
export const getLocalUserData = async (): Promise<LocalUserData> => {
  try {
    const jsonValue = await AsyncStorage.getItem(USER_DATA_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : DEFAULT_USER_DATA;
  } catch (e) {
    console.error("Error reading user data from local storage:", e);
    return DEFAULT_USER_DATA;
  }
};

// 2. Mobile Number Update Karein
export const savePhoneLocally = async (mobileNumber: string): Promise<LocalUserData> => {
  const currentData = await getLocalUserData();
  const updatedData: LocalUserData = {
    ...currentData,
    mobileNumber,
    lastUpdated: Date.now(),
  };
  await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedData));
  return updatedData;
};

// 3. Location Update Karein
export const saveLocationLocally = async (location: UserLocation): Promise<LocalUserData> => {
  const currentData = await getLocalUserData();
  const updatedData: LocalUserData = {
    ...currentData,
    location,
    lastUpdated: Date.now(),
  };
  await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedData));
  return updatedData;
};

// 4. Vehicle Add / Edit Karein
export const saveVehicleLocally = async (vehicle: Vehicle): Promise<LocalUserData> => {
  const currentData = await getLocalUserData();
  const existingIndex = currentData.vehicles.findIndex((v) => v.id === vehicle.id);

  let updatedVehicles = [...currentData.vehicles];
  if (existingIndex > -1) {
    updatedVehicles[existingIndex] = vehicle; // Edit
  } else {
    updatedVehicles = [vehicle, ...updatedVehicles]; // Add
  }

  const updatedData: LocalUserData = {
    ...currentData,
    vehicles: updatedVehicles,
    selectedVehicleId: vehicle.id, // Auto select newly saved car
    lastUpdated: Date.now(),
  };

  await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedData));
  return updatedData;
};

// 5. Vehicle Delete Karein
export const removeVehicleLocally = async (vehicleId: string): Promise<LocalUserData> => {
  const currentData = await getLocalUserData();
  const updatedVehicles = currentData.vehicles.filter((v) => v.id !== vehicleId);

  // Agar selected vehicle delete ho rahi hai toh selection clear / update karo
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

  await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedData));
  return updatedData;
};

// 6. Selected Vehicle ID Change Karein
export const setSelectedVehicleLocally = async (vehicleId: string): Promise<LocalUserData> => {
  const currentData = await getLocalUserData();
  const updatedData: LocalUserData = {
    ...currentData,
    selectedVehicleId: vehicleId,
    lastUpdated: Date.now(),
  };

  await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedData));
  return updatedData;
};

// 7. Logout ke time Local Storage Clear karein
export const clearLocalUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_DATA_KEY);
  } catch (e) {
    console.error("Error clearing local user data:", e);
  }
};