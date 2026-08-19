import { create } from "zustand";

export interface ServiceItem {
  id: string;
  title: string;
  price: number;
  duration?: string;
}

interface BookingState {
  selectedServices: ServiceItem[];
  addService: (service: ServiceItem) => void;
  removeService: (serviceId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  setCartServices: (services: any[]) => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedServices: [],

  // Service add karne ka function
  addService: (service) =>
    set((state) => {
      // Check karo agar service already cart mein hai toh dobara add na ho
      const exists = state.selectedServices.find((s) => s.id === service.id);
      if (exists) return state;
      return { selectedServices: [...state.selectedServices, service] };
    }),

  // Service remove karne ka function
  removeService: (serviceId) =>
    set((state) => ({
      selectedServices: state.selectedServices.filter((s) => s.id !== serviceId),
    })),

  // Pura cart khali karne ka function (Booking complete hone ke baad)
  clearCart: () => set({ selectedServices: [] }),

  // Total bill calculate karne ka function
  getTotalPrice: () => {
    return get().selectedServices.reduce((total, service) => total + service.price, 0);
  },
  setCartServices: (services) => set({ selectedServices: services }),
}));
