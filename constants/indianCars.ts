export interface CarModel {
  id: string;
  name: string;
  category: "Hatchback" | "Sedan" | "Compact SUV" | "Full SUV" | "Luxury";
}

export interface CarBrand {
  id: string;
  brand: string;
  models: CarModel[];
}

export const INDIAN_CAR_DATA: CarBrand[] = [
  {
    id: "maruti",
    brand: "Maruti Suzuki",
    models: [
      { id: "maruti_swift", name: "Swift", category: "Hatchback" },
      { id: "maruti_baleno", name: "Baleno", category: "Hatchback" },
      { id: "maruti_wagonr", name: "WagonR", category: "Hatchback" },
      { id: "maruti_alto", name: "Alto K10", category: "Hatchback" },
      { id: "maruti_dzire", name: "Dzire", category: "Sedan" },
      { id: "maruti_brezza", name: "Brezza", category: "Compact SUV" },
      { id: "maruti_ertiga", name: "Ertiga", category: "Full SUV" },
      { id: "maruti_grand_vitara", name: "Grand Vitara", category: "Compact SUV" },
      { id: "maruti_frox", name: "Fronx", category: "Compact SUV" },
      { id: "maruti_jimny", name: "Jimny", category: "Compact SUV" },
    ],
  },
  {
    id: "tata",
    brand: "Tata Motors",
    models: [
      { id: "tata_nexon", name: "Nexon", category: "Compact SUV" },
      { id: "tata_punch", name: "Punch", category: "Hatchback" },
      { id: "tata_harrier", name: "Harrier", category: "Full SUV" },
      { id: "tata_safari", name: "Safari", category: "Full SUV" },
      { id: "tata_tiago", name: "Tiago", category: "Hatchback" },
      { id: "tata_tigor", name: "Tigor", category: "Sedan" },
      { id: "tata_curvv", name: "Curvv", category: "Compact SUV" },
    ],
  },
  {
    id: "hyundai",
    brand: "Hyundai",
    models: [
      { id: "hyundai_creta", name: "Creta", category: "Compact SUV" },
      { id: "hyundai_venue", name: "Venue", category: "Compact SUV" },
      { id: "hyundai_i20", name: "i20", category: "Hatchback" },
      { id: "hyundai_grand_i10", name: "Grand i10 Nios", category: "Hatchback" },
      { id: "hyundai_verna", name: "Verna", category: "Sedan" },
      { id: "hyundai_exter", name: "Exter", category: "Hatchback" },
      { id: "hyundai_alcazar", name: "Alcazar", category: "Full SUV" },
      { id: "hyundai_tucson", name: "Tucson", category: "Full SUV" },
    ],
  },
  {
    id: "mahindra",
    brand: "Mahindra",
    models: [
      { id: "mahindra_thar", name: "Thar / Thar Roxx", category: "Full SUV" },
      { id: "mahindra_scorpio_n", name: "Scorpio-N", category: "Full SUV" },
      { id: "mahindra_scorpio_classic", name: "Scorpio Classic", category: "Full SUV" },
      { id: "mahindra_xuv700", name: "XUV700", category: "Full SUV" },
      { id: "mahindra_xuv3xo", name: "XUV 3XO", category: "Compact SUV" },
      { id: "mahindra_bolero", name: "Bolero / Neo", category: "Full SUV" },
    ],
  },
  {
    id: "kia",
    brand: "Kia",
    models: [
      { id: "kia_seltos", name: "Seltos", category: "Compact SUV" },
      { id: "kia_sonet", name: "Sonet", category: "Compact SUV" },
      { id: "kia_carens", name: "Carens", category: "Full SUV" },
      { id: "kia_carnival", name: "Carnival", category: "Full SUV" },
    ],
  },
  {
    id: "toyota",
    brand: "Toyota",
    models: [
      { id: "toyota_fortuner", name: "Fortuner", category: "Full SUV" },
      { id: "toyota_innova_hycross", name: "Innova Hycross", category: "Full SUV" },
      { id: "toyota_innova_crysta", name: "Innova Crysta", category: "Full SUV" },
      { id: "toyota_glanza", name: "Glanza", category: "Hatchback" },
      { id: "toyota_urban_cruiser", name: "Urban Cruiser Taisor", category: "Compact SUV" },
      { id: "toyota_camry", name: "Camry", category: "Sedan" },
    ],
  },
  {
    id: "honda",
    brand: "Honda",
    models: [
      { id: "honda_city", name: "City", category: "Sedan" },
      { id: "honda_elevate", name: "Elevate", category: "Compact SUV" },
      { id: "honda_amaize", name: "Amaze", category: "Sedan" },
    ],
  },
  {
    id: "mg",
    brand: "MG Motors",
    models: [
      { id: "mg_hector", name: "Hector / Hector Plus", category: "Full SUV" },
      { id: "mg_astor", name: "Astor", category: "Compact SUV" },
      { id: "mg_comet", name: "Comet EV", category: "Hatchback" },
      { id: "mg_zs_ev", name: "ZS EV", category: "Compact SUV" },
      { id: "mg_gloster", name: "Gloster", category: "Full SUV" },
    ],
  },
  {
    id: "volkswagen",
    brand: "Volkswagen",
    models: [
      { id: "vw_virtus", name: "Virtus", category: "Sedan" },
      { id: "vw_taigun", name: "Taigun", category: "Compact SUV" },
      { id: "vw_tiguan", name: "Tiguan", category: "Full SUV" },
    ],
  },
  {
    id: "skoda",
    brand: "Skoda",
    models: [
      { id: "skoda_slavia", name: "Slavia", category: "Sedan" },
      { id: "skoda_kushaq", name: "Kushaq", category: "Compact SUV" },
      { id: "skoda_kodiaq", name: "Kodiaq", category: "Full SUV" },
      { id: "skoda_kylaq", name: "Kylaq", category: "Compact SUV" },
    ],
  },
  {
    id: "bmw",
    brand: "BMW",
    models: [
      { id: "bmw_3_series", name: "3 Series", category: "Luxury" },
      { id: "bmw_5_series", name: "5 Series", category: "Luxury" },
      { id: "bmw_x1", name: "X1", category: "Luxury" },
      { id: "bmw_x5", name: "X5", category: "Luxury" },
    ],
  },
  {
    id: "mercedes",
    brand: "Mercedes-Benz",
    models: [
      { id: "merc_c_class", name: "C-Class", category: "Luxury" },
      { id: "merc_e_class", name: "E-Class", category: "Luxury" },
      { id: "merc_glc", name: "GLC", category: "Luxury" },
      { id: "merc_gle", name: "GLE", category: "Luxury" },
    ],
  },
];