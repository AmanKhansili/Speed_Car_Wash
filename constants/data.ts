import { Ionicons } from "@expo/vector-icons";

export interface Service {
  id: number;
  title: string;
  subtitle: string;
  category: "Wash" | "Interior" | "Detailing" | "Coating";
  price: number;
  rating: number;
  duration: string;
  image: any;
}

export const services: Service[] = [
  {
    id: 1,
    title: "Exterior Wash",
    subtitle: "Shine Like New",
    category: "Wash",
    price: 299,
    rating: 4.9,
    duration: "45 min",
    image: require("../assets/images/asset_1.png"),
  },
  {
    id: 2,
    title: "Interior Cleaning",
    subtitle: "Fresh & Clean",
    category: "Interior",
    price: 499,
    rating: 4.8,
    duration: "60 min",
    image: require("../assets/images/asset_2.png"),
  },
  {
    id: 3,
    title: "Car Detailing",
    subtitle: "Premium Finish",
    category: "Detailing",
    price: 999,
    rating: 5.0,
    duration: "90 min",
    image: require("../assets/images/asset_4.png"),
  },
  {
    id: 4,
    title: "Ceramic Coating",
    subtitle: "Long Lasting",
    category: "Coating",
    price: 1499,
    rating: 5.0,
    duration: "120 min",
    image: require("../assets/images/asset_5.png"),
  },
  {
    id: 5,
    title: "Premium Polish",
    subtitle: "Mirror Finish",
    category: "Detailing",
    price: 799,
    rating: 4.9,
    duration: "70 min",
    image: require("../assets/images/asset_6.png"),
  },
];

export interface MembershipPlan {
  id: number;
  title: string;
  subtitle: string;
  price: number;
  duration: "Monthly" | "Quarterly";
  savings: string;
  popular: boolean;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  features: string[];
}

export const membershipPlans: MembershipPlan[] = [
  {
    id: 1,
    title: "Basic Care",
    subtitle: "Perfect for regular maintenance",
    price: 899,
    duration: "Monthly",
    savings: "Save 10%",
    popular: false,
    color: "#EEF4FF",
    icon: "car-sport-outline",
    features: ["3 Exterior Washes", "Basic Interior Vacuum", "Priority Slot", "5% Discount"],
  },
  {
    id: 2,
    title: "Premium Care",
    subtitle: "Most Loved Plan",
    price: 1599,
    duration: "Monthly",
    savings: "Save 20%",
    popular: true,
    color: "#2563EB",
    icon: "diamond-outline",
    features: ["6 Premium Washes", "Interior Cleaning", "Free Pickup", "Priority Booking"],
  },
  {
    id: 3,
    title: "Elite Care",
    subtitle: "Luxury Experience",
    price: 2399,
    duration: "Monthly",
    savings: "Save 30%",
    popular: false,
    color: "#FFF7E6",
    icon: "star-outline",
    features: ["Unlimited Exterior Wash", "Premium Detailing", "VIP Support", "Ceramic Discount"],
  },
];

export const reviews = [
  {
    id: 1,
    name: "Rahul Sharma",
    rating: 5,
    review: "Amazing doorstep service. My car looked brand new after the wash.",
  },
  {
    id: 2,
    name: "Aman Gupta",
    rating: 5,
    review: "Very professional team and on-time service. Highly recommended.",
  },
  {
    id: 3,
    name: "Priya Verma",
    rating: 4,
    review: "Loved the interior cleaning. Booking process was smooth and easy.",
  },
];

export const serviceCategories = ["All", "Wash", "Interior", "Detailing", "Coating"];
