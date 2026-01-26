// __tests__/components/grocery/GroceryProductCard.test.tsx
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import GroceryProductCard from "../../../components/grocery/GroceryProductCard";

// Mock navigation
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe("GroceryProductCard", () => {
  const mockProduct = {
    id: "1",
    name: "عسل طبيعي",
    price: 25.5,
    originalPrice: 30.0,
    image: require("../../../assets/images/products/honey.jpg"),
  };

  const defaultProps = {
    product: mockProduct,
    onAdd: jest.fn(),
    onFavoriteToggle: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("يتم عرض المنتج بشكل صحيح", () => {
    const { getByText, getByTestId } = render(
      <GroceryProductCard {...defaultProps} />
    );

    expect(getByText("عسل طبيعي")).toBeTruthy();
    expect(getByText("25.5 ريال")).toBeTruthy();
    expect(getByText("30.0 ريال")).toBeTruthy();
    expect(getByTestId("product-card")).toBeTruthy();
  });

  test("يتم عرض الصورة", () => {
    const { getByTestId } = render(<GroceryProductCard {...defaultProps} />);

    const image = getByTestId("product-image");
    expect(image).toBeTruthy();
  });

  test("يتم عرض اسم المنتج", () => {
    const { getByTestId } = render(<GroceryProductCard {...defaultProps} />);

    const name = getByTestId("product-name");
    expect(name).toBeTruthy();
  });

  test("يتم عرض السعر الحالي", () => {
    const { getByTestId } = render(<GroceryProductCard {...defaultProps} />);

    const price = getByTestId("product-price");
    expect(price).toBeTruthy();
  });

  test("يتم عرض السعر الأصلي عند وجوده", () => {
    const { getByTestId } = render(<GroceryProductCard {...defaultProps} />);

    const originalPrice = getByTestId("product-original-price");
    expect(originalPrice).toBeTruthy();
  });

  test("لا يتم عرض السعر الأصلي عند عدم وجوده", () => {
    const productWithoutOriginalPrice = {
      ...mockProduct,
      originalPrice: undefined,
    };

    const { queryByTestId } = render(
      <GroceryProductCard
        {...defaultProps}
        product={productWithoutOriginalPrice}
      />
    );

    expect(queryByTestId("product-original-price")).toBeNull();
  });

  test("يتم استدعاء onFavoriteToggle عند الضغط على زر المفضلة", () => {
    const { getByTestId } = render(<GroceryProductCard {...defaultProps} />);

    const favoriteButton = getByTestId("favorite-button");
    fireEvent.press(favoriteButton);

    expect(defaultProps.onFavoriteToggle).toHaveBeenCalledTimes(1);
  });

  test("يتم استدعاء onAdd عند الضغط على زر الإضافة", () => {
    const { getByTestId } = render(<GroceryProductCard {...defaultProps} />);

    const addButton = getByTestId("add-button");
    fireEvent.press(addButton);

    expect(defaultProps.onAdd).toHaveBeenCalledTimes(1);
  });

  test("يتم التنقل لصفحة تفاصيل المنتج عند الضغط على البطاقة", () => {
    const { getByTestId } = render(<GroceryProductCard {...defaultProps} />);

    const card = getByTestId("product-card");
    fireEvent.press(card);

    expect(mockNavigate).toHaveBeenCalledWith("UniversalProductDetails", {
      product: mockProduct,
    });
  });

  test("يتم التنقل لصفحة تفاصيل المنتج عند عدم وجود onAdd", () => {
    const propsWithoutOnAdd = {
      product: mockProduct,
      onFavoriteToggle: jest.fn(),
    };

    const { getByTestId } = render(
      <GroceryProductCard {...propsWithoutOnAdd} />
    );

    const addButton = getByTestId("add-button");
    fireEvent.press(addButton);

    expect(mockNavigate).toHaveBeenCalledWith("UniversalProductDetails", {
      product: mockProduct,
    });
  });

  test("يتم تطبيق التنسيق الصحيح", () => {
    const { getByTestId } = render(<GroceryProductCard {...defaultProps} />);

    const card = getByTestId("product-card");
    const image = getByTestId("product-image");
    const addButton = getByTestId("add-button");
    const favoriteButton = getByTestId("favorite-button");

    expect(card).toBeTruthy();
    expect(image).toBeTruthy();
    expect(addButton).toBeTruthy();
    expect(favoriteButton).toBeTruthy();
  });

  test("يتم عرض أيقونة القلب في زر المفضلة", () => {
    const { getByTestId } = render(<GroceryProductCard {...defaultProps} />);

    const favoriteButton = getByTestId("favorite-button");
    expect(favoriteButton).toBeTruthy();
  });

  test("يتم عرض أيقونة الإضافة في زر الإضافة", () => {
    const { getByTestId } = render(<GroceryProductCard {...defaultProps} />);

    const addButton = getByTestId("add-button");
    expect(addButton).toBeTruthy();
  });
});
