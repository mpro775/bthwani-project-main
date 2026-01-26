// __tests__/DeliveryHeader.test.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";
import DeliveryHeader from "../../components/delivery/DeliveryHeader";

// Mock Modal component by adding it to the React Native module
jest.mock("react-native", () => {
  const RN = {
    View: "View",
    Text: "Text",
    TouchableOpacity: "TouchableOpacity",
    FlatList: ({ data, renderItem, keyExtractor }: any) => {
      if (!data || !renderItem) return null;

      const React = require("react");
      return React.createElement(
        "div",
        {
          "data-testid": "flatlist",
        },
        data.map((item: any, index: number) => {
          const key = keyExtractor ? keyExtractor(item, index) : index;
          return React.createElement(
            "div",
            { key },
            renderItem({ item, index })
          );
        })
      );
    },
    ActivityIndicator: "ActivityIndicator",
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (style: any) => {
        if (Array.isArray(style)) {
          return style.reduce((acc, curr) => ({ ...acc, ...curr }), {});
        }
        return style || {};
      },
    },
    Platform: {
      OS: "ios",
    },
    Modal: ({
      children,
      visible,
      transparent,
      animationType,
      ...props
    }: any) => {
      if (!visible) return null;

      const React = require("react");
      return React.createElement(
        "div",
        {
          ...props,
          "data-testid": "modal",
          style: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: transparent ? "rgba(0,0,0,0.5)" : "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            ...props.style,
          },
        },
        children
      );
    },
  };

  return RN;
});

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock React Navigation
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  NavigationContainer: ({ children }: any) => children,
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock expo-linear-gradient
jest.mock("expo-linear-gradient", () => {
  const { View } = require("react-native");
  return {
    LinearGradient: ({ children, ...props }: any) => (
      <View {...props} data-testid="linear-gradient">
        {children}
      </View>
    ),
  };
});

// Mock Ionicons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

const MockNavigationContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => <NavigationContainer>{children}</NavigationContainer>;

