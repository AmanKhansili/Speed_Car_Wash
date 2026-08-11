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
  registrationNumber: string;
}

export interface LocalUserData {
  mobileNumber: string;
  location: UserLocation | null;
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  lastUpdated: number; // Timestamp for sync checks
}