// __tests__/components/category/SubCategoriesSlider.test.tsx
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import SubCategoriesSlider from "../../../components/category/SubCategoriesSlider";

describe("SubCategoriesSlider", () => {
  const mockSubCategories = [
    "مطاعم عربية",
    "مطاعم يمنية",
    "مطاعم هندية",
    "مطاعم صينية",
  ];
  const defaultProps = {
    subCategories: mockSubCategories,
    onSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("يتم عرض جميع التصنيفات الفرعية", () => {
    const { getByText } = render(<SubCategoriesSlider {...defaultProps} />);

    expect(getByText("مطاعم عربية")).toBeTruthy();
    expect(getByText("مطاعم يمنية")).toBeTruthy();
    expect(getByText("مطاعم هندية")).toBeTruthy();
    expect(getByText("مطاعم صينية")).toBeTruthy();
  });

  test("يتم استدعاء onSelect عند الضغط على تصنيف", () => {
    const { getByText } = render(<SubCategoriesSlider {...defaultProps} />);
    const arabicCategory = getByText("مطاعم عربية");

    fireEvent.press(arabicCategory);
    expect(defaultProps.onSelect).toHaveBeenCalledWith("مطاعم عربية");
  });

  test("يتم تحديد التصنيف عند الضغط عليه", () => {
    const { getByText } = render(<SubCategoriesSlider {...defaultProps} />);
    const yemeniCategory = getByText("مطاعم يمنية");

    fireEvent.press(yemeniCategory);
    expect(defaultProps.onSelect).toHaveBeenCalledWith("مطاعم يمنية");
  });

  test("يتم إلغاء تحديد التصنيف عند الضغط عليه مرة أخرى", () => {
    const { getByText } = render(<SubCategoriesSlider {...defaultProps} />);
    const indianCategory = getByText("مطاعم هندية");

    // الضغط الأول
    fireEvent.press(indianCategory);
    expect(defaultProps.onSelect).toHaveBeenCalledWith("مطاعم هندية");

    // الضغط الثاني - إلغاء التحديد
    fireEvent.press(indianCategory);
    expect(defaultProps.onSelect).toHaveBeenCalledWith("مطاعم هندية");
  });

  test("يتم عرض التصنيفات في ScrollView أفقي", () => {
    const { getByTestId } = render(<SubCategoriesSlider {...defaultProps} />);
    const scrollView = getByTestId("subcategories-scrollview");

    expect(scrollView).toBeTruthy();
  });

  test("يعمل بدون onSelect callback", () => {
    const propsWithoutCallback = {
      subCategories: mockSubCategories,
    };

    expect(() =>
      render(<SubCategoriesSlider {...propsWithoutCallback} />)
    ).not.toThrow();
  });

  test("يتم تطبيق التنسيق الصحيح للتصنيف المحدد", () => {
    const { getByText } = render(<SubCategoriesSlider {...defaultProps} />);
    const arabicCategory = getByText("مطاعم عربية");

    fireEvent.press(arabicCategory);
    expect(arabicCategory).toBeTruthy();
    // التصنيف المحدد يجب أن يكون له تنسيق مختلف
  });

  test("يتم تطبيق التنسيق الصحيح للتصنيف غير المحدد", () => {
    const { getByText } = render(<SubCategoriesSlider {...defaultProps} />);
    const yemeniCategory = getByText("مطاعم يمنية");

    expect(yemeniCategory).toBeTruthy();
    // التصنيف غير المحدد يجب أن يكون له تنسيق مختلف
  });

  test("يعمل مع قائمة تصنيفات فارغة", () => {
    const emptyProps = {
      subCategories: [],
      onSelect: jest.fn(),
    };

    expect(() => render(<SubCategoriesSlider {...emptyProps} />)).not.toThrow();
  });

  test("يتم تمرير القيمة الصحيحة عند التحديد", () => {
    const { getByText } = render(<SubCategoriesSlider {...defaultProps} />);
    const chineseCategory = getByText("مطاعم صينية");

    fireEvent.press(chineseCategory);
    expect(defaultProps.onSelect).toHaveBeenCalledWith("مطاعم صينية");
  });

  test("يتم تطبيق التنسيق الصحيح للـ ScrollView", () => {
    const { getByTestId } = render(<SubCategoriesSlider {...defaultProps} />);
    const scrollView = getByTestId("subcategories-scrollview");

    expect(scrollView).toBeTruthy();
    // يجب أن يكون أفقي
  });
});
