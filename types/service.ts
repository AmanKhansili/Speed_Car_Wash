export interface Service {
  id: number;
  title: string;
  subtitle: string;
  price: number;
  rating: number;
  duration: string;
  image: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  price: number;
  duration?: string;
}

// Database schema mapped Booking interface
export interface Booking {
  id: string;
  clerk_user_id: string;
  user_id: string;
  service_type: "pickup" | "walkin" | string;
  service_name: string;
  services_booked: ServiceItem[];
  booking_date: string;
  scheduled_date: string;
  phone?: string;
  primary_phone: string;
  alt_phone?: string;
  address: string;
  amount: number;
  total_amount: number;
  payment_id?: string | null;
  status: "Pending" | "Confirmed" | "Failed" | "Cancelled" | "Saved" | "Saved_Template" | string;
  created_at?: string;
}

export interface BookingData {
  vehicleId?: string;
  vehicleName?: string;
  serviceId?: string;
  serviceTitle?: string;
  servicePrice?: number | string;
  date?: string;
  time?: string;
  serviceType?: "pickup" | "walkin";
  address?: string;
  addressText?: string;
  primaryPhone?: string;
  altPhone?: string;
  phone?: string;
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
  address_line_1: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface AddressSelectorProps {
  selectedAddressId: string;
  onSelectAddress: (id: string, addressLine1: string) => void;
  onAddNewAddress?: () => void;
}
