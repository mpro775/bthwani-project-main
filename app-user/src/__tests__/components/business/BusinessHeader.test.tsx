// __tests__/components/business/BusinessHeader.test.tsx
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import BusinessHeader from "../../../components/business/BusinessHeader";

// Mock expo-linear-gradient
jest.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradient",
}));

describe("BusinessHeader", () => {
  const defaultProps = {
    image: require("../../../assets/placeholder-cover.jpg"),
    onBackPress: jest.fn(),
    onSharePress: jest.fn(),
    onFavoritePress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("يتم عرض صورة الغلاف", () => {
    const { getByTestId } = render(<BusinessHeader {...defaultProps} />);
    const coverImage = getByTestId("cover-image");
    expect(coverImage).toBeTruthy();
  });

  test("يتم استدعاء onBackPress عند الضغط على زر العودة", () => {
    const { getByTestId } = render(<BusinessHeader {...defaultProps} />);
    const backButton = getByTestId("back-button");

    fireEvent.press(backButton);
    expect(defaultProps.onBackPress).toHaveBeenCalledTimes(1);
  });

  test("يتم استدعاء onFavoritePress عند الضغط على زر المفضلة", () => {
    const { getByTestId } = render(<BusinessHeader {...defaultProps} />);
    const favoriteButton = getByTestId("favorite-button");

    fireEvent.press(favoriteButton);
    expect(defaultProps.onFavoritePress).toHaveBeenCalledTimes(1);
  });

  test("يتم استدعاء onSharePress عند الضغط على زر المشاركة", () => {
    const { getByTestId } = render(<BusinessHeader {...defaultProps} />);
    const shareButton = getByTestId("share-button");

    fireEvent.press(shareButton);
    expect(defaultProps.onSharePress).toHaveBeenCalledTimes(1);
  });

  test("يتم عرض جميع الأزرار مع الأيقونات الصحيحة", () => {
    const { getByTestId } = render(<BusinessHeader {...defaultProps} />);

    expect(getByTestId("back-button")).toBeTruthy();
    expect(getByTestId("favorite-button")).toBeTruthy();
    expect(getByTestId("share-button")).toBeTruthy();
  });

  test("يعمل بدون استدعاء الدوال الاختيارية", () => {
    const propsWithoutCallbacks = {
      image: defaultProps.image,
    };

    expect(() =>
      render(<BusinessHeader {...propsWithoutCallbacks} />)
    ).not.toThrow();
  });
});
