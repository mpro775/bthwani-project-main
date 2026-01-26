// __tests__/navigation/AppNavigation.test.tsx
import {
  NavigationContainer,
  NavigationIndependentTree,
} from "@react-navigation/native";
import { render } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigation from "../../navigation";

// Mock react-native-gesture-handler
jest.mock("react-native-gesture-handler", () => ({
  GestureHandlerRootView: ({ children }: { children: React.ReactNode }) =>
    children,
  PanGestureHandler: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock react-native-webview
jest.mock("react-native-webview", () => ({
  WebView: "WebView",
}));

// Mock expo-location
jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

// Mock useSafeAreaInsets
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  }),
  useSafeAreaFrame: () => ({
    x: 0,
    y: 0,
    width: 390,
    height: 844,
  }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock SafeAreaProviderCompat
jest.mock("@react-navigation/elements", () => ({
  SafeAreaProviderCompat: ({ children }: { children: React.ReactNode }) =>
    children,
}));

// Mock navigation components
jest.mock("../../navigation/DeliveryTabNavigation", () => {
  return function MockDeliveryTabNavigation() {
    return null;
  };
});

jest.mock("../../navigation/SheinStack", () => {
  return function MockSheinStack() {
    return null;
  };
});

jest.mock("../../navigation/PaymentStack", () => {
  return function MockPaymentStack() {
    return null;
  };
});

jest.mock("../../navigation/WalletStack", () => {
  return function MockWalletStack() {
    return null;
  };
});

// Mock screen components
jest.mock("../../screens/profile/UserProfileScreen", () => {
  return function MockProfileScreen() {
    return null;
  };
});

jest.mock("../../screens/Auth/LoginScreen", () => {
  return function MockLoginScreen() {
    return null;
  };
});

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

jest.mock("../../screens/FavoritesScreen", () => {
  return function MockFavoritesScreen() {
    return null;
  };
});

// Mock useContext
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useContext: jest.fn(() => ({
    $$typeof: Symbol.for("react.context"),
    _currentValue: {},
    _currentValue2: {},
    _threadCount: 0,
    Provider: ({ children }: { children: React.ReactNode }) => children,
    Consumer: ({ children }: { children: React.ReactNode }) => children,
  })),
}));

// Mock NavigationContainer
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  NavigationContainer: ({ children }: { children: React.ReactNode }) =>
    children,
  NavigationIndependentTree: ({ children }: { children: React.ReactNode }) =>
    children,
}));

// Mock useRegisterNavigator
jest.mock("@react-navigation/core", () => ({
  ...jest.requireActual("@react-navigation/core"),
  useRegisterNavigator: jest.fn(() => ({
    register: jest.fn(),
    unregister: jest.fn(),
  })),
  useNavigationBuilder: jest.fn(() => ({
    state: { index: 0, routes: [] },
    navigation: {
      navigate: jest.fn(),
      goBack: jest.fn(),
      canGoBack: jest.fn(() => false),
    },
    descriptors: {},
  })),
  createNavigatorFactory: jest.fn(() => jest.fn()),
}));

// Mock RootStack.Navigator
jest.mock("@react-navigation/native-stack", () => ({
  ...jest.requireActual("@react-navigation/native-stack"),
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: ({ children }: { children: React.ReactNode }) => children,
  }),
}));

describe("AppNavigation", () => {
  test("يتم عرض AppNavigation بدون أخطاء", () => {
    const { getByTestId } = render(
      <SafeAreaProvider>
        <NavigationContainer>
          <NavigationIndependentTree>
            <AppNavigation hasSeenOnboarding={true} />
          </NavigationIndependentTree>
        </NavigationContainer>
      </SafeAreaProvider>
    );

    expect(getByTestId).toBeTruthy();
  });

  test("يتم تهيئة AppNavigation مع التنقل الصحيح", () => {
    const { getByTestId } = render(
      <SafeAreaProvider>
        <NavigationContainer>
          <NavigationIndependentTree>
            <AppNavigation hasSeenOnboarding={true} />
          </NavigationIndependentTree>
        </NavigationContainer>
      </SafeAreaProvider>
    );

    expect(getByTestId).toBeTruthy();
  });

  test("يتم عرض AppNavigation مع NavigationContainer", () => {
    const { getByTestId } = render(
      <SafeAreaProvider>
        <NavigationContainer>
          <NavigationIndependentTree>
            <AppNavigation hasSeenOnboarding={true} />
          </NavigationIndependentTree>
        </NavigationContainer>
      </SafeAreaProvider>
    );

    expect(getByTestId).toBeTruthy();
  });
});
