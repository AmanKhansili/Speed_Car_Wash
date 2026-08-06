import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import Spacing from "@/constants/spacing";

export default function Header() {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.iconBox}>
          <Ionicons name="menu" size={24} color={Colors.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBox}>
          <Ionicons name="notifications-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <Text style={styles.greeting}>Good Morning 👋</Text>

      <Text style={styles.name}>Aman</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 4,
  },

  greeting: {
    color: Colors.textSecondary,
    fontSize: 16,
  },

  name: {
    marginTop: 6,
    fontSize: 34,
    fontWeight: "700",
    color: Colors.text,
  },
});
