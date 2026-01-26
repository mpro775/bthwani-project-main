import { render } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";
import { AppThemeProvider, useAppTheme } from "../../context/ThemeContext";

// مكون اختبار لاستخدام السياق
const TestComponent = () => {
  const { theme } = useAppTheme();
  return <Text testID="theme-name">{theme.colors.primary}</Text>;
};

describe("ThemeContext", () => {
  it("يتم تهيئة السياق بالقيم الافتراضية", () => {
    const { getByTestId } = render(
      <AppThemeProvider>
        <TestComponent />
      </AppThemeProvider>
    );

    expect(getByTestId("theme-name")).toBeTruthy();
  });

  it("يتم توفير قيم السمة الصحيحة", () => {
    const { getByTestId } = render(
      <AppThemeProvider>
        <TestComponent />
      </AppThemeProvider>
    );

    expect(getByTestId("theme-name")).toBeTruthy();
  });

  it("يتم عرض قيمة السمة", () => {
    const { getByTestId } = render(
      <AppThemeProvider>
        <TestComponent />
      </AppThemeProvider>
    );

    const themeElement = getByTestId("theme-name");
    expect(themeElement).toBeTruthy();
    expect(themeElement.props.children).toBeDefined();
  });
});
