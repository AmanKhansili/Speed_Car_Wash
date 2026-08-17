export interface UserLocation {
  address: string;
  city: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
}

export interface Vehicle {
  id: string;
  model: string;
  brand: string;
  category: string;
  registrationNumber: string;
}

export type NewVehicle = Omit<Vehicle, "id">;

export interface LocalUserData {
  mobileNumber: string;
  location: UserLocation | null;
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  lastUpdated: number; // Timestamp for sync checks
}