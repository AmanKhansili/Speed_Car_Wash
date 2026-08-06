import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";

import Colors from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarShowLabel: true,

        tabBarActiveTintColor: Colors.primary,

        tabBarInactiveTintColor: "#94A3B8",

        tabBarStyle: {
          position: "absolute",

          left: 20,

          right: 20,

          bottom: 0,

          height: 72,

          borderRadius: 24,

          backgroundColor: "#fff",

          borderTopWidth: 0,

          elevation: 8,

          shadowColor: "#000",

          shadowOpacity: 0.08,

          shadowRadius: 15,

          shadowOffset: {
            width: 0,
            height: 8,
          },
        },

        tabBarLabelStyle: {
          fontSize: 12,

          fontWeight: "600",

          marginBottom: 8,
        },

        tabBarIconStyle: {
          marginTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",

          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: focused ? "#EFF6FF" : "transparent",
              }}
            >
              <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="services"
        options={{
          title: "Services",

          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: focused ? "#EFF6FF" : "transparent",
              }}
            >
              <Ionicons
                name={focused ? "car-sport" : "car-sport-outline"}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="bookings"
        options={{
          title: "Bookings",

          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: focused ? "#EFF6FF" : "transparent",
              }}
            >
              <Ionicons name={focused ? "calendar" : "calendar-outline"} size={22} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",

          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: focused ? "#EFF6FF" : "transparent",
              }}
            >
              <Ionicons name={focused ? "person" : "person-outline"} size={22} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
