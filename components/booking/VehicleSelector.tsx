import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { INDIAN_CAR_DATA } from "@/constants/indianCars";

export interface Vehicle {
  id: string;
  model: string;
  brand: string;
  category: string;
  registrationNumber: string;
}

interface VehicleSelectorProps {
  selectedVehicleId: string;
  onSelectVehicle: (id: string) => void;
}

const ALL_CAR_MODELS = INDIAN_CAR_DATA.flatMap((brand) =>
  brand.models.map((model) => ({
    ...model,
    brand: brand.brand,
  }))
);

const CATEGORIES = ["Hatchback", "Sedan", "Compact SUV", "Full SUV", "Luxury"];

export default function VehicleSelector({
  selectedVehicleId,
  onSelectVehicle,
}: VehicleSelectorProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Modal & Search States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isManualEntry, setIsManualEntry] = useState(false); // 👈 Toggle Manual Entry Form

  // Selected or Manual Form State
  const [brandName, setBrandName] = useState("");
  const [modelName, setModelName] = useState("");
  const [category, setCategory] = useState("Hatchback");
  const [regNumber, setRegNumber] = useState("");

  // Search Filter
  const filteredModels = ALL_CAR_MODELS.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Select Model from List
  const handleSelectFromList = (item: { name: string; brand: string; category: string }) => {
    setModelName(item.name);
    setBrandName(item.brand);
    setCategory(item.category);
    setIsManualEntry(false);
  };

  // Reset Modal Form
  const resetForm = () => {
    setModelName("");
    setBrandName("");
    setCategory("Hatchback");
    setRegNumber("");
    setSearchQuery("");
    setIsManualEntry(false);
    setIsModalOpen(false);
  };

  // Save Vehicle Handler
  const handleAddVehicle = () => {
    if (!brandName.trim() || !modelName.trim()) {
      Alert.alert("Required Fields", "Please enter/select both Car Brand and Model.");
      return;
    }

    const newVehicle: Vehicle = {
      id: Date.now().toString(),
      model: modelName.trim(),
      brand: brandName.trim(),
      category: category,
      registrationNumber: regNumber.trim() ? regNumber.trim().toUpperCase() : "NOT SPECIFIED",
    };

    const updatedList = [...vehicles, newVehicle];
    setVehicles(updatedList);
    onSelectVehicle(newVehicle.id);
    resetForm();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Select Vehicle</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setIsModalOpen(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle" size={20} color={Colors.primary || "#2563EB"} />
          <Text style={styles.addBtnText}>Add Vehicle</Text>
        </TouchableOpacity>
      </View>

      {/* Empty State vs List */}
      {vehicles.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="car-outline" size={36} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Vehicle Selected</Text>
          <Text style={styles.emptySub}>
            Please add your vehicle details to continue with the booking.
          </Text>
          <TouchableOpacity
            style={styles.addVehicleMainBtn}
            onPress={() => setIsModalOpen(true)}
          >
            <Text style={styles.addVehicleMainBtnText}>+ Add Your Car</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {vehicles.map((item) => {
            const isSelected = item.id === selectedVehicleId;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.vehicleCard, isSelected && styles.selectedVehicleCard]}
                onPress={() => onSelectVehicle(item.id)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <Ionicons
                    name="car"
                    size={22}
                    color={isSelected ? Colors.primary || "#2563EB" : "#6B7280"}
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.modelText}>{item.model}</Text>
                    <Text style={styles.brandText}>
                      {item.brand} • <Text style={styles.categoryText}>{item.category}</Text>
                    </Text>
                  </View>
                  <View
                    style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </View>

                {item.registrationNumber !== "NOT SPECIFIED" && (
                  <View style={styles.regBadge}>
                    <Text style={styles.regText}>{item.registrationNumber}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* ADD VEHICLE MODAL */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={resetForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isManualEntry ? "Enter Custom Car Details" : "Add New Vehicle"}
              </Text>
              <TouchableOpacity onPress={resetForm}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* TOGGLE BETWEEN SEARCH & MANUAL FORM */}
            {!isManualEntry ? (
              <>
                {/* Search Box */}
                <View style={styles.searchBox}>
                  <Ionicons name="search" size={20} color="#9CA3AF" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search car model (e.g. Swift, Nexon...)"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#9CA3AF"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                      <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Selected Tag Preview */}
                {modelName ? (
                  <View style={styles.selectedModelTag}>
                    <Text style={styles.selectedModelTagText}>
                      Selected: {brandName} {modelName} ({category})
                    </Text>
                  </View>
                ) : null}

                {/* Search Results List */}
                <FlatList
                  data={filteredModels}
                  keyExtractor={(item) => item.id}
                  style={{ maxHeight: 180 }}
                  nestedScrollEnabled
                  renderItem={({ item }) => {
                    const isItemChosen = modelName === item.name && brandName === item.brand;
                    return (
                      <TouchableOpacity
                        style={[styles.modelItem, isItemChosen && styles.modelItemActive]}
                        onPress={() => handleSelectFromList(item)}
                      >
                        <View>
                          <Text style={styles.modelItemText}>{item.name}</Text>
                          <Text style={styles.modelItemSub}>{item.brand}</Text>
                        </View>
                        <View style={styles.typeTag}>
                          <Text style={styles.typeTagText}>{item.category}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                  ListEmptyComponent={
                    <View style={styles.emptySearchContainer}>
                      <Text style={styles.noResultText}>Car not found in list?</Text>
                      <TouchableOpacity
                        style={styles.manualSwitchBtn}
                        onPress={() => setIsManualEntry(true)}
                      >
                        <Text style={styles.manualSwitchBtnText}>
                          + Enter Car Name Manually
                        </Text>
                      </TouchableOpacity>
                    </View>
                  }
                />

                {/* Always Show Option to Type Manually */}
                <TouchableOpacity
                  style={styles.manualLinkBtn}
                  onPress={() => setIsManualEntry(true)}
                >
                  <Ionicons name="create-outline" size={16} color={Colors.primary || "#2563EB"} />
                  <Text style={styles.manualLinkText}>Can&lsquo;t find your car? Type manually</Text>
                </TouchableOpacity>
              </>
            ) : (
              /* MANUAL INPUT FORM */
              <View style={styles.manualForm}>
                <TouchableOpacity
                  style={styles.backToSearchBtn}
                  onPress={() => setIsManualEntry(false)}
                >
                  <Ionicons name="arrow-back" size={16} color="#4B5563" />
                  <Text style={styles.backToSearchText}>Back to search list</Text>
                </TouchableOpacity>

                {/* Brand Name Input */}
                <Text style={styles.inputLabel}>Car Brand (Company):</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Maruti, Tata, Hyundai, MG..."
                  value={brandName}
                  onChangeText={setBrandName}
                  placeholderTextColor="#9CA3AF"
                />

                {/* Model Name Input */}
                <Text style={styles.inputLabel}>Car Model Name:</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Swift, Nexon, Hector..."
                  value={modelName}
                  onChangeText={setModelName}
                  placeholderTextColor="#9CA3AF"
                />

                {/* Category Selection Chips */}
                <Text style={styles.inputLabel}>Car Category (for Wash Pricing):</Text>
                <View style={styles.categoryChipsRow}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.chip,
                        category === cat && styles.activeChip,
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          category === cat && styles.activeChipText,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Vehicle Reg Number Input (Common for Both) */}
            <Text style={[styles.inputLabel, { marginTop: 12 }]}>
              Registration Number (Optional):
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. UP16 AB 1234"
              value={regNumber}
              onChangeText={setRegNumber}
              autoCapitalize="characters"
              placeholderTextColor="#9CA3AF"
            />

            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleAddVehicle}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>Save & Select Car</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginTop: 10 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  addBtnText: { fontSize: 14, fontWeight: "600", color: Colors.primary || "#2563EB" },

  emptyCard: {
    marginBottom: 20,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 15, fontWeight: "700", color: "#374151", marginTop: 8 },
  emptySub: { fontSize: 12, color: "#6B7280", textAlign: "center", marginTop: 4, marginBottom: 12 },
  addVehicleMainBtn: {
    backgroundColor: Colors.primary || "#2563EB",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addVehicleMainBtnText: { color: "#FFF", fontWeight: "700", fontSize: 13 },

  listContainer: { gap: 10 },
  vehicleCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border || "#E5E7EB",
    backgroundColor: "#FFF",
  },
  selectedVehicleCard: { borderColor: Colors.primary || "#2563EB", backgroundColor: "#EFF6FF" },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  modelText: { fontSize: 15, fontWeight: "700", color: "#111827" },
  brandText: { fontSize: 12, color: "#6B7280" },
  categoryText: { fontWeight: "600", color: Colors.primary || "#2563EB" },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: { borderColor: Colors.primary || "#2563EB" },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary || "#2563EB" },
  regBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  regText: { fontSize: 11, fontWeight: "700", color: "#374151" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#111827" },
  modelItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modelItemActive: { backgroundColor: "#EFF6FF" },
  modelItemText: { fontSize: 14, fontWeight: "600", color: "#111827" },
  modelItemSub: { fontSize: 12, color: "#6B7280" },
  typeTag: { backgroundColor: "#F1F5F9", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  typeTagText: { fontSize: 11, fontWeight: "600", color: "#475569" },

  emptySearchContainer: { alignItems: "center", paddingVertical: 14 },
  noResultText: { fontSize: 13, color: "#6B7280", marginBottom: 8 },
  manualSwitchBtn: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  manualSwitchBtnText: { color: Colors.primary || "#2563EB", fontWeight: "700", fontSize: 12 },

  manualLinkBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
  manualLinkText: { fontSize: 13, fontWeight: "600", color: Colors.primary || "#2563EB" },

  manualForm: { gap: 10, marginBottom: 8 },
  backToSearchBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  backToSearchText: { fontSize: 12, color: "#4B5563", fontWeight: "600" },
  inputLabel: { fontSize: 12, fontWeight: "600", color: "#4B5563" },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  categoryChipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
  },
  activeChip: { backgroundColor: Colors.primary || "#2563EB", borderColor: Colors.primary || "#2563EB" },
  chipText: { fontSize: 12, color: "#4B5563", fontWeight: "600" },
  activeChipText: { color: "#FFF" },

  selectedModelTag: { backgroundColor: "#DBEAFE", padding: 8, borderRadius: 8, marginBottom: 8 },
  selectedModelTagText: { fontSize: 12, fontWeight: "700", color: "#1E40AF" },

  saveBtn: {
    backgroundColor: Colors.primary || "#2563EB",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
});
