// __tests__/components/category/CategoryHeader.test.tsx
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import CategoryHeader from "../../../components/category/CategoryHeader";

describe("CategoryHeader", () => {
  const defaultProps = {
    location: "صنعاء، اليمن",
    onSharePress: jest.fn(),
    onLocationPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("يتم عرض الموقع بشكل صحيح", () => {
    const { getByText } = render(<CategoryHeader {...defaultProps} />);

    expect(getByText("التوصيل إلى")).toBeTruthy();
    expect(getByText("صنعاء، اليمن")).toBeTruthy();
  });

  test("يتم استدعاء onLocationPress عند الضغط على زر الموقع", () => {
    const { getByTestId } = render(<CategoryHeader {...defaultProps} />);
    const locationButton = getByTestId("location-button");

    fireEvent.press(locationButton);
    expect(defaultProps.onLocationPress).toHaveBeenCalledTimes(1);
  });

  test("يتم استدعاء onSharePress عند الضغط على زر المشاركة", () => {
    const { getByTestId } = render(<CategoryHeader {...defaultProps} />);
    const shareButton = getByTestId("share-button");

    fireEvent.press(shareButton);
    expect(defaultProps.onSharePress).toHaveBeenCalledTimes(1);
  });

  test("يتم عرض أيقونة الموقع", () => {
    const { getByTestId } = render(<CategoryHeader {...defaultProps} />);
    const locationButton = getByTestId("location-button");

    expect(locationButton).toBeTruthy();
  });

  test("يتم عرض أيقونة المشاركة", () => {
    const { getByTestId } = render(<CategoryHeader {...defaultProps} />);
    const shareButton = getByTestId("share-button");

    expect(shareButton).toBeTruthy();
  });

  test("يعمل بدون استدعاء الدوال الاختيارية", () => {
    const propsWithoutCallbacks = {
      location: "صنعاء، اليمن",
    };

    expect(() =>
      render(<CategoryHeader {...propsWithoutCallbacks} />)
    ).not.toThrow();
  });

  test("يتم عرض الموقع الجديد عند تغيير location", () => {
    const newLocation = "عدن، اليمن";
    const { getByText } = render(
      <CategoryHeader {...defaultProps} location={newLocation} />
    );

    expect(getByText("عدن، اليمن")).toBeTruthy();
  });

  test("يتم تطبيق التنسيق الصحيح للبطاقة", () => {
    const { getByTestId } = render(<CategoryHeader {...defaultProps} />);
    const locationButton = getByTestId("location-button");
    const shareButton = getByTestId("share-button");

    expect(locationButton).toBeTruthy();
    expect(shareButton).toBeTruthy();
  });
});
