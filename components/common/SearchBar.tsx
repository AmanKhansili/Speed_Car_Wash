import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import Radius from "@/constants/radius";

export default function SearchBar() {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={22} color={Colors.textSecondary} />

      <TextInput
        placeholder="Search for services..."
        placeholderTextColor={Colors.textSecondary}
        style={styles.input}
      />

      <TouchableOpacity style={styles.filter}>
        <Ionicons name="options-outline" size={22} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 60,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 4,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: Colors.text,
  },

  filter: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
});
