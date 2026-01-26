// __tests__/components/delivery/DeliveryHeader.test.tsx
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import DeliveryHeader from "../../../components/delivery/DeliveryHeader";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock LinearGradient
jest.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradient",
}));

import AsyncStorage from "@react-native-async-storage/async-storage";

describe("DeliveryHeader", () => {
  const mockAddresses = [
    {
      id: "addr-1",
      label: "المنزل",
      city: "صنعاء",
      street: "شارع التحرير",
    },
    {
      id: "addr-2",
      label: "العمل",
      city: "صنعاء",
      street: "شارع الزبيري",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock AsyncStorage to return addresses by default
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === "user_addresses") {
        return Promise.resolve(JSON.stringify(mockAddresses));
      }
      if (key === "selected_address_id") {
        return Promise.resolve("addr-1");
      }
      return Promise.resolve(null);
    });
  });

  test("يتم عرض العنوان المحدد", async () => {
    const { getByText } = render(<DeliveryHeader />);

    await waitFor(() => {
      expect(getByText("المنزل")).toBeTruthy();
      expect(getByText("صنعاء، شارع التحرير")).toBeTruthy();
    });
  });

  test("يتم عرض زر المحفظة", async () => {
    const { getByTestId } = render(<DeliveryHeader />);

    await waitFor(() => {
      const walletButton = getByTestId("wallet-button");
      expect(walletButton).toBeTruthy();
    });
  });

  test("يتم عرض زر الموقع", async () => {
    const { getByTestId } = render(<DeliveryHeader />);

    await waitFor(() => {
      const locationButton = getByTestId("location-button");
      expect(locationButton).toBeTruthy();
    });
  });

  test("يتم عرض حقل البحث", async () => {
    const { getByTestId } = render(<DeliveryHeader />);

    await waitFor(() => {
      const searchBar = getByTestId("search-bar");
      expect(searchBar).toBeTruthy();
    });
  });

  test("يتم عرض نص البحث", async () => {
    const { getByText } = render(<DeliveryHeader />);

    await waitFor(() => {
      expect(getByText("ابحث عن مطعم أو منتج...")).toBeTruthy();
    });
  });

  test("يتم عرض العنوان الافتراضي عند عدم وجود عنوان محدد", async () => {
    // Mock empty addresses
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === "user_addresses") {
        return Promise.resolve(JSON.stringify([]));
      }
      return Promise.resolve(null);
    });

    const { getByText } = render(<DeliveryHeader />);

    await waitFor(() => {
      expect(getByText("اختر عنوان التوصيل")).toBeTruthy();
    });
  });

  test("يتم عرض مؤشر التحميل", async () => {
    // Mock loading state by delaying AsyncStorage response
    (AsyncStorage.getItem as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    const { getByTestId } = render(<DeliveryHeader />);

    // Initially should show loading
    const loadingIndicator = getByTestId("loading-indicator");
    expect(loadingIndicator).toBeTruthy();
  });

  test("يتم عرض قائمة العناوين في المودال", async () => {
    const { getByTestId } = render(<DeliveryHeader />);

    await waitFor(() => {
      const locationButton = getByTestId("location-button");
      expect(locationButton).toBeTruthy();
    });

    const locationButton = getByTestId("location-button");
    fireEvent.press(locationButton);

    await waitFor(() => {
      const addressesFlatList = getByTestId("addresses-flatlist");
      expect(addressesFlatList).toBeTruthy();
    });
  });

  test("يتم عرض عناصر العنوان في القائمة", async () => {
    const { getByTestId } = render(<DeliveryHeader />);

    await waitFor(() => {
      const locationButton = getByTestId("location-button");
      expect(locationButton).toBeTruthy();
    });

    const locationButton = getByTestId("location-button");
    fireEvent.press(locationButton);

    await waitFor(() => {
      const addressItem1 = getByTestId("address-item-addr-1");
      const addressItem2 = getByTestId("address-item-addr-2");

      expect(addressItem1).toBeTruthy();
      expect(addressItem2).toBeTruthy();
    });
  });

  test("يتم عرض نص العنوان في عناصر القائمة", async () => {
    const { getAllByText, getByTestId } = render(<DeliveryHeader />);
    
    await waitFor(() => {
      const locationButton = getByTestId("location-button");
      expect(locationButton).toBeTruthy();
    });

    const locationButton = getByTestId("location-button");
    fireEvent.press(locationButton);

    await waitFor(() => {
      const homeElements = getAllByText("المنزل");
      const workElements = getAllByText("العمل");
      const homeAddressElements = getAllByText("صنعاء، شارع التحرير");
      const workAddressElements = getAllByText("صنعاء، شارع الزبيري");

      expect(homeElements.length).toBeGreaterThan(0);
      expect(workElements.length).toBeGreaterThan(0);
      expect(homeAddressElements.length).toBeGreaterThan(0);
      expect(workAddressElements.length).toBeGreaterThan(0);
    });
  });

  test("يتم تطبيق التنسيق الصحيح للهيدر", async () => {
    const { getByTestId } = render(<DeliveryHeader />);

    await waitFor(() => {
      expect(getByTestId("wallet-button")).toBeTruthy();
      expect(getByTestId("location-button")).toBeTruthy();
      expect(getByTestId("search-bar")).toBeTruthy();
    });
  });

  test("يتم عرض العنوان المحدد بشكل صحيح", async () => {
    const { getByText } = render(<DeliveryHeader />);

    await waitFor(() => {
      expect(getByText("المنزل")).toBeTruthy();
      expect(getByText("صنعاء، شارع التحرير")).toBeTruthy();
    });
  });
});
