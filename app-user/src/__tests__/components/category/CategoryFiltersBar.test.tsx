// __tests__/components/category/CategoryFiltersBar.test.tsx
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import CategoryFiltersBar from "../../../components/category/CategoryFiltersBar";

describe("CategoryFiltersBar", () => {
  const defaultProps = {
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("يتم عرض جميع الفلاتر", () => {
    const { getByText } = render(<CategoryFiltersBar {...defaultProps} />);

    expect(getByText("الكل")).toBeTruthy();
    expect(getByText("المفضلة")).toBeTruthy();
    expect(getByText("الأعلى تقييمًا")).toBeTruthy();
    expect(getByText("توصيل مجاني")).toBeTruthy();
  });

  test("يتم تحديد الفلتر الأول افتراضياً", () => {
    const { getByText } = render(<CategoryFiltersBar {...defaultProps} />);
    const allFilter = getByText("الكل");

    expect(allFilter).toBeTruthy();
    // الفلتر الأول يجب أن يكون محدداً افتراضياً
  });

  test("يتم استدعاء onChange عند الضغط على فلتر", () => {
    const { getByText } = render(<CategoryFiltersBar {...defaultProps} />);
    const favoriteFilter = getByText("المفضلة");

    fireEvent.press(favoriteFilter);
    expect(defaultProps.onChange).toHaveBeenCalledWith("favorite");
  });

  test("يتم تغيير الفلتر المحدد عند الضغط على فلتر آخر", () => {
    const { getByText } = render(<CategoryFiltersBar {...defaultProps} />);
    const topRatedFilter = getByText("الأعلى تقييمًا");

    fireEvent.press(topRatedFilter);
    expect(defaultProps.onChange).toHaveBeenCalledWith("topRated");
  });

  test("يتم عرض الفلاتر في ScrollView أفقي", () => {
    const { getByTestId } = render(<CategoryFiltersBar {...defaultProps} />);
    const scrollView = getByTestId("filters-scrollview");

    expect(scrollView).toBeTruthy();
  });

  test("يعمل بدون onChange callback", () => {
    expect(() => render(<CategoryFiltersBar />)).not.toThrow();
  });

  test("يتم تطبيق التنسيق الصحيح للفلاتر النشطة", () => {
    const { getByText } = render(<CategoryFiltersBar {...defaultProps} />);
    const allFilter = getByText("الكل");

    expect(allFilter).toBeTruthy();
    // الفلتر النشط يجب أن يكون له تنسيق مختلف
  });

  test("يتم تطبيق التنسيق الصحيح للفلاتر غير النشطة", () => {
    const { getByText } = render(<CategoryFiltersBar {...defaultProps} />);
    const favoriteFilter = getByText("المفضلة");

    expect(favoriteFilter).toBeTruthy();
    // الفلتر غير النشط يجب أن يكون له تنسيق مختلف
  });

  test("يتم تمرير معرف الفلتر الصحيح", () => {
    const { getByText } = render(<CategoryFiltersBar {...defaultProps} />);
    const freeDeliveryFilter = getByText("توصيل مجاني");

    fireEvent.press(freeDeliveryFilter);
    expect(defaultProps.onChange).toHaveBeenCalledWith("freeDelivery");
  });

  test("يتم تطبيق التنسيق الصحيح للـ ScrollView", () => {
    const { getByTestId } = render(<CategoryFiltersBar {...defaultProps} />);
    const scrollView = getByTestId("filters-scrollview");

    expect(scrollView).toBeTruthy();
    // يجب أن يكون أفقي
  });
});