describe("DeliveryHeader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  test("يعرض العنوان الافتراضي عند عدم وجود عناوين محفوظة", async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(null) // user_addresses
      .mockResolvedValueOnce(null); // selected_address_id

    const { getByText } = render(
      <MockNavigationContainer>
        <DeliveryHeader />
      </MockNavigationContainer>
    );

    // Wait for loading to complete and default text to appear
    await waitFor(() => {
      expect(getByText("اختر عنوان التوصيل")).toBeTruthy();
    });

    // When no addresses exist, these texts should NOT be present
    // The component should show the default "choose delivery address" state
    expect(() => screen.getByText("المنزل")).toThrow();
    expect(() => screen.getByText("العمل")).toThrow();
  });

  test("يعرض العنوان المحدد عند وجود عناوين محفوظة", async () => {
    const mockAddresses = [
      {
        id: "address-1",
        label: "المنزل",
        city: "صنعاء",
        street: "شارع الجمهورية",
      },
    ];

    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(JSON.stringify(mockAddresses)) // user_addresses
      .mockResolvedValueOnce("address-1"); // selected_address_id

    const { getByText } = render(
      <MockNavigationContainer>
        <DeliveryHeader />
      </MockNavigationContainer>
    );

    await waitFor(() => {
      expect(getByText("المنزل")).toBeTruthy();
      expect(getByText("صنعاء، شارع الجمهورية")).toBeTruthy();
    });
  });
  test("يتعامل مع أخطاء تحميل العناوين", async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
      new Error("خطأ في التحميل")
    );
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    const { unmount } = render(
      <MockNavigationContainer>
        <DeliveryHeader />
      </MockNavigationContainer>
    );

    // ✅ انتظر لغاية ما يشتغل effect ويُسجّل الخطأ
    await waitFor(() =>
      expect(consoleSpy).toHaveBeenCalledWith(
        "خطأ في تحميل العناوين:",
        expect.any(Error)
      )
    );

    consoleSpy.mockRestore();
    unmount(); // اختياري للتنظيف
  });

  test("يفتح نافذة اختيار العنوان عند الضغط على أيقونة الموقع", async () => {
    const mockAddresses = [
      {
        id: "address-1",
        label: "المنزل",
        city: "صنعاء",
        street: "شارع الجمهورية",
      },
      {
        id: "address-2",
        label: "العمل",
        city: "صنعاء",
        street: "شارع التحرير",
      },
    ];

    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(JSON.stringify(mockAddresses))
      .mockResolvedValueOnce("address-1");

    const { getByTestId, getByText } = render(
      <MockNavigationContainer>
        <DeliveryHeader />
      </MockNavigationContainer>
    );

    // Wait for addresses to load first
    await waitFor(() => {
      expect(getByText("المنزل")).toBeTruthy();
    });

    // Click the location button to open modal
    const locationButton = getByTestId("location-button");
    fireEvent.press(locationButton);

    // Wait for modal content to appear
    await waitFor(
      () => {
        expect(getByText("اختر عنوان التوصيل")).toBeTruthy();

        // Check that both addresses appear in the modal
        const homeAddresses = screen.getAllByText("المنزل");
        const workAddresses = screen.getAllByText("العمل");

        expect(homeAddresses.length).toBeGreaterThanOrEqual(1);
        expect(workAddresses.length).toBeGreaterThanOrEqual(1);
      },
      { timeout: 3000 }
    );
  });

  test("ينتقل إلى شاشة إضافة العناوين عند عدم وجود عناوين", async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const { getByTestId } = render(
      <MockNavigationContainer>
        <DeliveryHeader />
      </MockNavigationContainer>
    );

    await waitFor(() => {
      const locationButton = getByTestId("location-button");
      fireEvent.press(locationButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith("DeliveryAddresses");
  });

  test("ينتقل إلى شاشة المحفظة عند الضغط على أيقونة المحفظة", async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const { getByTestId } = render(
      <MockNavigationContainer>
        <DeliveryHeader />
      </MockNavigationContainer>
    );

    await waitFor(() => {
      const walletButton = getByTestId("wallet-button");
      fireEvent.press(walletButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith("WalletStack");
  });

  test("يحفظ العنوان المحدد عند اختيار عنوان جديد", async () => {
    const mockAddresses = [
      {
        id: "address-1",
        label: "المنزل",
        city: "صنعاء",
        street: "شارع الجمهورية",
      },
      {
        id: "address-2",
        label: "العمل",
        city: "صنعاء",
        street: "شارع التحرير",
      },
    ];

    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(JSON.stringify(mockAddresses))
      .mockResolvedValueOnce("address-1");

    const { getByTestId, getByText } = render(
      <MockNavigationContainer>
        <DeliveryHeader />
      </MockNavigationContainer>
    );

    // Wait for addresses to load first
    await waitFor(() => {
      expect(getByText("المنزل")).toBeTruthy();
    });

    // Click location button to open modal
    const locationButton = getByTestId("location-button");
    fireEvent.press(locationButton);

    // Wait for modal to open and click on work address
    await waitFor(
      () => {
        const workAddress = getByText("العمل");
        fireEvent.press(workAddress);
      },
      { timeout: 3000 }
    );

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "selected_address_id",
      "address-2"
    );
  });

  test("يعرض حالة التحميل عند جلب العناوين", () => {
    (AsyncStorage.getItem as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(null), 100))
    );

    const { getByTestId } = render(
      <MockNavigationContainer>
        <DeliveryHeader />
      </MockNavigationContainer>
    );

    expect(getByTestId("loading-indicator")).toBeTruthy();
  });

  test("يتعامل مع أخطاء تحميل العناوين", async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
      new Error("خطأ في التحميل")
    );

    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    const { getByText } = render(
      <MockNavigationContainer>
        <DeliveryHeader />
      </MockNavigationContainer>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "خطأ في تحميل العناوين:",
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });
});
