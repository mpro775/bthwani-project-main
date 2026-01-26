// __tests__/context/CartContextShein.test.tsx
import { act, fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import {
  SheinCartProvider,
  useSheinCart,
} from "../../context/CartContextShein";

// Mock component to test the context
const TestComponent = () => {
  const { items, addItem, removeItem, clear, updateQuantity } = useSheinCart();

  return (
    <View>
      <Text testID="items-count">{items.length}</Text>
      <View testID="items-list">
        {items.map((item) => (
          <Text key={item.id} testID={`item-${item.id}`}>
            {item.name} - {item.quantity}
          </Text>
        ))}
      </View>
      <TouchableOpacity
        testID="add-button"
        onPress={() =>
          addItem({
            id: "1",
            name: "منتج تجريبي",
            price: 100,
            image: "test.jpg",
            quantity: 1,
            sheinUrl: "https://shein.com/product",
          })
        }
      >
        <Text>إضافة منتج</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="remove-button" onPress={() => removeItem("1")}>
        <Text>حذف منتج</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="clear-button" onPress={() => clear()}>
        <Text>مسح السلة</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="update-button"
        onPress={() => updateQuantity("1", 3)}
      >
        <Text>تحديث الكمية</Text>
      </TouchableOpacity>
    </View>
  );
};

describe("CartContextShein", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("يتم تهيئة السلة فارغة", () => {
    const { getByTestId } = render(
      <SheinCartProvider>
        <TestComponent />
      </SheinCartProvider>
    );

    const itemsCount = getByTestId("items-count");
    expect(itemsCount.props.children).toBe(0);
  });

  test("يتم إضافة عنصر جديد للسلة", () => {
    const { getByTestId } = render(
      <SheinCartProvider>
        <TestComponent />
      </SheinCartProvider>
    );

    const addButton = getByTestId("add-button");
    act(() => {
      fireEvent.press(addButton);
    });

    const itemsCount = getByTestId("items-count");
    expect(itemsCount.props.children).toBe(1);

    const item = getByTestId("item-1");
    expect(item.props.children).toEqual(["منتج تجريبي", " - ", 1]);
  });

  test("يتم زيادة الكمية عند إضافة عنصر موجود", () => {
    const { getByTestId } = render(
      <SheinCartProvider>
        <TestComponent />
      </SheinCartProvider>
    );

    const addButton = getByTestId("add-button");

    // إضافة المنتج أول مرة
    act(() => {
      fireEvent.press(addButton);
    });

    // إضافة نفس المنتج مرة أخرى
    act(() => {
      fireEvent.press(addButton);
    });

    const itemsCount = getByTestId("items-count");
    expect(itemsCount.props.children).toBe(1); // نفس العنصر، كمية مختلفة

    const item = getByTestId("item-1");
    expect(item.props.children).toEqual(["منتج تجريبي", " - ", 2]);
  });

  test("يتم حذف عنصر من السلة", () => {
    const { getByTestId } = render(
      <SheinCartProvider>
        <TestComponent />
      </SheinCartProvider>
    );

    // إضافة منتج أولاً
    const addButton = getByTestId("add-button");
    act(() => {
      fireEvent.press(addButton);
    });

    // التأكد من وجود المنتج
    let itemsCount = getByTestId("items-count");
    expect(itemsCount.props.children).toBe(1);

    // حذف المنتج
    const removeButton = getByTestId("remove-button");
    act(() => {
      fireEvent.press(removeButton);
    });

    // التأكد من حذف المنتج
    itemsCount = getByTestId("items-count");
    expect(itemsCount.props.children).toBe(0);
  });

  test("يتم مسح السلة بالكامل", () => {
    const { getByTestId } = render(
      <SheinCartProvider>
        <TestComponent />
      </SheinCartProvider>
    );

    // إضافة منتجات
    const addButton = getByTestId("add-button");
    act(() => {
      fireEvent.press(addButton);
      fireEvent.press(addButton);
    });

    // التأكد من وجود المنتجات
    let itemsCount = getByTestId("items-count");
    expect(itemsCount.props.children).toBe(1); // عنصر واحد بكمية 2

    // مسح السلة
    const clearButton = getByTestId("clear-button");
    act(() => {
      fireEvent.press(clearButton);
    });

    // التأكد من مسح السلة
    itemsCount = getByTestId("items-count");
    expect(itemsCount.props.children).toBe(0);
  });

  test("يتم تحديث كمية عنصر موجود", () => {
    const { getByTestId } = render(
      <SheinCartProvider>
        <TestComponent />
      </SheinCartProvider>
    );

    // إضافة منتج أولاً
    const addButton = getByTestId("add-button");
    act(() => {
      fireEvent.press(addButton);
    });

    // تحديث الكمية
    const updateButton = getByTestId("update-button");
    act(() => {
      fireEvent.press(updateButton);
    });

    const item = getByTestId("item-1");
    expect(item.props.children).toEqual(["منتج تجريبي", " - ", 3]);
  });

  test("يتم حذف العنصر عند تحديث الكمية إلى صفر", () => {
    const TestComponentWithUpdate = () => {
      const { items, addItem, updateQuantity } = useSheinCart();

      return (
        <View>
          <Text testID="items-count">{items.length}</Text>
          <TouchableOpacity
            testID="add-button"
            onPress={() =>
              addItem({
                id: "1",
                name: "منتج تجريبي",
                price: 100,
                image: "test.jpg",
                quantity: 1,
                sheinUrl: "https://shein.com/product",
              })
            }
          >
            <Text>إضافة منتج</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="update-to-zero-button"
            onPress={() => updateQuantity("1", 0)}
          >
            <Text>تحديث إلى صفر</Text>
          </TouchableOpacity>
        </View>
      );
    };

    const { getByTestId } = render(
      <SheinCartProvider>
        <TestComponentWithUpdate />
      </SheinCartProvider>
    );

    // إضافة منتج أولاً
    const addButton = getByTestId("add-button");
    act(() => {
      fireEvent.press(addButton);
    });

    // التأكد من وجود المنتج
    let itemsCount = getByTestId("items-count");
    expect(itemsCount.props.children).toBe(1);

    // تحديث الكمية إلى صفر
    const updateToZeroButton = getByTestId("update-to-zero-button");
    act(() => {
      fireEvent.press(updateToZeroButton);
    });

    // التأكد من حذف المنتج
    itemsCount = getByTestId("items-count");
    expect(itemsCount.props.children).toBe(0);
  });

  test("يتم حذف العنصر عند تحديث الكمية إلى قيمة سلبية", () => {
    const TestComponentWithNegativeUpdate = () => {
      const { items, addItem, updateQuantity } = useSheinCart();

      return (
        <View>
          <Text testID="items-count">{items.length}</Text>
          <TouchableOpacity
            testID="add-button"
            onPress={() =>
              addItem({
                id: "1",
                name: "منتج تجريبي",
                price: 100,
                image: "test.jpg",
                quantity: 1,
                sheinUrl: "https://shein.com/product",
              })
            }
          >
            <Text>إضافة منتج</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="update-to-negative-button"
            onPress={() => updateQuantity("1", -1)}
          >
            <Text>تحديث إلى قيمة سلبية</Text>
          </TouchableOpacity>
        </View>
      );
    };

    const { getByTestId } = render(
      <SheinCartProvider>
        <TestComponentWithNegativeUpdate />
      </SheinCartProvider>
    );

    // إضافة منتج أولاً
    const addButton = getByTestId("add-button");
    act(() => {
      fireEvent.press(addButton);
    });

    // التأكد من وجود المنتج
    let itemsCount = getByTestId("items-count");
    expect(itemsCount.props.children).toBe(1);

    // تحديث الكمية إلى قيمة سلبية
    const updateToNegativeButton = getByTestId("update-to-negative-button");
    act(() => {
      fireEvent.press(updateToNegativeButton);
    });

    // التأكد من حذف المنتج
    itemsCount = getByTestId("items-count");
    expect(itemsCount.props.children).toBe(0);
  });

  test("يتم التعامل مع عناصر متعددة بشكل صحيح", () => {
    const { getByTestId } = render(
      <SheinCartProvider>
        <TestComponent />
      </SheinCartProvider>
    );

    const addButton = getByTestId("add-button");

    // إضافة منتج أول
    act(() => {
      fireEvent.press(addButton);
    });

    // إضافة منتج ثاني (سيتم دمج الكمية)
    act(() => {
      fireEvent.press(addButton);
    });

    const itemsCount = getByTestId("items-count");
    expect(itemsCount.props.children).toBe(1);

    const item = getByTestId("item-1");
    expect(item.props.children).toEqual(["منتج تجريبي", " - ", 2]);
  });

  test("يتم التعامل مع خصائص العنصر بشكل صحيح", () => {
    const { getByTestId } = render(
      <SheinCartProvider>
        <TestComponent />
      </SheinCartProvider>
    );

    const addButton = getByTestId("add-button");
    act(() => {
      fireEvent.press(addButton);
    });

    const item = getByTestId("item-1");
    expect(item.props.children).toContain("منتج تجريبي");
    expect(item.props.children).toContain(1);
  });

  test("يتم التعامل مع sheinUrl بشكل صحيح", () => {
    const TestComponentWithSheinUrl = () => {
      const { addItem, items } = useSheinCart();

      return (
        <View>
          <TouchableOpacity
            testID="add-shein-button"
            onPress={() =>
              addItem({
                id: "2",
                name: "منتج Shein",
                price: 200,
                image: "shein.jpg",
                quantity: 1,
                sheinUrl: "https://shein.com/product",
              })
            }
          >
            <Text>إضافة منتج Shein</Text>
          </TouchableOpacity>
          <Text testID="items-count">{items.length}</Text>
        </View>
      );
    };

    const { getByTestId } = render(
      <SheinCartProvider>
        <TestComponentWithSheinUrl />
      </SheinCartProvider>
    );

    const addSheinButton = getByTestId("add-shein-button");
    act(() => {
      fireEvent.press(addSheinButton);
    });

    const itemsCount = getByTestId("items-count");
    expect(itemsCount.props.children).toBe(1);
  });

  test("يتم التعامل مع الأخطاء عند استخدام useCart خارج Provider", () => {
    const TestComponentWithoutProvider = () => {
      try {
        const cart = useSheinCart();
        return <Text testID="success">نجح</Text>;
      } catch (error) {
        return <Text testID="error">فشل</Text>;
      }
    };

    const { getByTestId } = render(<TestComponentWithoutProvider />);

    const errorElement = getByTestId("error");
    expect(errorElement).toBeTruthy();
  });
});
