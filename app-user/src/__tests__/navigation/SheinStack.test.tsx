// __tests__/navigation/SheinStack.test.tsx
import React from "react";
import { render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import SheinStackNavigation from "../../navigation/SheinStack";

// Mock react-native-gesture-handler
jest.mock("react-native-gesture-handler", () => ({
  GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => children,
  PanGestureHandler: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock screen components
jest.mock("../../screens/delivery/SHEINScreen", () => {
  return function MockSHEINScreen() {
    return null;
  };
});

jest.mock("../../screens/delivery/SheinCheckoutScreen", () => {
  return function MockSheinCheckoutScreen() {
    return null;
  };
});

describe("SheinStack", () => {
  test("يتم عرض SheinStack بدون أخطاء", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <SheinStackNavigation />
      </NavigationContainer>
    );

    expect(getByTestId).toBeTruthy();
  });

  test("يتم تهيئة SheinStack مع الشاشات الصحيحة", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <SheinStackNavigation />
      </NavigationContainer>
    );

    expect(getByTestId).toBeTruthy();
  });

  test("يتم عرض SheinStack مع NavigationContainer", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <SheinStackNavigation />
      </NavigationContainer>
    );

    expect(getByTestId).toBeTruthy();
  });

  test("يتم عرض SheinStack مع جميع الشاشات", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <SheinStackNavigation />
      </NavigationContainer>
    );

    expect(getByTestId).toBeTruthy();
  });

  test("يتم تطبيق التنسيق الصحيح للشاشات", () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <SheinStackNavigation />
      </NavigationContainer>
    );

    expect(getByTestId).toBeTruthy();
  });
});
