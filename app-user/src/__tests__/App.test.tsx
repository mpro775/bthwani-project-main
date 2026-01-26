import React from "react";
import App from "../../App";

// Mock dependencies
jest.mock("react-native-gesture-handler", () => ({
  GestureHandlerRootView: "GestureHandlerRootView",
}));

jest.mock("react-native-reanimated", () => ({}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaProvider: "SafeAreaProvider",
  SafeAreaView: "SafeAreaView",
}));

jest.mock("expo-font", () => ({
  loadAsync: jest.fn(),
}));

jest.mock("expo-splash-screen", () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
}));

jest.mock("@react-native-community/netinfo", () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(),
}));

jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: "Toast",
}));

jest.mock("utils/toastConfig", () => ({
  toastConfig: {},
}));

jest.mock("utils/offlineQueue", () => ({
  queueOfflineRequest: jest.fn(),
  retryQueuedRequests: jest.fn(),
}));

jest.mock("utils/lib/utm", () => ({
  saveUtmFromUrl: jest.fn(),
}));

jest.mock("context/CartContextShein", () => ({
  CartProviderShein: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("context/CartContext", () => ({
  CartProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("context/ThemeContext", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("screens/OfflineScreen", () => "OfflineScreen");

jest.mock("../navigation", () => "AppNavigation");

describe("App", () => {
  it("should be defined", () => {
    expect(App).toBeDefined();
    expect(typeof App).toBe("function");
  });

  it("should be a valid React component", () => {
    expect(App).toBeDefined();
    expect(typeof App).toBe("function");
  });
});
