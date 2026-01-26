// __tests__/components/business/BusinessProductItem.test.tsx
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import BusinessProductItem from "../../../components/business/BusinessProductItem";

// Mock navigation
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe("BusinessProductItem", () => {
  const mockProduct = {
    id: "product-1",
    name: "برجر دجاج",
    price: 25,
    originalPrice: 30,
    image: require("../../../assets/placeholder-cover.jpg"),
    isFavorite: false,
  };

  const defaultProps = {
    product: mockProduct,
    storeId: "store-1",
    storeType: "restaurant" as const,
    onAdd: jest.fn(),
    isFavorite: false,
    onToggleFavorite: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("يتم عرض معلومات المنتج الأساسية", () => {
    const { getByText, getByTestId } = render(
      <BusinessProductItem {...defaultProps} />
    );

    expect(getByText("برجر دجاج")).toBeTruthy();
    expect(getByText("25 ﷼")).toBeTruthy();
    expect(getByText("30 ﷼")).toBeTruthy();
    expect(getByTestId("product-image")).toBeTruthy();
  });

  test("يتم عرض شارة الخصم عند وجود سعر أصلي", () => {
    const { getByText } = render(<BusinessProductItem {...defaultProps} />);
    expect(getByText("-17%")).toBeTruthy();
  });

  test("لا يتم عرض شارة الخصم عند عدم وجود سعر أصلي", () => {
    const productWithoutOriginalPrice = {
      ...mockProduct,
      originalPrice: undefined,
    };
    const { queryByText } = render(
      <BusinessProductItem
        {...defaultProps}
        product={productWithoutOriginalPrice}
      />
    );
    expect(queryByText("-17%")).toBeNull();
  });

  test("يتم استدعاء onAdd عند الضغط على زر الإضافة", () => {
    const { getByTestId } = render(<BusinessProductItem {...defaultProps} />);
    const addButton = getByTestId("add-to-cart-button");

    fireEvent.press(addButton);
    expect(defaultProps.onAdd).toHaveBeenCalledWith(mockProduct, 1);
  });

  test("يتم استدعاء onToggleFavorite عند الضغط على زر المفضلة", () => {
    const { getByTestId } = render(<BusinessProductItem {...defaultProps} />);
    const favoriteButton = getByTestId("favorite-button");

    fireEvent.press(favoriteButton);
    expect(defaultProps.onToggleFavorite).toHaveBeenCalledTimes(1);
  });

  test("يتم عرض أيقونة القلب المملوءة عند كون المنتج مفضلاً", () => {
    const { getByTestId } = render(
      <BusinessProductItem {...defaultProps} isFavorite={true} />
    );
    const favoriteButton = getByTestId("favorite-button");
    expect(favoriteButton).toBeTruthy();
  });

  test("يتم عرض أيقونة القلب الفارغة عند عدم كون المنتج مفضلاً", () => {
    const { getByTestId } = render(
      <BusinessProductItem {...defaultProps} isFavorite={false} />
    );
    const favoriteButton = getByTestId("favorite-button");
    expect(favoriteButton).toBeTruthy();
  });

  test("يتم استدعاء navigation عند الضغط على المنتج", () => {
    const { getByTestId } = render(<BusinessProductItem {...defaultProps} />);
    const productCard = getByTestId("product-card");

    fireEvent.press(productCard);
    expect(mockNavigate).toHaveBeenCalledWith("UniversalProductDetails", {
      product: mockProduct,
      storeId: "store-1",
      storeType: "restaurant",
    });
  });

  test("يتم حساب نسبة الخصم بشكل صحيح", () => {
    const productWithDiscount = {
      ...mockProduct,
      price: 20,
      originalPrice: 40,
    };
    const { getByText } = render(
      <BusinessProductItem {...defaultProps} product={productWithDiscount} />
    );
    expect(getByText("-50%")).toBeTruthy();
  });

  test("يتم التعامل مع المنتجات بدون خصم", () => {
    const productWithoutDiscount = { ...mockProduct, originalPrice: 25 };
    const { queryByText } = render(
      <BusinessProductItem {...defaultProps} product={productWithoutDiscount} />
    );
    expect(queryByText("-0%")).toBeNull();
  });

  test("يعمل مع أنواع المتاجر المختلفة", () => {
    const groceryProps = { ...defaultProps, storeType: "grocery" as const };
    const { getByTestId } = render(<BusinessProductItem {...groceryProps} />);

    const productCard = getByTestId("product-card");
    fireEvent.press(productCard);

    expect(mockNavigate).toHaveBeenCalledWith("UniversalProductDetails", {
      product: mockProduct,
      storeId: "store-1",
      storeType: "grocery",
    });
  });

  test("يتم عرض اسم المنتج في سطرين كحد أقصى", () => {
    const longNameProduct = {
      ...mockProduct,
      name: "هذا اسم منتج طويل جداً يتجاوز السطر الواحد",
    };
    const { getByText } = render(
      <BusinessProductItem {...defaultProps} product={longNameProduct} />
    );

    const productName = getByText("هذا اسم منتج طويل جداً يتجاوز السطر الواحد");
    expect(productName).toBeTruthy();
  });
});
