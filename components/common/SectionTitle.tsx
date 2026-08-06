import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from "@/constants/colors";

interface Props {
  title: string;
  subtitle?: string;
  actionText?: string;
  onPress?: () => void;
}

export default function SectionTitle({ title, subtitle, actionText = "See All", onPress }: Props) {
  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>

        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        <Text style={styles.action}>{actionText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    marginBottom: 20,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
  },

  subtitle: {
    marginTop: 4,

    fontSize: 14,

    color: Colors.textSecondary,
  },

  action: {
    color: Colors.primary,

    fontWeight: "700",

    fontSize: 14,
  },
});
