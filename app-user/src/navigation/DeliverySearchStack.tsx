// DeliverySearchStack.tsx
import React from "react";
import { createStackNavigator } from "@react-navigation/stack"; // 👈 JS stack (NOT native-stack)
import DeliverySearch from "@/screens/delivery/DeliverySearch";

const JSStack = createStackNavigator();

export default function DeliverySearchStack() {
  return (
    <JSStack.Navigator
      screenOptions={{
        headerShown: false,
        // أبسط انتقال ممكن
        animation: "none",
      }}
    >
      <JSStack.Screen name="DeliverySearchInner" component={DeliverySearch} />
    </JSStack.Navigator>
  );
}
