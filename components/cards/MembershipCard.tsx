import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import Colors from "@/constants/colors";
import Radius from "@/constants/radius";
import Spacing from "@/constants/spacing";

interface Props {
  title: string;
  subtitle: string;
  price: number;
  savings: string;
  popular: boolean;
  features: string[];
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export default function MembershipCard({
  title,
  subtitle,
  price,
  savings,
  popular,
  features,
  icon,
  color,
}: Props) {
  const isPremium = popular;

  return (
    <View style={styles.wrapper}>
      {popular && (
        <View style={styles.badge}>
          <Ionicons name="diamond" size={12} color="#fff" />
          <Text style={styles.badgeText}>POPULAR</Text>
        </View>
      )}

      {isPremium ? (
        <LinearGradient
          colors={["#2563EB", "#1D4ED8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <CardContent
            dark
            title={title}
            subtitle={subtitle}
            price={price}
            savings={savings}
            features={features}
            icon={icon}
          />
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.card,
            {
              backgroundColor: color,
            },
          ]}
        >
          <CardContent
            title={title}
            subtitle={subtitle}
            price={price}
            savings={savings}
            features={features}
            icon={icon}
          />
        </View>
      )}
    </View>
  );
}

interface CardContentProps {
  dark?: boolean;
  title: string;
  subtitle: string;
  price: number;
  savings: string;
  features: string[];
  icon: keyof typeof Ionicons.glyphMap;
}

function CardContent({ dark, title, subtitle, price, savings, features, icon }: CardContentProps) {
  return (
    <>
      <View style={styles.header}>
        <View
          style={[
            styles.iconBox,
            dark && {
              backgroundColor: "rgba(255,255,255,.15)",
            },
          ]}
        >
          <Ionicons name={icon} size={24} color={dark ? "#fff" : Colors.primary} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.title, dark && { color: "#fff" }]}>{title}</Text>

          <Text
            style={[
              styles.subtitle,
              dark && {
                color: "rgba(255,255,255,.75)",
              },
            ]}
          >
            {subtitle}
          </Text>
        </View>
      </View>

      <Text style={[styles.price, dark && { color: "#fff" }]}>
        ₹{price}
        <Text
          style={[
            styles.month,
            dark && {
              color: "rgba(255,255,255,.75)",
            },
          ]}
        >
          {" "}
          / month
        </Text>
      </Text>

      <Text style={[styles.savings, dark && { color: "#DCE7FF" }]}>{savings}</Text>

      <View style={styles.features}>
        {features.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={18} color={dark ? "#fff" : Colors.primary} />

            <Text style={[styles.featureText, dark && { color: "#fff" }]}>{feature}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity activeOpacity={0.9} style={[styles.button, dark && styles.buttonLight]}>
        <Text
          style={[
            styles.buttonText,
            dark && {
              color: Colors.primary,
            },
          ]}
        >
          Subscribe
        </Text>

        <Ionicons name="arrow-forward" size={18} color={dark ? Colors.primary : "#fff"} />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 280,
    marginRight: 18,
    paddingTop: 16,
  },

  badge: {
    position: "absolute",
    top: 0,
    alignSelf: "center",
    zIndex: 20,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 14,
    paddingVertical: 6,

    borderRadius: 20,

    backgroundColor: Colors.primary,
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 5,
  },

  card: {
    borderRadius: Radius.xl,

    padding: Spacing.lg,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },

    elevation: 6,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 18,
  },

  iconBox: {
    width: 54,
    height: 54,

    borderRadius: 18,

    backgroundColor: "#fff",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 14,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.textSecondary,
  },

  price: {
    fontSize: 34,
    fontWeight: "800",
    color: Colors.primary,
  },

  month: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  savings: {
    marginTop: 4,
    marginBottom: 20,

    color: "#16A34A",

    fontWeight: "700",
  },

  features: {
    marginBottom: 26,
  },

  featureRow: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 12,
  },

  featureText: {
    marginLeft: 10,

    fontSize: 14,

    color: Colors.text,
  },

  button: {
    height: 52,

    borderRadius: 18,

    backgroundColor: Colors.primary,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonLight: {
    backgroundColor: "#fff",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,

    marginRight: 8,
  },
});
