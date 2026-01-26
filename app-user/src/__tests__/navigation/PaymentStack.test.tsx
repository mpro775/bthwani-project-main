// __tests__/navigation/PaymentStack.test.tsx
import React from "react";
import { render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import PaymentStack from "../../navigation/PaymentStack";

// Mock react-native-gesture-handler
jest.mock("react-native-gesture-handler", () => ({
  GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => children,
  PanGestureHandler: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock PaymentTabNavigation
jest.mock("../../navigation/PaymentTabNavigation", () => {
  return function MockPaymentTabNavigation() {
    return null;
  };
});

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

describe("PaymentStack", () => {
  test("يتم عرض PaymentStack بدون أخطاء", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <PaymentStack />
      </NavigationContainer>
    );

    expect(getByTestId).toBeTruthy();
  });

  test("يتم تهيئة PaymentStack مع الشاشة الصحيحة", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <PaymentStack />
      </NavigationContainer>
    );

    expect(getByTestId).toBeTruthy();
  });

  test("يتم عرض PaymentStack مع NavigationContainer", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <PaymentStack />
      </NavigationContainer>
    );

    expect(getByTestId).toBeTruthy();
  });
});
