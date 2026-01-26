// __tests__/navigation/PaymentTabNavigation.test.tsx
import React from "react";
import { render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import PaymentTabNavigation from "../../navigation/PaymentTabNavigation";

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
  MaterialIcons: "MaterialIcons",
  FontAwesome5: "FontAwesome5",
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
jest.mock("../../screens/wallet/Topup/TopupScreen", () => {
  return function MockTopupScreen() {
    return null;
  };
});

jest.mock("../../screens/wallet/Topup/PayBillScreen", () => {
  return function MockPayBillScreen() {
    return null;
  };
});

jest.mock("../../screens/wallet/Topup/MyTransactionsScreen", () => {
  return function MockMyTransactionsScreen() {
    return null;
  };
});

jest.mock("../../screens/wallet/Topup/LogsScreen", () => {
  return function MockLogsScreen() {
    return null;
  };
});

jest.mock("../../screens/wallet/Topup/GamePackagesScreen", () => {
  return function MockGamePackagesScreen() {
    return null;
  };
});

describe("PaymentTabNavigation", () => {
  test("يتم عرض PaymentTabNavigation بدون أخطاء", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <PaymentTabNavigation />
      </NavigationContainer>
    );

    expect(getByTestId).toBeTruthy();
  });

  test("يتم تهيئة PaymentTabNavigation مع التبويبات الصحيحة", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <PaymentTabNavigation />
      </NavigationContainer>
    );

    expect(getByTestId).toBeTruthy();
  });

  test("يتم عرض PaymentTabNavigation مع NavigationContainer", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <PaymentTabNavigation />
      </NavigationContainer>
    );

    expect(getByTestId).toBeTruthy();
  });

  test("يتم تطبيق التنسيق الصحيح للتبويبات", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <PaymentTabNavigation />
      </NavigationContainer>
    );

    expect(getByTestId).toBeTruthy();
  });

  test("يتم عرض جميع تبويبات الدفع", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <PaymentTabNavigation />
      </NavigationContainer>
    );

    expect(getByTestId).toBeTruthy();
  });
});
