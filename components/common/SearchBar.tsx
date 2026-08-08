import Colors from "@/constants/colors";
import Radius from "@/constants/radius";
import Shadow from "@/constants/shadow";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (text: string) => void;
}

export default function SearchBar({
  placeholder = "Search services...",
  onSearch,
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={Colors.textLight} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.textLight}
        onChangeText={onSearch}
      />
      <TouchableOpacity style={styles.filterBtn}>
        <Ionicons name="options-outline" size={20} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    height: 52,
    borderRadius: Radius.xl,
    paddingHorizontal: 16,
    marginBottom: 20,
    ...Shadow.light,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    fontWeight: "500",
  },
  filterBtn: {
    padding: 4,
    marginLeft: 8,
  },
});
