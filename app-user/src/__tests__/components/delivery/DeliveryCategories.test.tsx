// __tests__/components/delivery/DeliveryCategories.test.tsx
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import DeliveryCategories from "../../../components/delivery/DeliveryCategories";

// Mock للـ navigation
const mockNavigate = jest.fn();

// Mock للـ fetch
global.fetch = jest.fn();

// إنشاء navigator للاختبار
const Stack = createNativeStackNavigator();

const TestScreen = () => <DeliveryCategories />;
const CategoryDetailsScreen = () => null;
const GroceryMainScreen = () => null;
const SheinScreen = () => null;
const WasliScreen = () => null;
const FazaaScreen = () => null;

const TestNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="TestScreen" component={TestScreen} />
      <Stack.Screen name="CategoryDetails" component={CategoryDetailsScreen} />
      <Stack.Screen name="GroceryMainScreen" component={GroceryMainScreen} />
      <Stack.Screen name="SheinScreen" component={SheinScreen} />
      <Stack.Screen name="WasliScreen" component={WasliScreen} />
      <Stack.Screen name="FazaaScreen" component={FazaaScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

describe("DeliveryCategories", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe("حالة التحميل", () => {
    test("يعرض مؤشر التحميل عند بداية التحميل", () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      const { getByTestId } = render(<TestNavigator />);

      const loadingIndicator = getByTestId("loading-indicator");
      expect(loadingIndicator).toBeTruthy();
    });

    test("يخفي مؤشر التحميل بعد اكتمال التحميل", async () => {
      const mockCategories = [
        { _id: "1", name: "مقاضي", image: "grocery.jpg", parent: null },
        { _id: "2", name: "شي ان", image: "shein.jpg", parent: null },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockCategories,
      });

      const { queryByTestId } = render(<TestNavigator />);

      await waitFor(() => {
        expect(queryByTestId("loading-indicator")).toBeNull();
      });
    });
  });

  describe("عرض الفئات", () => {
    test("يعرض الفئات الرئيسية فقط", async () => {
      const mockCategories = [
        { _id: "1", name: "فئة1", image: "1.jpg", parent: null },
        { _id: "2", name: "فئة2", image: "2.jpg", parent: null },
        { _id: "3", name: "فئة فرعية", image: "sub.jpg", parent: "1" },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockCategories,
      });

      const { getByTestId, queryByTestId } = render(<TestNavigator />);

      await waitFor(() => {
        expect(getByTestId("category-item-1")).toBeTruthy();
        expect(getByTestId("category-item-2")).toBeTruthy();
        expect(queryByTestId("category-item-3")).toBeNull();
      });
    });

    test("يعرض زر عرض الكل", async () => {
      const mockCategories = [
        { _id: "1", name: "فئة1", image: "1.jpg", parent: null },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockCategories,
      });

      const { getByTestId } = render(<TestNavigator />);

      await waitFor(() => {
        expect(getByTestId("show-all-button")).toBeTruthy();
      });
    });

    test("يعرض 5 فئات + زر عرض الكل", async () => {
      const mockCategories = [
        { _id: "1", name: "فئة1", image: "1.jpg", parent: null },
        { _id: "2", name: "فئة2", image: "2.jpg", parent: null },
        { _id: "3", name: "فئة3", image: "3.jpg", parent: null },
        { _id: "4", name: "فئة4", image: "4.jpg", parent: null },
        { _id: "5", name: "فئة5", image: "5.jpg", parent: null },
        { _id: "6", name: "فئة6", image: "6.jpg", parent: null },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockCategories,
      });

      const { getByTestId, queryByTestId } = render(<TestNavigator />);

      await waitFor(() => {
        expect(getByTestId("category-item-1")).toBeTruthy();
        expect(getByTestId("category-item-2")).toBeTruthy();
        expect(getByTestId("category-item-3")).toBeTruthy();
        expect(getByTestId("category-item-4")).toBeTruthy();
        expect(getByTestId("category-item-5")).toBeTruthy();
        expect(queryByTestId("category-item-6")).toBeNull();
        expect(getByTestId("show-all-button")).toBeTruthy();
      });
    });
  });

  describe("التفاعل مع الفئات", () => {
    test("يستجيب للنقر على فئة مقاضي", async () => {
      const mockCategories = [
        { _id: "1", name: "مقاضي", image: "grocery.jpg", parent: null },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockCategories,
      });

      const { getByTestId } = render(<TestNavigator />);

      await waitFor(() => {
        const categoryItem = getByTestId("category-item-1");
        fireEvent.press(categoryItem);
      });
    });

    test("يستجيب للنقر على فئة شي ان", async () => {
      const mockCategories = [
        { _id: "1", name: "شي ان", image: "shein.jpg", parent: null },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockCategories,
      });

      const { getByTestId } = render(<TestNavigator />);

      await waitFor(() => {
        const categoryItem = getByTestId("category-item-1");
        fireEvent.press(categoryItem);
      });
    });

    test("يستجيب للنقر على فئة وصل لي", async () => {
      const mockCategories = [
        { _id: "1", name: "وصل لي", image: "wasli.jpg", parent: null },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockCategories,
      });

      const { getByTestId } = render(<TestNavigator />);

      await waitFor(() => {
        const categoryItem = getByTestId("category-item-1");
        fireEvent.press(categoryItem);
      });
    });

    test("يستجيب للنقر على فئة فزعة", async () => {
      const mockCategories = [
        { _id: "1", name: "فزعة", image: "fazaa.jpg", parent: null },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockCategories,
      });

      const { getByTestId } = render(<TestNavigator />);

      await waitFor(() => {
        const categoryItem = getByTestId("category-item-1");
        fireEvent.press(categoryItem);
      });
    });
  });

  describe("الفئات الفرعية", () => {
    test("يعرض الفئات الفرعية عند النقر على فئة لها أبناء", async () => {
      const mockCategories = [
        { _id: "1", name: "فئة رئيسية", image: "main.jpg", parent: null },
      ];

      const mockSubCategories = [
        { _id: "sub1", name: "فئة فرعية 1", image: "sub1.jpg" },
        { _id: "sub2", name: "فئة فرعية 2", image: "sub2.jpg" },
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => mockCategories,
        })
        .mockResolvedValueOnce({
          json: async () => mockSubCategories,
        });

      const { getByTestId, queryByTestId } = render(<TestNavigator />);

      await waitFor(() => {
        const categoryItem = getByTestId("category-item-1");
        fireEvent.press(categoryItem);
      });

      await waitFor(() => {
        expect(queryByTestId("subcategories-flatlist")).toBeTruthy();
        expect(getByTestId("subcategory-item-sub1")).toBeTruthy();
        expect(getByTestId("subcategory-item-sub2")).toBeTruthy();
      });
    });

    test("يخفي مودال الفئات الفرعية عند النقر على إغلاق", async () => {
      const mockCategories = [
        { _id: "1", name: "فئة رئيسية", image: "main.jpg", parent: null },
      ];

      const mockSubCategories = [
        { _id: "sub1", name: "فئة فرعية 1", image: "sub1.jpg" },
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => mockCategories,
        })
        .mockResolvedValueOnce({
          json: async () => mockSubCategories,
        });

      const { getByTestId, queryByTestId } = render(<TestNavigator />);

      await waitFor(() => {
        const categoryItem = getByTestId("category-item-1");
        fireEvent.press(categoryItem);
      });

      await waitFor(() => {
        const closeButton = getByTestId("close-submodal-button");
        fireEvent.press(closeButton);
      });

      await waitFor(() => {
        expect(queryByTestId("subcategories-flatlist")).toBeNull();
      });
    });
  });

  describe("مودال عرض الكل", () => {
    test("يفتح مودال عرض الكل عند النقر على زر عرض الكل", async () => {
      const mockCategories = [
        { _id: "1", name: "فئة1", image: "1.jpg", parent: null },
        { _id: "2", name: "فئة2", image: "2.jpg", parent: null },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockCategories,
      });

      const { getByTestId, queryByTestId } = render(<TestNavigator />);

      await waitFor(() => {
        const showAllButton = getByTestId("show-all-button");
        fireEvent.press(showAllButton);
      });

      await waitFor(() => {
        expect(queryByTestId("all-categories-flatlist")).toBeTruthy();
        expect(getByTestId("all-category-item-1")).toBeTruthy();
        expect(getByTestId("all-category-item-2")).toBeTruthy();
      });
    });

    test("يخفي مودال عرض الكل عند النقر على إغلاق", async () => {
      const mockCategories = [
        { _id: "1", name: "فئة1", image: "1.jpg", parent: null },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockCategories,
      });

      const { getByTestId, queryByTestId } = render(<TestNavigator />);

      await waitFor(() => {
        const showAllButton = getByTestId("show-all-button");
        fireEvent.press(showAllButton);
      });

      await waitFor(() => {
        const closeButton = getByTestId("close-allmodal-button");
        fireEvent.press(closeButton);
      });

      await waitFor(() => {
        expect(queryByTestId("all-categories-flatlist")).toBeNull();
      });
    });
  });

  describe("معالجة الأخطاء", () => {
    test("يتعامل مع فشل تحميل الفئات", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      const { getByTestId } = render(<TestNavigator />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "فشل في تحميل الفئات",
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    test("يتعامل مع فشل تحميل الفئات الفرعية", async () => {
      const mockCategories = [
        { _id: "1", name: "فئة رئيسية", image: "main.jpg", parent: null },
      ];

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => mockCategories,
        })
        .mockRejectedValueOnce(new Error("Network error"));

      const { getByTestId } = render(<TestNavigator />);

      await waitFor(() => {
        const categoryItem = getByTestId("category-item-1");
        fireEvent.press(categoryItem);
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "فشل في تحميل الفئات الفرعية",
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe("الخصائص البصرية", () => {
    test("يستخدم الألوان والأنماط الصحيحة", async () => {
      const mockCategories = [
        { _id: "1", name: "فئة1", image: "1.jpg", parent: null },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockCategories,
      });

      const { getByTestId } = render(<TestNavigator />);

      await waitFor(() => {
        const categoryItem = getByTestId("category-item-1");
        expect(categoryItem.props.style).toMatchObject({
          backgroundColor: "#fffdfb",
          borderRadius: 20,
          elevation: 1,
        });
      });
    });

    test("يستخدم الأحجام الصحيحة للصور", async () => {
      const mockCategories = [
        { _id: "1", name: "فئة1", image: "1.jpg", parent: null },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockCategories,
      });

      const { getByTestId } = render(<TestNavigator />);

      await waitFor(() => {
        const categoryItem = getByTestId("category-item-1");
        const image = categoryItem.findByType(require("react-native").Image);
        expect(image.props.style).toMatchObject({
          width: 80,
          height: 60,
        });
      });
    });
  });

  describe("التكامل مع Navigation", () => {
    test("يستخدم useNavigation بشكل صحيح", async () => {
      const mockCategories = [
        { _id: "1", name: "فئة1", image: "1.jpg", parent: null },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockCategories,
      });

      const { getByTestId } = render(<TestNavigator />);

      await waitFor(() => {
        expect(getByTestId("categories-flatlist")).toBeTruthy();
      });
    });
  });

  describe("الحالات الاستثنائية", () => {
    test("يتعامل مع فئة بدون صورة", async () => {
      const mockCategories = [
        { _id: "1", name: "فئة بدون صورة", image: "", parent: null },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockCategories,
      });

      const { getByTestId } = render(<TestNavigator />);

      await waitFor(() => {
        const categoryItem = getByTestId("category-item-1");
        expect(categoryItem).toBeTruthy();
      });
    });

    test("يتعامل مع فئة بدون اسم", async () => {
      const mockCategories = [
        { _id: "1", name: "", image: "image.jpg", parent: null },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockCategories,
      });

      const { getByTestId } = render(<TestNavigator />);

      await waitFor(() => {
        const categoryItem = getByTestId("category-item-1");
        expect(categoryItem).toBeTruthy();
      });
    });
  });
});
