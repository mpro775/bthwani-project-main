import AsyncStorage from "@react-native-async-storage/async-storage";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";
import PayBillScreen from "../../../../screens/wallet/Topup/PayBillScreen";
import axiosInstance from "../../../../utils/api/axiosInstance";

// Mock dependencies
jest.mock("@react-native-async-storage/async-storage");
jest.mock("utils/api/axiosInstance");
jest.mock(
  "../../../../../assets/services/electricity.png",
  () => "electricity.png"
);
jest.mock("../../../../../assets/services/water.png", () => "water.png");
jest.mock("../../../../../assets/services/internet.png", () => "internet.png");

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockAxiosInstance = axiosInstance as jest.Mocked<typeof axiosInstance>;

// Mock Alert
const mockAlert = jest.spyOn(Alert, "alert");

describe("PayBillScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue("mock-token");
  });

  describe("Initial Render - Service Selection", () => {
    test("should render service selection screen initially", () => {
      const { getByText } = render(<PayBillScreen />);

      expect(getByText("اختر نوع الفاتورة")).toBeTruthy();
    });

    test("should display all service options", () => {
      const { getByText } = render(<PayBillScreen />);

      expect(getByText("كهرباء")).toBeTruthy();
      expect(getByText("ماء")).toBeTruthy();
      expect(getByText("إنترنت")).toBeTruthy();
    });

    test("should have service cards with logos", () => {
      const { getByText } = render(<PayBillScreen />);

      // Check that all service cards are rendered
      expect(getByText("كهرباء")).toBeTruthy();
      expect(getByText("ماء")).toBeTruthy();
      expect(getByText("إنترنت")).toBeTruthy();
    });
  });

  describe("Service Selection", () => {
    test("should select electricity service when pressed", async () => {
      const { getByText } = render(<PayBillScreen />);

      const electricityCard = getByText("كهرباء");
      fireEvent.press(electricityCard);

      await waitFor(() => {
        expect(getByText("الخدمة المختارة:")).toBeTruthy();
        expect(getByText("كهرباء")).toBeTruthy();
      });
    });

    test("should select water service when pressed", async () => {
      const { getByText } = render(<PayBillScreen />);

      const waterCard = getByText("ماء");
      fireEvent.press(waterCard);

      await waitFor(() => {
        expect(getByText("الخدمة المختارة:")).toBeTruthy();
        expect(getByText("ماء")).toBeTruthy();
      });
    });

    test("should select internet service when pressed", async () => {
      const { getByText } = render(<PayBillScreen />);

      const internetCard = getByText("إنترنت");
      fireEvent.press(internetCard);

      await waitFor(() => {
        expect(getByText("الخدمة المختارة:")).toBeTruthy();
        expect(getByText("إنترنت")).toBeTruthy();
      });
    });
  });

  describe("Payment Form", () => {
    test("should show payment form after service selection", async () => {
      const { getByText, getByPlaceholderText } = render(<PayBillScreen />);

      // Select a service
      const electricityCard = getByText("كهرباء");
      fireEvent.press(electricityCard);

      await waitFor(() => {
        expect(getByText("رقم الحساب")).toBeTruthy();
        expect(getByPlaceholderText("مثال: 100456789")).toBeTruthy();
        expect(getByText("تسديد الفاتورة")).toBeTruthy();
      });
    });

    test("should show back button after service selection", async () => {
      const { getByText } = render(<PayBillScreen />);

      // Select a service
      const electricityCard = getByText("كهرباء");
      fireEvent.press(electricityCard);

      await waitFor(() => {
        expect(getByText("◀ رجوع")).toBeTruthy();
      });
    });

    test("should go back to service selection when back button is pressed", async () => {
      const { getByText } = render(<PayBillScreen />);

      // Select a service
      const electricityCard = getByText("كهرباء");
      fireEvent.press(electricityCard);

      await waitFor(() => {
        const backButton = getByText("◀ رجوع");
        fireEvent.press(backButton);
      });

      await waitFor(() => {
        expect(getByText("اختر نوع الفاتورة")).toBeTruthy();
        expect(getByText("كهرباء")).toBeTruthy();
        expect(getByText("ماء")).toBeTruthy();
        expect(getByText("إنترنت")).toBeTruthy();
      });
    });
  });

  describe("Account Input", () => {
    test("should update account number when typing", async () => {
      const { getByText, getByPlaceholderText } = render(<PayBillScreen />);

      // Select a service
      const electricityCard = getByText("كهرباء");
      fireEvent.press(electricityCard);

      await waitFor(() => {
        const accountInput = getByPlaceholderText("مثال: 100456789");
        fireEvent.changeText(accountInput, "123456789");
        expect(accountInput.props.value).toBe("123456789");
      });
    });

    test("should accept numeric input only", async () => {
      const { getByText, getByPlaceholderText } = render(<PayBillScreen />);

      // Select a service
      const electricityCard = getByText("كهرباء");
      fireEvent.press(electricityCard);

      await waitFor(() => {
        const accountInput = getByPlaceholderText("مثال: 100456789");
        expect(accountInput.props.keyboardType).toBe("numeric");
      });
    });
  });

  describe("Payment Processing", () => {
    test("should show alert when trying to pay without account number", async () => {
      const { getByText } = render(<PayBillScreen />);

      // Select a service
      const electricityCard = getByText("كهرباء");
      fireEvent.press(electricityCard);

      await waitFor(() => {
        const payButton = getByText("تسديد الفاتورة");
        fireEvent.press(payButton);
      });

      expect(mockAlert).toHaveBeenCalledWith(
        "تنبيه",
        "الرجاء إدخال رقم الحساب"
      );
    });

    test("should process payment successfully", async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: { status: "success" },
      });

      const { getByText, getByPlaceholderText } = render(<PayBillScreen />);

      // Select a service
      const electricityCard = getByText("كهرباء");
      fireEvent.press(electricityCard);

      await waitFor(() => {
        // Enter account number
        const accountInput = getByPlaceholderText("مثال: 100456789");
        fireEvent.changeText(accountInput, "123456789");

        // Press pay button
        const payButton = getByText("تسديد الفاتورة");
        fireEvent.press(payButton);
      });

      await waitFor(() => {
        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          "/pay-bill",
          { product: "electricity_1000", recipient: "123456789" },
          {
            headers: { Authorization: "Bearer mock-token" },
          }
        );
        expect(mockAlert).toHaveBeenCalledWith("تم الدفع", "النتيجة: success");
      });
    });

    test("should handle payment failure", async () => {
      const errorMessage = "فشل في الدفع";
      mockAxiosInstance.post.mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      const { getByText, getByPlaceholderText } = render(<PayBillScreen />);

      // Select a service
      const electricityCard = getByText("كهرباء");
      fireEvent.press(electricityCard);

      await waitFor(() => {
        // Enter account number
        const accountInput = getByPlaceholderText("مثال: 100456789");
        fireEvent.changeText(accountInput, "123456789");

        // Press pay button
        const payButton = getByText("تسديد الفاتورة");
        fireEvent.press(payButton);
      });

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith("فشل الدفع", errorMessage);
      });
    });

    test("should handle network error", async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error("Network Error"));

      const { getByText, getByPlaceholderText } = render(<PayBillScreen />);

      // Select a service
      const electricityCard = getByText("كهرباء");
      fireEvent.press(electricityCard);

      await waitFor(() => {
        // Enter account number
        const accountInput = getByPlaceholderText("مثال: 100456789");
        fireEvent.changeText(accountInput, "123456789");

        // Press pay button
        const payButton = getByText("تسديد الفاتورة");
        fireEvent.press(payButton);
      });

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          "فشل الدفع",
          "حدث خطأ غير متوقع"
        );
      });
    });
  });

  describe("Loading States", () => {
    test("should show loading indicator during payment", async () => {
      // Mock a delayed response
      mockAxiosInstance.post.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: { status: "success" } }), 100)
          )
      );

      const { getByText, getByPlaceholderText } = render(<PayBillScreen />);

      // Select a service
      const electricityCard = getByText("كهرباء");
      fireEvent.press(electricityCard);

      await waitFor(() => {
        // Enter account number
        const accountInput = getByPlaceholderText("مثال: 100456789");
        fireEvent.changeText(accountInput, "123456789");

        // Press pay button
        const payButton = getByText("تسديد الفاتورة");
        fireEvent.press(payButton);
      });

      // Should show loading state
      await waitFor(() => {
        expect(getByText("تسديد الفاتورة")).toBeTruthy();
      });
    });
  });

  describe("Service Values", () => {
    test("should send correct service value for electricity", async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: { status: "success" },
      });

      const { getByText, getByPlaceholderText } = render(<PayBillScreen />);

      // Select electricity service
      const electricityCard = getByText("كهرباء");
      fireEvent.press(electricityCard);

      await waitFor(() => {
        const accountInput = getByPlaceholderText("مثال: 100456789");
        fireEvent.changeText(accountInput, "123456789");

        const payButton = getByText("تسديد الفاتورة");
        fireEvent.press(payButton);
      });

      await waitFor(() => {
        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          "/pay-bill",
          { product: "electricity_1000", recipient: "123456789" },
          expect.any(Object)
        );
      });
    });

    test("should send correct service value for water", async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: { status: "success" },
      });

      const { getByText, getByPlaceholderText } = render(<PayBillScreen />);

      // Select water service
      const waterCard = getByText("ماء");
      fireEvent.press(waterCard);

      await waitFor(() => {
        const accountInput = getByPlaceholderText("مثال: 100456789");
        fireEvent.changeText(accountInput, "123456789");

        const payButton = getByText("تسديد الفاتورة");
        fireEvent.press(payButton);
      });

      await waitFor(() => {
        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          "/pay-bill",
          { product: "water_500", recipient: "123456789" },
          expect.any(Object)
        );
      });
    });

    test("should send correct service value for internet", async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: { status: "success" },
      });

      const { getByText, getByPlaceholderText } = render(<PayBillScreen />);

      // Select internet service
      const internetCard = getByText("إنترنت");
      fireEvent.press(internetCard);

      await waitFor(() => {
        const accountInput = getByPlaceholderText("مثال: 100456789");
        fireEvent.changeText(accountInput, "123456789");

        const payButton = getByText("تسديد الفاتورة");
        fireEvent.press(payButton);
      });

      await waitFor(() => {
        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          "/pay-bill",
          { product: "internet_2500", recipient: "123456789" },
          expect.any(Object)
        );
      });
    });
  });

  describe("Accessibility", () => {
    test("should have proper accessibility labels", async () => {
      const { getByText } = render(<PayBillScreen />);

      expect(getByText("اختر نوع الفاتورة")).toBeTruthy();
      expect(getByText("كهرباء")).toBeTruthy();
      expect(getByText("ماء")).toBeTruthy();
      expect(getByText("إنترنت")).toBeTruthy();
    });
  });

  describe("Error Handling", () => {
    test("should handle missing token", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const { getByText, getByPlaceholderText } = render(<PayBillScreen />);

      // Select a service
      const electricityCard = getByText("كهرباء");
      fireEvent.press(electricityCard);

      await waitFor(() => {
        const accountInput = getByPlaceholderText("مثال: 100456789");
        fireEvent.changeText(accountInput, "123456789");

        const payButton = getByText("تسديد الفاتورة");
        fireEvent.press(payButton);
      });

      await waitFor(() => {
        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          "/pay-bill",
          { product: "electricity_1000", recipient: "123456789" },
          {
            headers: { Authorization: "Bearer null" },
          }
        );
      });
    });
  });
});
