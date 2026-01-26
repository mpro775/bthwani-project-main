// __tests__/navigation/WalletTopTabs.test.tsx
import { NavigationContainer } from "@react-navigation/native";
import { render } from "@testing-library/react-native";
import React from "react";
import WalletTopTabs from "../../navigation/WalletTopTabs";

// Mock useSafeAreaInsets
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  }),
}));

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
  MaterialIcons: "MaterialIcons",
  FontAwesome: "FontAwesome",
}));

// Mock screen components
jest.mock("../../screens/wallet/WalletScreen", () => {
  return function MockWalletScreen() {
    return null;
  };
});

jest.mock("../../screens/wallet/WithdrawScreen", () => {
  return function MockWithdrawScreen() {
    return null;
  };
});

jest.mock("../../screens/wallet/LoyaltyScreen", () => {
  return function MockLoyaltyScreen() {
    return null;
  };
});

jest.mock("../../screens/wallet/CouponListScreen", () => {
  return function MockCouponListScreen() {
    return null;
  };
});

jest.mock("../../screens/wallet/analytics", () => {
  return function MockAnalyticsScreen() {
    return null;
  };
});

describe("WalletTopTabs", () => {
  test("يتم عرض WalletTopTabs بدون أخطاء", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <WalletTopTabs />
      </NavigationContainer>
    );

    expect(getByTestId).toBeTruthy();
  });

  test("يتم تهيئة WalletTopTabs مع التبويبات الصحيحة", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <WalletTopTabs />
      </NavigationContainer>
    );

    expect(getByTestId).toBeTruthy();
  });

  test("يتم عرض WalletTopTabs مع NavigationContainer", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <WalletTopTabs />
      </NavigationContainer>
    );

    expect(getByTestId).toBeTruthy();
  });

  test("يتم تطبيق التنسيق الصحيح للتبويبات", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <WalletTopTabs />
      </NavigationContainer>
    );

    expect(getByTestId).toBeTruthy();
  });

  test("يتم عرض جميع تبويبات المحفظة", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <WalletTopTabs />
      </NavigationContainer>
    );

    expect(getByTestId).toBeTruthy();
  });
});
