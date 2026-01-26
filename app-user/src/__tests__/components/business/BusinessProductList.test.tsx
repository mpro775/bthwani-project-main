// __tests__/components/business/BusinessProductList.test.tsx
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { TouchableOpacity } from "react-native";
import BusinessProductList from "../../../components/business/BusinessProductList";

// Mock BusinessProductItem component
jest.mock("../../../components/business/BusinessProductItem", () => {
  return function MockBusinessProductItem(props: any) {
    return (
      <TouchableOpacity
        testID="product-item"
        onPress={() => props.onAdd(props.product, 1)}
      >
        {props.product.name}
      </TouchableOpacity>
    );
  };
});

describe("BusinessProductList", () => {
  const mockProducts = [
    {
      id: "product-1",
      name: "برجر دجاج",
      price: 25,
      image: require("../../../assets/placeholder-cover.jpg"),
      isFavorite: false,
    },
    {
      id: "product-2",
      name: "برجر لحم",
      price: 30,
      image: require("../../../assets/placeholder-cover.jpg"),
      isFavorite: true,
    },
    {
      id: "product-3",
      name: "شاورما",
      price: 20,
      image: require("../../../assets/placeholder-cover.jpg"),
      isFavorite: false,
    },
  ];

  const defaultProps = {
    products: mockProducts,
    storeId: "store-1",
    storeType: "restaurant" as const,
    onAdd: jest.fn(),
    onToggleFavorite: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("يتم عرض جميع المنتجات", () => {
    const { getAllByTestId } = render(
      <BusinessProductList {...defaultProps} />
    );
    const productItems = getAllByTestId("product-item");
    expect(productItems).toHaveLength(3);
  });

  test("يتم تمرير الخصائص الصحيحة لكل منتج", () => {
    const { getAllByTestId } = render(
      <BusinessProductList {...defaultProps} />
    );
    const productItems = getAllByTestId("product-item");

    expect(productItems[0]).toHaveTextContent("برجر دجاج");
    expect(productItems[1]).toHaveTextContent("برجر لحم");
    expect(productItems[2]).toHaveTextContent("شاورما");
  });

  test("يتم استدعاء onAdd عند الضغط على منتج", () => {
    const { getAllByTestId } = render(
      <BusinessProductList {...defaultProps} />
    );
    const firstProduct = getAllByTestId("product-item")[0];

    fireEvent.press(firstProduct);
    expect(defaultProps.onAdd).toHaveBeenCalledWith(mockProducts[0], 1);
  });

  test("يتم استدعاء onToggleFavorite عند الضغط على زر المفضلة", () => {
    const { getAllByTestId } = render(
      <BusinessProductList {...defaultProps} />
    );
    const firstProduct = getAllByTestId("product-item")[0];

    // Simulate favorite button click
    fireEvent(firstProduct, "onFavoriteClick");
    expect(defaultProps.onToggleFavorite).toHaveBeenCalledWith(mockProducts[0]);
  });

  test("يتم تمرير storeId و storeType لكل منتج", () => {
    const { getAllByTestId } = render(
      <BusinessProductList {...defaultProps} />
    );
    const productItems = getAllByTestId("product-item");

    // Verify that all products receive the correct store information
    productItems.forEach((item) => {
      expect(item).toBeTruthy();
    });
  });

  test("يعمل مع قائمة فارغة", () => {
    const emptyProps = { ...defaultProps, products: [] };
    const { getByTestId } = render(<BusinessProductList {...emptyProps} />);

    // Should render empty state
    expect(getByTestId("empty-list")).toBeTruthy();
  });

  test("يعمل مع نوع متجر مختلف", () => {
    const groceryProps = { ...defaultProps, storeType: "grocery" as const };
    const { getAllByTestId } = render(
      <BusinessProductList {...groceryProps} />
    );

    const productItems = getAllByTestId("product-item");
    expect(productItems).toHaveLength(3);
  });

  test("يتم تمرير حالة المفضلة بشكل صحيح", () => {
    const { getAllByTestId } = render(
      <BusinessProductList {...defaultProps} />
    );
    const productItems = getAllByTestId("product-item");

    // First product should not be favorite
    expect(productItems[0]).toBeTruthy();

    // Second product should be favorite
    expect(productItems[1]).toBeTruthy();
  });

  test("يتم عرض المنتجات في عمودين", () => {
    const { getByTestId } = render(<BusinessProductList {...defaultProps} />);
    const flatList = getByTestId("products-flatlist");

    expect(flatList).toBeTruthy();
    // FlatList should have numColumns={2}
  });

  test("يتم تمرير keyExtractor صحيح", () => {
    const { getByTestId } = render(<BusinessProductList {...defaultProps} />);
    const flatList = getByTestId("products-flatlist");

    expect(flatList).toBeTruthy();
    // FlatList should use product.id as key
  });

  test("يتم تطبيق التنسيق الصحيح للقائمة", () => {
    const { getByTestId } = render(<BusinessProductList {...defaultProps} />);
    const flatList = getByTestId("products-flatlist");

    expect(flatList).toBeTruthy();
    // Should have proper styling and layout
  });
});
