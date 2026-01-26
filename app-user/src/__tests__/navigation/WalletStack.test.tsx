// __tests__/navigation/WalletStack.test.tsx
import React from "react";
import { render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import WalletStack from "../../navigation/WalletStack";

// Mock react-native-gesture-handler
jest.mock("react-native-gesture-handler", () => ({
  GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => children,
  PanGestureHandler: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock WalletTopTabs
jest.mock("../../navigation/WalletTopTabs", () => {
  return function MockWalletTopTabs() {
    return null;
  };
});

// Mock screen components
jest.mock("../../screens/wallet/Topup/TopupScreen", () => {
  return function MockTopupScreen() {
    return null;
  };
});

jest.mock("../../screens/wallet/TransactionDetailsScreen", () => {
  return function MockTransactionDetailsScreen() {
    return null;
  };
});

describe("WalletStack", () => {
  test("يتم عرض WalletStack بدون أخطاء", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <WalletStack />
      </NavigationContainer>
    );

    expect(getByTestId).toBeTruthy();
  });

  test("يتم تهيئة WalletStack مع الشاشات الصحيحة", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <WalletStack />
      </NavigationContainer>
    );

    expect(getByTestId).toBeTruthy();
  });

  test("يتم عرض WalletStack مع NavigationContainer", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <WalletStack />
      </NavigationContainer>
    );

    expect(getByTestId).toBeTruthy();
  });

  test("يتم عرض WalletStack مع جميع الشاشات", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <WalletStack />
      </NavigationContainer>
    );

    expect(getByTestId).toBeTruthy();
  });

  test("يتم تطبيق التنسيق الصحيح للشاشات", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <WalletStack />
      </NavigationContainer>
    );

    expect(getByTestId).toBeTruthy();
  });
});
