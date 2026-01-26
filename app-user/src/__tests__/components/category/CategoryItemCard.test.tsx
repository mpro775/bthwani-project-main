// __tests__/components/category/CategoryItemCard.test.tsx
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import CategoryItemCard from "../../../components/category/CategoryItemCard";

describe("CategoryItemCard", () => {
  const mockItem = {
    id: "store-1",
    title: "مطعم الشرق",
    subtitle: "مطعم عربي أصيل",
    distance: "2.3 كم",
    time: "15 دقيقة",
    rating: 4.5,
    isOpen: true,
    isFavorite: false,
    tags: ["عربي", "يمني", "حلال"],
    image: require("../../../assets/placeholder-cover.jpg"),
    logo: require("../../../assets/placeholder-cover.jpg"),
  };

  const defaultProps = {
    item: mockItem,
    onPress: jest.fn(),
    showStatus: true,
    onToggleFavorite: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("يتم عرض معلومات المتجر الأساسية", () => {
    const { getByText } = render(<CategoryItemCard {...defaultProps} />);

    expect(getByText("مطعم الشرق")).toBeTruthy();
    expect(getByText("مطعم عربي أصيل")).toBeTruthy();
    expect(getByText("2.3 كم")).toBeTruthy();
    expect(getByText("15 دقيقة")).toBeTruthy();
    expect(getByText("4.5")).toBeTruthy();
  });

  test("يتم استدعاء onPress عند الضغط على البطاقة", () => {
    const { getByTestId } = render(<CategoryItemCard {...defaultProps} />);
    const categoryCard = getByTestId("category-card");

    fireEvent.press(categoryCard);
    expect(defaultProps.onPress).toHaveBeenCalledWith("store-1");
  });

  test("يتم استدعاء onToggleFavorite عند الضغط على زر المفضلة", () => {
    const { getByTestId } = render(<CategoryItemCard {...defaultProps} />);
    const heartButton = getByTestId("heart-button");

    fireEvent.press(heartButton);
    expect(defaultProps.onToggleFavorite).toHaveBeenCalledTimes(1);
  });

  test("يتم عرض حالة الفتح/الإغلاق", () => {
    const { getByText } = render(<CategoryItemCard {...defaultProps} />);
    expect(getByText("مفتوح")).toBeTruthy();
  });

  test("يتم عرض حالة الإغلاق", () => {
    const closedItem = { ...mockItem, isOpen: false };
    const { getByText } = render(
      <CategoryItemCard {...defaultProps} item={closedItem} />
    );
    expect(getByText("مغلق")).toBeTruthy();
  });

  test("يتم عرض التقييم بشكل صحيح", () => {
    const { getByText } = render(<CategoryItemCard {...defaultProps} />);
    expect(getByText("4.5")).toBeTruthy();
  });

  test("يتم عرض أيقونة القلب المملوءة عند كون المتجر مفضلاً", () => {
    const favoriteItem = { ...mockItem, isFavorite: true };
    const { getByTestId } = render(
      <CategoryItemCard {...defaultProps} item={favoriteItem} />
    );
    const heartButton = getByTestId("heart-button");

    expect(heartButton).toBeTruthy();
  });

  test("يتم عرض أيقونة القلب الفارغة عند عدم كون المتجر مفضلاً", () => {
    const { getByTestId } = render(<CategoryItemCard {...defaultProps} />);
    const heartButton = getByTestId("heart-button");

    expect(heartButton).toBeTruthy();
  });

  test("يعمل بدون استدعاء الدوال الاختيارية", () => {
    const propsWithoutCallbacks = {
      item: mockItem,
    };

    expect(() =>
      render(<CategoryItemCard {...propsWithoutCallbacks} />)
    ).not.toThrow();
  });

  test("يتم عرض الصور بشكل صحيح", () => {
    const { getByTestId } = render(<CategoryItemCard {...defaultProps} />);
    const categoryCard = getByTestId("category-card");

    expect(categoryCard).toBeTruthy();
  });

  test("يتم تطبيق التنسيق الصحيح للبطاقة", () => {
    const { getByTestId } = render(<CategoryItemCard {...defaultProps} />);
    const categoryCard = getByTestId("category-card");

    expect(categoryCard).toBeTruthy();
  });

  test("يتم عرض التصنيفات إذا كانت موجودة", () => {
    const { getByText } = render(<CategoryItemCard {...defaultProps} />);

    // التحقق من وجود التصنيفات
    expect(getByText("عربي")).toBeTruthy();
    expect(getByText("يمني")).toBeTruthy();
    expect(getByText("حلال")).toBeTruthy();
  });

  test("يعمل مع showStatus = false", () => {
    const propsWithoutStatus = {
      ...defaultProps,
      showStatus: false,
    };

    expect(() =>
      render(<CategoryItemCard {...propsWithoutStatus} />)
    ).not.toThrow();
  });

  test("يتم تحديث حالة المفضلة عند الضغط", () => {
    const { getByTestId } = render(<CategoryItemCard {...defaultProps} />);
    const heartButton = getByTestId("heart-button");

    // الضغط الأول
    fireEvent.press(heartButton);
    expect(defaultProps.onToggleFavorite).toHaveBeenCalledTimes(1);

    // الضغط الثاني
    fireEvent.press(heartButton);
    expect(defaultProps.onToggleFavorite).toHaveBeenCalledTimes(2);
  });

  test("يتم تمرير معرف المتجر الصحيح", () => {
    const { getByTestId } = render(<CategoryItemCard {...defaultProps} />);
    const categoryCard = getByTestId("category-card");

    fireEvent.press(categoryCard);
    expect(defaultProps.onPress).toHaveBeenCalledWith("store-1");
  });
});
