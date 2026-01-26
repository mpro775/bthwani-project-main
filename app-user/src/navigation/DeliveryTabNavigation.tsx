import { Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "react-native";
import DeliveryHomeScreen from "../screens/delivery/DeliveryHomeScreen";
import GroceryScreen from "../screens/delivery/GroceryScreen";
import MyOrdersScreen from "../screens/delivery/MyOrdersScreen";

const Tab = createMaterialTopTabNavigator();

const DeliveryTabNavigation = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      screenOptions={{
        swipeEnabled: true,
        tabBarShowIcon: true,
        tabBarActiveTintColor: "#D84315",
        tabBarInactiveTintColor: "#B0BEC5",
        tabBarIndicatorStyle: { backgroundColor: "#3E2723" },
        tabBarStyle: {
          backgroundColor: "#fff",
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          borderTopWidth: 1,
          borderTopColor: "#eee",
        },
        tabBarLabelStyle: {
          fontFamily: "Cairo-SemiBold",
          fontSize: 12,
        },
      }}
    >
      <Tab.Screen
        name="DeliveryHome"
        component={DeliveryHomeScreen}
        options={{
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontFamily: "Cairo-SemiBold", fontSize: 12 }}>
              الرئيسية
            </Text>
          ),
          tabBarIcon: ({ color }) => (
            <Entypo name="shop" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="GroceryMainScreen"
        component={GroceryScreen as any}
        options={{
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontFamily: "Cairo-SemiBold", fontSize: 12 }}>
              البقالة
            </Text>
          ),
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="local-grocery-store" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyOrders"
        component={MyOrdersScreen}
        options={{
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontFamily: "Cairo-SemiBold", fontSize: 12 }}>
              طلباتي
            </Text>
          ),
          tabBarIcon: ({ color }) => (
            <Ionicons name="list-outline" size={20} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default DeliveryTabNavigation;
