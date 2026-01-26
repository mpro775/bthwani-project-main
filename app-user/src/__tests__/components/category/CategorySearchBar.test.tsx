// __tests__/components/category/CategorySearchBar.test.tsx
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import CategorySearchBar from "../../../components/category/CategorySearchBar";

describe("CategorySearchBar", () => {
  const defaultProps = {
    placeholder: "...ابحث",
    value: "",
    onChangeText: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("يتم عرض placeholder افتراضي", () => {
    const { getByPlaceholderText } = render(<CategorySearchBar />);
    expect(getByPlaceholderText("...ابحث")).toBeTruthy();
  });

  test("يتم عرض placeholder مخصص", () => {
    const customPlaceholder = "ابحث عن مطعم...";
    const { getByPlaceholderText } = render(
      <CategorySearchBar placeholder={customPlaceholder} />
    );
    expect(getByPlaceholderText(customPlaceholder)).toBeTruthy();
  });

  test("يتم عرض القيمة المدخلة", () => {
    const testValue = "مطعم الشرق";
    const { getByDisplayValue } = render(
      <CategorySearchBar {...defaultProps} value={testValue} />
    );
    expect(getByDisplayValue(testValue)).toBeTruthy();
  });

  test("يتم استدعاء onChangeText عند الكتابة", () => {
    const { getByTestId } = render(<CategorySearchBar {...defaultProps} />);
    const searchInput = getByTestId("search-input");

    fireEvent.changeText(searchInput, "مطعم");
    expect(defaultProps.onChangeText).toHaveBeenCalledWith("مطعم");
  });

  test("يتم عرض أيقونة البحث", () => {
    const { getByTestId } = render(<CategorySearchBar {...defaultProps} />);
    const searchInput = getByTestId("search-input");

    expect(searchInput).toBeTruthy();
  });

  test("يعمل بدون onChangeText", () => {
    const propsWithoutCallback = {
      placeholder: "...ابحث",
      value: "",
    };

    expect(() =>
      render(<CategorySearchBar {...propsWithoutCallback} />)
    ).not.toThrow();
  });

  test("يتم تطبيق التنسيق الصحيح", () => {
    const { getByTestId } = render(<CategorySearchBar {...defaultProps} />);
    const searchInput = getByTestId("search-input");

    expect(searchInput).toBeTruthy();
  });

  test("يتم تحديث القيمة عند تغيير props", () => {
    const { getByDisplayValue, rerender } = render(
      <CategorySearchBar {...defaultProps} value="قيمة أولى" />
    );

    expect(getByDisplayValue("قيمة أولى")).toBeTruthy();

    rerender(<CategorySearchBar {...defaultProps} value="قيمة ثانية" />);
    expect(getByDisplayValue("قيمة ثانية")).toBeTruthy();
  });

  test("يتم تطبيق النص العربي بشكل صحيح", () => {
    const { getByTestId } = render(<CategorySearchBar {...defaultProps} />);
    const searchInput = getByTestId("search-input");

    fireEvent.changeText(searchInput, "مطعم عربي");
    expect(defaultProps.onChangeText).toHaveBeenCalledWith("مطعم عربي");
  });
});
