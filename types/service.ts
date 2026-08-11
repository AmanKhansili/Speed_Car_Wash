export interface Service {
  id: number;
  title: string;
  subtitle: string;
  price: number;
  rating: number;
  duration: string;
  image: string;
}

export interface BookingData {
  vehicleId?: string;
  vehicleName?: string;
  serviceId?: string;
  serviceTitle?: string;
  servicePrice?: number | string; // e.g., 599 or "₹599"
  date?: string;
  time?: string;
  serviceType?: "pickup" | "walkin"; // Doorstep Pickup ya Walk-in Center
  address?: string;
  addressText?: string;
  phone?: string; // Contact mobile number
}

export interface PaymentSummaryProps {
  bookingData?: BookingData;
  basePrice?: number;
  taxes?: number;
  discount?: number;
  convenienceFee?: number;
}

export interface Address {
  id: string;
  tag: "Home" | "Work" | "Other";
  addressLine1: string;
  landmark?: string;
  latitude?: number,
  longitude?:number,
  isDefault?: boolean;
}

export interface AddressSelectorProps {
  selectedAddressId: string;
  onSelectAddress: (id: string) => void;
  onAddNewAddress?: () => void;
}
