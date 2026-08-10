import Colors from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SectionTitleProps {
  title: string;
  actionText?: string;
  onPress?: () => void;
}

export default function SectionTitle({
  title,
  actionText = "View All",
  onPress,
}: SectionTitleProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {onPress && (
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
  },
});
