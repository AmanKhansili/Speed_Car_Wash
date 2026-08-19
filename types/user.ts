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
  brand: string;
  model: string;
  category: string;
  registrationNumber: string;
  created_at?: string;
}

export type NewVehicle = Omit<Vehicle, "id">;

export interface LocalUserData {
  mobileNumber: string;
  location: UserLocation | null;
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  lastUpdated: number;
}
