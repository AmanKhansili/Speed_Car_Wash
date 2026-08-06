import { FlatList, StyleSheet, Text, TouchableOpacity } from "react-native";
import Colors from "@/constants/colors";

interface Props {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryTabs({ categories, selected, onSelect }: Props) {
  return (
    <FlatList
      horizontal
      data={categories}
      keyExtractor={(item) => item}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      bounces={false}
      overScrollMode="never"
      renderItem={({ item }) => (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelect(item)}
          style={[styles.tab, selected === item && styles.activeTab]}
        >
          <Text style={[styles.text, selected === item && styles.activeText]}>{item}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingTop: 12,
    paddingBottom: 30,
    paddingRight: 20,
  },

  tab: {
    height: 38,
    paddingHorizontal: 18,

    justifyContent: "center",
    alignItems: "center",

    borderRadius: 19,

    backgroundColor: "#EEF2FF",

    marginRight: 10,
  },

  activeTab: {
    backgroundColor: Colors.primary,
  },

  text: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },

  activeText: {
    color: "#fff",
  },
});
