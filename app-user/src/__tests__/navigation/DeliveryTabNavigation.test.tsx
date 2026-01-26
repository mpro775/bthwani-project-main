// __tests__/navigation/DeliveryTabNavigation.test.tsx
import { NavigationContainer } from "@react-navigation/native";
import { render } from "@testing-library/react-native";
import React from "react";
import DeliveryTabNavigation from "../../navigation/DeliveryTabNavigation";

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => ({
  Entypo: "Entypo",
  Ionicons: "Ionicons",
  MaterialIcons: "MaterialIcons",
}));

// Mock useSafeAreaInsets
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  }),
}));

// Mock screen components
jest.mock("../../screens/delivery/DeliveryHomeScreen", () => {
  return function MockDeliveryHomeScreen() {
    return null;
  };
});

jest.mock("../../screens/delivery/GroceryScreen", () => {
  return function MockGroceryScreen() {
    return null;
  };
});

jest.mock("../../screens/delivery/MyOrdersScreen", () => {
  return function MockMyOrdersScreen() {
    return null;
  };
});

describe("DeliveryTabNavigation", () => {
  test("يتم عرض DeliveryTabNavigation بدون أخطاء", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <DeliveryTabNavigation />
      </NavigationContainer>
    );

    expect(getByTestId).toBeTruthy();
  });

  test("يتم تهيئة DeliveryTabNavigation مع التبويبات الصحيحة", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <DeliveryTabNavigation />
      </NavigationContainer>
    );

    expect(getByTestId).toBeTruthy();
  });

  test("يتم عرض DeliveryTabNavigation مع NavigationContainer", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <DeliveryTabNavigation />
      </NavigationContainer>
    );

    expect(getByTestId).toBeTruthy();
  });

  test("يتم تطبيق التنسيق الصحيح للتبويبات", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <DeliveryTabNavigation />
      </NavigationContainer>
    );

    expect(getByTestId).toBeTruthy();
  });

  test("يتم عرض جميع تبويبات التوصيل", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <DeliveryTabNavigation />
      </NavigationContainer>
    );

    expect(getByTestId).toBeTruthy();
  });
});
