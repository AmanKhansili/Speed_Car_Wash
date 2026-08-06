import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function HeroBanner() {
  return (
    <LinearGradient
      colors={["#2563EB", "#1D4ED8"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.left}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>PREMIUM</Text>
        </View>

        <Text style={styles.title}>Premium{"\n"}Car Care</Text>

        <Text style={styles.subtitle}>Doorstep washing &{"\n"}detailing service</Text>

        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Book Now</Text>
          </TouchableOpacity>

          <Text style={styles.rating}>⭐ 4.9</Text>
        </View>
      </View>

      <Image source={require("../../assets/images/asset_1.png")} style={styles.image} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    borderRadius: 24,
    padding: 20,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    minHeight: 180,
    overflow: "hidden",
  },

  left: {
    flex: 1,
    paddingRight: 10,
    zIndex: 1,
  },

  badge: {
    backgroundColor: "rgba(255,255,255,.18)",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 10,
  },

  subtitle: {
    color: "#E5E7EB",
    marginTop: 8,
    lineHeight: 20,
    fontSize: 14,
  },

  bottomRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  button: {
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
  },

  buttonText: {
    color: "#2563EB",
    fontWeight: "700",
  },

  rating: {
    color: "#fff",
    fontWeight: "700",
  },

  image: {
    width: 450,
    height: 450,
    resizeMode: "contain",
    position: "absolute",
    right: -200,
    top: -140,
  },
});
