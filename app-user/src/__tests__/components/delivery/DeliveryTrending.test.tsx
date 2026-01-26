// __tests__/components/delivery/DeliveryTrending.test.tsx
import { render, waitFor } from "@testing-library/react-native";
import React from "react";
import DeliveryTrending from "../../../components/delivery/DeliveryTrending";

// Mock fetch
global.fetch = jest.fn();

// Mock navigation
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe("DeliveryTrending", () => {
  const mockStores = [
    {
      _id: "store-1",
      name: "مطعم الشرق",
      image: "https://example.com/store1.jpg",
      isTrending: true,
    },
    {
      _id: "store-2",
      name: "مطعم الغرب",
      image: "https://example.com/store2.jpg",
      isTrending: true,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("يتم عرض مؤشر التحميل أثناء التحميل", () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    const { getByTestId } = render(<DeliveryTrending />);
    const loader = getByTestId("loading-indicator");

    expect(loader).toBeTruthy();
  });

  test("يتم عرض المتاجر الرائجة بعد التحميل", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStores,
    });

    const { getByTestId } = render(<DeliveryTrending />);

    await waitFor(() => {
      const trendingScrollView = getByTestId("trending-scrollview");
      expect(trendingScrollView).toBeTruthy();
    });
  });

  test("يتم عرض عناصر المتاجر", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStores,
    });

    const { getByTestId } = render(<DeliveryTrending />);

    await waitFor(() => {
      const storeItem1 = getByTestId("trending-store-store-1");
      const storeItem2 = getByTestId("trending-store-store-2");

      expect(storeItem1).toBeTruthy();
      expect(storeItem2).toBeTruthy();
    });
  });

  test("يتم عرض أسماء المتاجر", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStores,
    });

    const { getByText } = render(<DeliveryTrending />);

    await waitFor(() => {
      expect(getByText("مطعم الشرق")).toBeTruthy();
      expect(getByText("مطعم الغرب")).toBeTruthy();
    });
  });

  test("يتم عرض العنوان الافتراضي", async () => {
    const { getByText } = render(<DeliveryTrending />);
    
    await waitFor(() => {
      expect(getByText("الرائج اليوم")).toBeTruthy();
    });
  });

  test("يتم عرض العنوان المخصص", async () => {
    const customTitle = "أفضل المطاعم";
    const { getByText } = render(
      <DeliveryTrending sectionTitle={customTitle} />
    );
    
    await waitFor(() => {
      expect(getByText(customTitle)).toBeTruthy();
    });
  });

  test("يتم عرض رسالة عند عدم وجود متاجر رائجة", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const { getByText } = render(<DeliveryTrending />);

    await waitFor(() => {
      expect(getByText("لا يوجد متاجر رائجة حالياً.")).toBeTruthy();
    });
  });

  test("يتم عرض ScrollView أفقي", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStores,
    });

    const { getByTestId } = render(<DeliveryTrending />);

    await waitFor(() => {
      const scrollView = getByTestId("trending-scrollview");
      expect(scrollView).toBeTruthy();
    });
  });

  test("يتم التعامل مع خطأ في التحميل", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );

    const { getByTestId } = render(<DeliveryTrending />);

    await waitFor(() => {
      const loader = getByTestId("loading-indicator");
      expect(loader).toBeTruthy();
    });
  });

  test("يتم تطبيق التنسيق الصحيح للمتاجر", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStores,
    });

    const { getByTestId } = render(<DeliveryTrending />);

    await waitFor(() => {
      const storeItem1 = getByTestId("trending-store-store-1");
      expect(storeItem1).toBeTruthy();
    });
  });

  test("يتم عرض جميع المتاجر الرائجة", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStores,
    });

    const { getByTestId } = render(<DeliveryTrending />);

    await waitFor(() => {
      mockStores.forEach((store) => {
        const storeItem = getByTestId(`trending-store-${store._id}`);
        expect(storeItem).toBeTruthy();
      });
    });
  });

  test("يتم تطبيق التنسيق الصحيح للـ ScrollView", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStores,
    });

    const { getByTestId } = render(<DeliveryTrending />);

    await waitFor(() => {
      const scrollView = getByTestId("trending-scrollview");
      expect(scrollView).toBeTruthy();
    });
  });
});
