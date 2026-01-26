import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { View } from "react-native";
import CartScreen from "../../../screens/delivery/CartScreen";

// ============ Mocks: Navigation ============
const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => {
  return {
    // فقط ما نحتاجه في هذه الشاشة
    useNavigation: () => ({
      goBack: mockGoBack,
      navigate: mockNavigate,
    }),
  };
});

// ============ Mocks: LinearGradient ============
jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  return {
    LinearGradient: ({ children }: any) => <View>{children}</View>,
  };
});

// ============ Mocks: Ionicons ============
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  const Ionicons = ({ name }: any) => <Text>{`icon-${name}`}</Text>;
  return { Ionicons };
});

// ============ Mocks: Alert ============
const alertSpy = jest.spyOn(require("react-native").Alert, "alert");

// ============ Mocks: External Components ============
jest.mock("components/ScheduledDeliveryPicker", () => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");
  return ({ onChange }: { onChange: (d: Date) => void }) => (
    <TouchableOpacity
      testID="scheduled-picker"
      onPress={() => onChange(new Date("2025-08-20T10:15:00.000Z"))}
    >
      <Text>ScheduledPickerMock</Text>
    </TouchableOpacity>
  );
});

jest.mock("components/RadioGroup", () => {
  const React = require("react");
  const { View, TouchableOpacity, Text } = require("react-native");
  return ({ options, selectedValue, onChange }: any) => (
    <View>
      {options.map((opt: any) => (
        <TouchableOpacity
          key={opt.value}
          accessibilityLabel={`radio-${opt.value}`}
          onPress={() => onChange(opt.value)}
        >
          <Text>
            {opt.label} {selectedValue === opt.value ? "(selected)" : ""}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

// ============ Mock: Cart Context (mutable) ============
let cartMock = {
  items: [] as any[],
  totalPrice: 0,
  totalQuantity: 0,
  updateQuantity: jest.fn(),
  removeFromCart: jest.fn(),
};

jest.mock("../../context/CartContext", () => {
  return {
    useCart: () => cartMock,
  };
});

// ============ Helpers ============
const makeItem = (over: Partial<any> = {}) => ({
  id: over.id ?? "1",
  productId: over.productId ?? "p1",
  name: over.name ?? "تفاح أحمر",
  price: over.price ?? 10,
  originalPrice: over.originalPrice ?? 12,
  quantity: over.quantity ?? 2,
  productType: over.productType ?? "product",
  storeId: over.storeId ?? "storeA",
  storeType: over.storeType ?? "grocery",
  image: over.image ?? "https://img",
});

const setupWithItems = (items: any[]) => {
  cartMock.items = items;
  cartMock.totalQuantity = items.reduce((s, i) => s + (i.quantity || 0), 0);
  cartMock.totalPrice = items.reduce(
    (s, i) => s + (i.quantity || 0) * (i.price || 0),
    0
  );
  cartMock.updateQuantity.mockClear();
  cartMock.removeFromCart.mockClear();
  mockNavigate.mockClear();
  mockGoBack.mockClear();
  (alertSpy as jest.Mock).mockClear();
};

// ============ Tests ============
describe("CartScreen (Full Coverage)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("يعرض الحالة الفارغة وزر تسوق الآن ويعود عند الضغط", () => {
    setupWithItems([]);
    const { getByText } = render(<CartScreen />);

    expect(getByText("سلتك فارغة")).toBeTruthy();
    expect(getByText("ابدأ بإضافة المنتجات إلى سلتك")).toBeTruthy();

    const shopBtn = getByText("تسوق الآن");
    fireEvent.press(shopBtn);
    expect(mockGoBack).toHaveBeenCalled();
  });

  test("يعرض الهيدر بالعنوان والإجماليات والبادج", () => {
    setupWithItems([makeItem({ quantity: 3, price: 7 })]);
    const { getByText } = render(<CartScreen />);

    expect(getByText("سلة التسوق")).toBeTruthy();
    // subtitle: "X منتج • Y ر.س"
    expect(getByText(/3 منتج/i)).toBeTruthy();
    expect(getByText(/21\.0 ر\.س/i)).toBeTruthy();

    // أيقونة السلة (من الـmock: "icon-cart")
    expect(getByText("icon-cart")).toBeTruthy();
  });

  test("يعرض العناصر مع السعر والخصم والكمية", () => {
    setupWithItems([
      makeItem({
        name: "برتقال",
        price: 5,
        originalPrice: 8,
        quantity: 2,
      }),
    ]);
    const { getByText, queryByText } = render(<CartScreen />);

    expect(getByText("برتقال")).toBeTruthy();
    expect(getByText("8.0 ر.س")).toBeTruthy(); // originalPrice
    expect(getByText("5.0 ر.س")).toBeTruthy(); // price
    // زرّ الحذف (داخل Touchable) يحوي icon-trash
    expect(getByText("icon-trash")).toBeTruthy();

    // Badge المتابعة: الاجمالي بأسفل الشاشة
    expect(getByText("المتابعة للدفع")).toBeTruthy();
    expect(getByText(/10\.0 ر\.س/)).toBeTruthy();

    // للتأكد أن نص الحالة الفارغة غير ظاهر
    expect(queryByText("سلتك فارغة")).toBeNull();
  });

  test("ينقص/يزيد الكمية ويستدعي updateQuantity بالقيم الصحيحة", () => {
    setupWithItems([
      makeItem({ id: "1", storeId: "s1", productType: "product", quantity: 2 }),
    ]);
    const { getAllByText } = render(<CartScreen />);

    const minusIcon = getAllByText("icon-remove")[0];
    const plusIcon = getAllByText("icon-add")[0];

    fireEvent.press(minusIcon);
    expect(cartMock.updateQuantity).toHaveBeenCalledWith(
      "1",
      "s1",
      "product",
      1
    );

    fireEvent.press(plusIcon);
    expect(cartMock.updateQuantity).toHaveBeenCalledWith(
      "1",
      "s1",
      "product",
      3
    );
  });

  test("حذف عنصر: يظهر Alert ويستدعي removeFromCart عند تأكيد 'نعم'", async () => {
    setupWithItems([
      makeItem({ id: "9", storeId: "s9", productType: "addon" }),
    ]);
    const { getByText } = render(<CartScreen />);

    const trash = getByText("icon-trash");
    // نضغط زر الحذف
    fireEvent.press(trash);

    expect(alertSpy).toHaveBeenCalled();
    // نحاكي ضغط زر "نعم" في Alert
    const [[title, message, buttons]] = (alertSpy as jest.Mock).mock.calls;
    expect(title).toBe("حذف المنتج");
    expect(Array.isArray(buttons)).toBe(true);

    const yesBtn = buttons.find((b: any) => b.text === "نعم");
    expect(yesBtn).toBeTruthy();
    yesBtn.onPress();

    expect(cartMock.removeFromCart).toHaveBeenCalledWith("9", "s9", "addon");
  });

  test("إظهار خيارات التوصيل فقط عند وجود عدة متاجر", () => {
    setupWithItems([
      makeItem({ storeId: "A" }),
      makeItem({ id: "2", productId: "p2", storeId: "B" }),
    ]);
    const { getByText, getByLabelText } = render(<CartScreen />);

    // يظهر عنوان قسم التوصيل
    expect(getByText("اختر نوع التوصيل:")).toBeTruthy();

    // نغيّر الوضع إلى unified عبر الـRadioGroup mock
    const unifiedRadio = getByLabelText("radio-unified");
    fireEvent.press(unifiedRadio);
    // لا يوجد state مرئي لنفحصه هنا، لكن سنتحقق لاحقاً من Payload التنقل
  });

  test("ScheduledDeliveryPicker: يحدّث التاريخ المجدول", () => {
    setupWithItems([makeItem()]);
    const { getByTestId } = render(<CartScreen />);
    // الضغط على الموك يرسل تاريخاً ثابتاً
    fireEvent.press(getByTestId("scheduled-picker"));
    // سنفحص لاحقاً ضمن الـpayload أنه أُرسل
  });

  test("زر الرجوع يعمل", () => {
    setupWithItems([makeItem()]);
    const { getByText } = render(<CartScreen />);
    const backIcon = getByText("icon-arrow-back");
    fireEvent.press(backIcon);
    expect(mockGoBack).toHaveBeenCalled();
  });

  test("المتابعة للدفع: يرسل Payload صحيح إلى InvoiceScreen (مع mapping للحقول)", async () => {
    setupWithItems([
      makeItem({
        id: "10",
        productId: "PX",
        name: "موز",
        price: 4.5,
        quantity: 3,
        productType: "product",
        storeId: "S-1",
        storeType: "grocery",
        image: { uri: "https://img-mock" }, // يتعامل معه الكود
        originalPrice: 5.5,
      }),
      makeItem({
        id: "11",
        productId: "PY",
        name: "حليب",
        price: 8,
        quantity: 1,
        productType: "product",
        storeId: "S-2",
        storeType: "dairy",
        image: "https://img2",
        originalPrice: undefined,
      }),
    ]);

    const { getByText, getByTestId, getByLabelText } = render(<CartScreen />);

    // اخترنا unified لتتغير قيمة deliveryMode
    fireEvent.press(getByLabelText("radio-unified"));

    // اضغط على ScheduledPicker ليضع تاريخاً
    fireEvent.press(getByTestId("scheduled-picker"));

    // اضغط المتابعة
    fireEvent.press(getByText("المتابعة للدفع"));

    expect(mockNavigate).toHaveBeenCalledWith("InvoiceScreen", {
      items: [
        {
          id: "10",
          productId: "PX",
          name: "موز",
          price: 4.5,
          quantity: 3,
          productType: "product",
          storeId: "S-1",
          storeType: "grocery",
          image: "https://img-mock", // تحوّلت من object إلى string عبر `.uri`
          originalPrice: 5.5,
        },
        {
          id: "11",
          productId: "PY",
          name: "حليب",
          price: 8,
          quantity: 1,
          productType: "product",
          storeId: "S-2",
          storeType: "dairy",
          image: "https://img2",
          originalPrice: undefined,
        },
      ],
      // من الـScheduledPicker mock
      scheduledDate: "2025-08-20T10:15:00.000Z",
      deliveryMode: "unified",
    });
  });

  test("لا تظهر خيارات التوصيل عند متجر واحد فقط", () => {
    setupWithItems([makeItem({ storeId: "ONE" })]);
    const { queryByText } = render(<CartScreen />);
    expect(queryByText("اختر نوع التوصيل:")).toBeNull();
  });

  test("كتابة ملاحظة في خانة الملاحظات", () => {
    setupWithItems([makeItem()]);
    const { getByPlaceholderText } = render(<CartScreen />);

    const input = getByPlaceholderText(
      "مثلاً: أريد ماء بارد، أحتاج كيس ثلج..."
    );
    fireEvent.changeText(input, "لا تنسوا الثلج لو سمحتم");
    // لا يوجد state مرئي، يكفينا عدم حدوث أخطاء
  });
});
