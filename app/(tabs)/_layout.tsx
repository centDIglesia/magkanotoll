import { Tabs } from "expo-router";
import { Platform, View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  Home01Icon,
  CreditCardIcon,
  CompassIcon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { useScrollToTop } from "@react-navigation/native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#ffc400",
        tabBarInactiveTintColor: "#A3A3A3",
        tabBarLabelStyle: {
          fontFamily: "LufgaSemiBold",
          fontSize: 11,
          marginBottom: Platform.OS === "ios" ? 0 : 12,
        },
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 0,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: Platform.OS === "ios" ? 92 : 98,
          paddingTop: 32,
          paddingInline: 8,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ focused }) => (
            <View className={`items-center justify-center rounded-2xl p-4 py-5 ${focused ? "bg-accent mb-6" : "mb-4"}`}>
              <HugeiconsIcon icon={Home01Icon} size={24} color={focused ? "#fff" : "#A3A3A3"} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="rfid"
        options={{
          tabBarLabel: "RFID",
          tabBarIcon: ({ focused }) => (
            <View className={`items-center justify-center rounded-2xl p-4 py-5 ${focused ? "bg-accent mb-6" : "mb-4"}`}>
              <HugeiconsIcon icon={CreditCardIcon} size={24} color={focused ? "#fff" : "#A3A3A3"} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          tabBarLabel: "Explore",
          tabBarIcon: ({ focused }) => (
            <View className={`items-center justify-center rounded-2xl p-4 py-5 ${focused ? "bg-accent mb-6" : "mb-4"}`}>
              <HugeiconsIcon icon={CompassIcon} size={24} color={focused ? "#fff" : "#A3A3A3"} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ focused }) => (
            <View className={`items-center justify-center rounded-2xl p-4 py-5 ${focused ? "bg-accent mb-6" : "mb-4"}`}>
              <HugeiconsIcon icon={UserCircleIcon} size={24} color={focused ? "#fff" : "#A3A3A3"} />
            </View>
          ),
        }}
      />

     
    
    </Tabs>
  );
}
