export const servicesData = [
  {
    id: "1",
    title: "Silver Wash",
    subtitle: "Vacuum, Shampoo & Underbody",
    price: "₹450",
    rating: "4.7",
    reviews: "124",
    category: "Wash",
    image: require("@/assets/images/services/exterior.png"),
    description: "Complete vacuuming of cars incl. seats and boot...",
  },
  {
    id: "2",
    title: "Gold Wash",
    subtitle: "Silver Wash + Alloys & Dashboard",
    price: "₹600",
    rating: "4.8",
    reviews: "89",
    category: "Wash",
    image: {
      uri: "https://www.speedcarwash.com/images/services/gold-wash.jpg",
    },
    description: "Complete vacuuming of cars incl. seats and boot...",
  },
  {
    id: "3",
    title: "Platinum Wash",
    subtitle: "Foam Wash, Interior Dry Clean & Polish",
    price: "₹1600",
    rating: "4.9",
    reviews: "56",
    category: "Wash",
    image: { uri: "https://img.freepik.com/free-photo/car-wash-detailing-station_1303-22307.jpg" },
    description: "Complete dry cleaning of a interior...",
  },
  {
    id: "4",
    title: "Intensive Internal",
    subtitle: "Deep Dry Clean & Vinyl Dressing",
    price: "₹1350",
    rating: "4.9",
    reviews: "42",
    category: "Interior",
    image: {
      uri: "https://www.speedcarwash.com/images/services/internal-clean.jpg",
    },
    description: "Complete dry cleaning of a interior including seats...",
  },
  {
    id: "5",
    title: "Wax Rubbing & Buffing",
    subtitle: "Scratch Repair & Paint Gloss Restore",
    price: "₹1700",
    rating: "4.8",
    reviews: "75",
    category: "Detailing",
    image: {
      uri: "https://www.speedcarwash.com/images/services/rubbing.jpg",
    },
    description: "Over the time cars paint erodes due to the effects of sunlight...",
  },
  {
    id: "6",
    title: "Teflon Coating",
    subtitle: "PTFE Polymer Paint Protection",
    price: "₹2800",
    rating: "5.0",
    reviews: "34",
    category: "Coating",
    image: {
      uri: "https://www.speedcarwash.com/images/services/teflon-coating.jpg",
    },
    description: "Our PTFE based Polymer paint sealant creates slippery...",
  },
  {
    id: "7",
    title: "Engine Degreasing",
    subtitle: "High Gloss Coating & Rat Repellent",
    price: "₹900",
    rating: "4.8",
    reviews: "62",
    category: "Detailing",
    image: {
      uri: "https://img.freepik.com/free-photo/auto-mechanic-working-garage-repair-service_146671-19690.jpg",
    },
    description:
      "This treatment provides a high gloss and slippery coating on to the engine parts, preventing hoses from being bitten by rats...",
  },
  {
    id: "8",
    title: "A.C. Treatment",
    subtitle: "Disinfects Ducts & Removes Odors",
    price: "₹900",
    rating: "4.7",
    reviews: "84",
    category: "Interior",
    image: {
      uri: "https://www.speedcarwash.com/images/services/ac-treatment.png",
    },
    description:
      "Designed to disinfect the Air conditioner ducts, stop buildup of mould, and improve in-car air quality...",
  },
  {
    id: "9",
    title: "Alloy Descaling",
    subtitle: "Restores Sheen & Protects from Dust",
    price: "₹800",
    rating: "4.9",
    reviews: "110",
    category: "Detailing",
    image: {
      uri: "https://www.speedcarwash.com/images/services/tyre-treatment.png",
    },
    description:
      "Intensive cleaning and protection of alloy wheels, restoring lost sheen and ensuring long-term protection from brake dust and grime...",
  },
  {
    id: "10",
    title: "Headlight Restore",
    subtitle: "Clears Oxidation for Better Night Vision",
    price: "₹700",
    rating: "4.6",
    reviews: "95",
    category: "Detailing",
    image: {
      uri: "https://www.speedcarwash.com/images/services/head-light-restoration.png",
    },
    description:
      "Radically improves headlight visibility by clearing hard water marks and oxidation from the glass for safer night driving...",
  },
  {
    id: "11",
    title: "Upholstery Protect",
    subtitle: "Thorough Stain Removal & Fabric Restore",
    price: "₹1500",
    rating: "4.8",
    reviews: "47",
    category: "Interior",
    image: {
      uri: "https://www.speedcarwash.com/images/services/up-protection.png",
    },
    description:
      "Removes tough stains like chocolates, coffee/tea from carpets, vinyl, fabric, and plastics, leaving interiors fresh with no odor...",
  },
  {
    id: "12",
    title: "Windshield Treat",
    subtitle: "Clear Vision in Rain & Night Driving",
    price: "₹1500",
    rating: "4.9",
    reviews: "132",
    category: "Coating",
    image: {
      uri: "https://www.speedcarwash.com/images/services/car-wind-sheild.png",
    },
    description:
      "Cleans and protects windshield, removing hard water marks and oxidation to provide clear vision during rainy seasons and night...",
  },
  {
    id: "13",
    title: "Leather Condition",
    subtitle: "Deep Clean & Condition for Rich Look",
    price: "₹1000",
    rating: "4.8",
    reviews: "76",
    category: "Interior",
    image: {
      uri: "https://www.speedcarwash.com/images/services/leather-coating.png",
    },
    description:
      "Intensive cleansing and conditioning of leather interiors, removing tough stains and restoring seats with no bad odors...",
  },
];

export const categoriesList = [
  "All",
  ...Array.from(new Set(servicesData.map((item) => item.category))),
];
