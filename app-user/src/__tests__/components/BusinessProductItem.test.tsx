// __tests__/BusinessProductItem.test.tsx
import React from "react";
import { Text, View } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { fireEvent, render } from "@testing-library/react-native";
import BusinessProductItem from "../../components/business/BusinessProductItem";

// Mock Ionicons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

// Mock React Navigation
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

const Stack = createNativeStackNavigator();
// شاشة ثابتة لتفاصيل المنتج (بدون inline)
function DetailsScreen() {
  return (
    <View testID="details-screen">
      <Text>Product Details</Text>
    </View>
  );
}
const MockNavigator = ({ children }: { children: React.ReactNode }) => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Test">{() => <>{children}</>}</Stack.Screen>
      <Stack.Screen name="UniversalProductDetails" component={DetailsScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);
const mockProduct = {
  id: "product-1",
  _id: "product-1",
  name: "برجر دجاج",
  price: 25,
  originalPrice: 30,
  image: { uri: "https://example.com/burger.jpg" },
  description: "برجر دجاج طازج",
  category: "وجبات سريعة",
  isFavorite: false,
  available: true,
  preparationTime: 15,
  calories: 350,
  ingredients: ["دجاج", "خبز", "خضروات"],
  allergens: ["جلوتين"],
  nutritionalInfo: {
    protein: 25,
    carbs: 30,
    fat: 15,
  },
};

const mockProps = {
  product: mockProduct,
  storeId: "store-1",
  storeType: "restaurant" as const,
  onAdd: jest.fn(),
  isFavorite: false,
  onToggleFavorite: jest.fn(),
};

