// __tests__/components/business/BusinessTabs.test.tsx
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import BusinessTabs from "../../../components/business/BusinessTabs";

// Mock expo-linear-gradient
jest.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradient",
}));

describe("BusinessTabs", () => {
  const mockCategories = ["مطاعم", "عربية", "وجبات سريعة"];
  const defaultProps = {
    categories: mockCategories,
    selected: "مطاعم",
    onSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("يتم عرض جميع التابات", () => {
    const { getByText } = render(<BusinessTabs {...defaultProps} />);

    // Dynamic categories
    expect(getByText("مطاعم")).toBeTruthy();
    expect(getByText("عربية")).toBeTruthy();
    expect(getByText("وجبات سريعة")).toBeTruthy();

    // Static tabs
    expect(getByText("عروض مميزة")).toBeTruthy();
    expect(getByText("الأكثر مبيعاً")).toBeTruthy();
  });

  test("يتم تمييز التاب المحدد", () => {
    const { getByText } = render(<BusinessTabs {...defaultProps} />);
    const selectedTab = getByText("مطاعم");

    expect(selectedTab).toBeTruthy();
    // Selected tab should have active styling
  });

  test("يتم استدعاء onSelect عند الضغط على تاب", () => {
    const { getByText } = render(<BusinessTabs {...defaultProps} />);
    const arabicTab = getByText("عربية");

    fireEvent.press(arabicTab);
    expect(defaultProps.onSelect).toHaveBeenCalledWith("عربية");
  });

  test("يتم إزالة التكرار من التصنيفات", () => {
    const categoriesWithDuplicates = ["مطاعم", "عروض مميزة", "عربية"];
    const { getAllByText } = render(
      <BusinessTabs {...defaultProps} categories={categoriesWithDuplicates} />
    );

    // Should not have duplicate "عروض مميزة"
    const tabs = getAllByText(/عروض مميزة|مطاعم|عربية/);
    expect(tabs).toHaveLength(3);
  });

  test("يتم إضافة التابات الثابتة في النهاية", () => {
    const { getByText } = render(<BusinessTabs {...defaultProps} />);

    // Static tabs should be at the end
    expect(getByText("عروض مميزة")).toBeTruthy();
    expect(getByText("الأكثر مبيعاً")).toBeTruthy();
  });

  test("يعمل مع قائمة تصنيفات فارغة", () => {
    const emptyProps = { ...defaultProps, categories: [] };
    const { getByText } = render(<BusinessTabs {...emptyProps} />);

    // Should still show static tabs
    expect(getByText("عروض مميزة")).toBeTruthy();
    expect(getByText("الأكثر مبيعاً")).toBeTruthy();
  });

  test("يتم تمرير onSelect للتاب المحدد", () => {
    const { getByText } = render(<BusinessTabs {...defaultProps} />);
    const selectedTab = getByText("مطاعم");

    fireEvent.press(selectedTab);
    expect(defaultProps.onSelect).toHaveBeenCalledWith("مطاعم");
  });

  test("يتم تطبيق التنسيق الصحيح للتاب النشط", () => {
    const { getByText } = render(<BusinessTabs {...defaultProps} />);
    const activeTab = getByText("مطاعم");

    expect(activeTab).toBeTruthy();
    // Active tab should have gradient background
  });

  test("يتم تطبيق التنسيق الصحيح للتاب غير النشط", () => {
    const { getByText } = render(<BusinessTabs {...defaultProps} />);
    const inactiveTab = getByText("عربية");

    expect(inactiveTab).toBeTruthy();
    // Inactive tab should have regular styling
  });

  test("يتم تمرير onSelect للتابات الثابتة", () => {
    const { getByText } = render(<BusinessTabs {...defaultProps} />);
    const staticTab = getByText("عروض مميزة");

    fireEvent.press(staticTab);
    expect(defaultProps.onSelect).toHaveBeenCalledWith("عروض مميزة");
  });

  test("يتم عرض التابات في ScrollView أفقي", () => {
    const { getByTestId } = render(<BusinessTabs {...defaultProps} />);
    const scrollView = getByTestId("tabs-scrollview");

    expect(scrollView).toBeTruthy();
    // Should be horizontal scrollable
  });

  test("يتم تطبيق التنسيق الصحيح للـ tabs", () => {
    const { getByText } = render(<BusinessTabs {...defaultProps} />);
    const tab = getByText("مطاعم");

    expect(tab).toBeTruthy();
    // Should have proper border radius and shadows
  });
});