describe("BusinessProductItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  test("يعرض معلومات المنتج الأساسية", () => {
    const { getByText } = render(
      <MockNavigator>
        <BusinessProductItem {...mockProps} />
      </MockNavigator>
    );

    expect(getByText("برجر دجاج")).toBeTruthy();
    expect(getByText("25 ﷼")).toBeTruthy();
    expect(getByText("30 ﷼")).toBeTruthy();
  });

  test("يعرض صورة المنتج", () => {
    const { getByTestId } = render(
      <MockNavigator>
        <BusinessProductItem {...mockProps} />
      </MockNavigator>
    );

    const productImage = getByTestId("product-image");
    expect(productImage).toBeTruthy();
    expect(productImage.props.source).toEqual({
      uri: "https://example.com/burger.jpg",
    });
  });

  test("يعرض شارة الخصم عند وجود سعر أصلي أعلى", () => {
    const { getByText } = render(
      <MockNavigator>
        <BusinessProductItem {...mockProps} />
      </MockNavigator>
    );

    expect(getByText("-17%")).toBeTruthy();
  });

  test("لا يعرض شارة الخصم عند عدم وجود سعر أصلي", () => {
    const productWithoutOriginalPrice = {
      ...mockProduct,
      originalPrice: undefined,
    };

    const { queryByText } = render(
      <MockNavigator>
        <BusinessProductItem
          {...mockProps}
          product={productWithoutOriginalPrice}
        />
      </MockNavigator>
    );

    expect(queryByText(/-[0-9]+%/)).toBeNull();
  });

  test("يعرض أيقونة القلب المفضلة", () => {
    const { getByTestId } = render(
      <MockNavigator>
        <BusinessProductItem {...mockProps} />
      </MockNavigator>
    );

    const favoriteButton = getByTestId("favorite-button");
    expect(favoriteButton).toBeTruthy();
  });

  test("يغير حالة المفضلة عند الضغط على القلب", () => {
    const { getByTestId } = render(
      <MockNavigator>
        <BusinessProductItem {...mockProps} />
      </MockNavigator>
    );

    const favoriteButton = getByTestId("favorite-button");
    fireEvent.press(favoriteButton);

    expect(mockProps.onToggleFavorite).toHaveBeenCalledTimes(1);
  });

  test("يعرض أيقونة القلب المملوءة عند كون المنتج مفضلاً", () => {
    const { getByTestId } = render(
      <MockNavigator>
        <BusinessProductItem {...mockProps} isFavorite={true} />
      </MockNavigator>
    );

    const favoriteButton = getByTestId("favorite-button");
    expect(favoriteButton).toBeTruthy();
  });

  test("يعرض زر الإضافة للسلة", () => {
    const { getByTestId } = render(
      <MockNavigator>
        <BusinessProductItem {...mockProps} />
      </MockNavigator>
    );

    const addButton = getByTestId("add-to-cart-button");
    expect(addButton).toBeTruthy();
  });

  test("يضيف المنتج للسلة عند الضغط على زر الإضافة", () => {
    const { getByTestId } = render(
      <MockNavigator>
        <BusinessProductItem {...mockProps} />
      </MockNavigator>
    );

    const addButton = getByTestId("add-to-cart-button");
    fireEvent.press(addButton);

    expect(mockProps.onAdd).toHaveBeenCalledWith(mockProduct, 1);
  });

  test("ينتقل لتفاصيل المنتج عند الضغط على البطاقة", () => {
    const { getByTestId } = render(
      <MockNavigator>
        <BusinessProductItem {...mockProps} />
      </MockNavigator>
    );

    const productCard = getByTestId("product-card");
    fireEvent.press(productCard);

    expect(mockNavigate).toHaveBeenCalledWith("UniversalProductDetails", {
      product: mockProduct,
      storeId: "store-1",
      storeType: "restaurant",
    });
  });

  test("يحدد النص بحد أقصى سطرين", () => {
    const { getByText } = render(
      <MockNavigator>
        <BusinessProductItem {...mockProps} />
      </MockNavigator>
    );

    const productName = getByText("برجر دجاج");
    expect(productName.props.numberOfLines).toBe(2);
  });

  test("يتعامل مع المنتجات بدون سعر أصلي", () => {
    const productWithoutOriginalPrice = {
      ...mockProduct,
      originalPrice: undefined,
    };

    const { getByText, queryByTestId } = render(
      <MockNavigator>
        <BusinessProductItem
          {...mockProps}
          product={productWithoutOriginalPrice}
        />
      </MockNavigator>
    );

    expect(getByText("25 ﷼")).toBeTruthy();
    expect(queryByTestId("original-price")).toBeNull(); // ✅ ما في سعر أصلي
  });

  test("يتعامل مع المنتجات بدون صورة", () => {
    const productWithoutImage = {
      ...mockProduct,
      image: undefined,
    };

    const { getByTestId } = render(
      <MockNavigator>
        <BusinessProductItem {...mockProps} product={productWithoutImage} />
      </MockNavigator>
    );

    const productImage = getByTestId("product-image");
    expect(productImage).toBeTruthy();
  });

  test("يحسب نسبة الخصم بشكل صحيح", () => {
    const productWithDiscount = {
      ...mockProduct,
      price: 20,
      originalPrice: 40,
    };

    const { getByText } = render(
      <MockNavigator>
        <BusinessProductItem {...mockProps} product={productWithDiscount} />
      </MockNavigator>
    );

    expect(getByText("-50%")).toBeTruthy();
  });

  test("يتعامل مع النقر المتعدد على الأزرار", () => {
    const { getByTestId } = render(
      <MockNavigator>
        <BusinessProductItem {...mockProps} />
      </MockNavigator>
    );

    const addButton = getByTestId("add-to-cart-button");
    const favoriteButton = getByTestId("favorite-button");

    // النقر عدة مرات
    fireEvent.press(addButton);
    fireEvent.press(addButton);
    fireEvent.press(favoriteButton);
    fireEvent.press(favoriteButton);

    expect(mockProps.onAdd).toHaveBeenCalledTimes(2);
    expect(mockProps.onToggleFavorite).toHaveBeenCalledTimes(2);
  });
});
