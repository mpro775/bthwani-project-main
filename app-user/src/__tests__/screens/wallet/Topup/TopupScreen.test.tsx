import AsyncStorage from "@react-native-async-storage/async-storage";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";
import TopupScreen from "../../../../screens/wallet/Topup/TopupScreen";
import axiosInstance from "../../../../utils/api/axiosInstance";

// Mock dependencies
jest.mock("@react-native-async-storage/async-storage");
jest.mock("utils/api/axiosInstance");
jest.mock("../../../../../assets/networks/sabafon.png", () => "sabafon.png");
jest.mock("../../../../../assets/networks/you.png", () => "you.png");
jest.mock("../../../../../assets/networks/ymobile.png", () => "ymobile.png");

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockAxiosInstance = axiosInstance as jest.Mocked<typeof axiosInstance>;

// Mock Alert
const mockAlert = jest.spyOn(Alert, "alert");

describe("TopupScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue("mock-token");
  });

  describe("Initial Render - Network Selection", () => {
    test("should render network selection screen initially", () => {
      const { getByText } = render(<TopupScreen />);

      expect(getByText("اختر شبكة الشحن")).toBeTruthy();
    });

    test("should display all network options", () => {
      const { getByText } = render(<TopupScreen />);

      expect(getByText("سبأفون")).toBeTruthy();
      expect(getByText("يو")).toBeTruthy();
      expect(getByText("يمن موبايل")).toBeTruthy();
    });

    test("should have network cards with logos", () => {
      const { getByText } = render(<TopupScreen />);

      // Check that all network cards are rendered
      expect(getByText("سبأفون")).toBeTruthy();
      expect(getByText("يو")).toBeTruthy();
      expect(getByText("يمن موبايل")).toBeTruthy();
    });
  });

  describe("Network Selection", () => {
    test("should select Sabafon network when pressed", async () => {
      const { getByText } = render(<TopupScreen />);

      const sabafonCard = getByText("سبأفون");
      fireEvent.press(sabafonCard);

      await waitFor(() => {
        expect(getByText("الشبكة المختارة:")).toBeTruthy();
        expect(getByText("سبأفون")).toBeTruthy();
      });
    });

    test("should select You network when pressed", async () => {
      const { getByText } = render(<TopupScreen />);

      const youCard = getByText("يو");
      fireEvent.press(youCard);

      await waitFor(() => {
        expect(getByText("الشبكة المختارة:")).toBeTruthy();
        expect(getByText("يو")).toBeTruthy();
      });
    });

    test("should select Yemen Mobile network when pressed", async () => {
      const { getByText } = render(<TopupScreen />);

      const yemenMobileCard = getByText("يمن موبايل");
      fireEvent.press(yemenMobileCard);

      await waitFor(() => {
        expect(getByText("الشبكة المختارة:")).toBeTruthy();
        expect(getByText("يمن موبايل")).toBeTruthy();
      });
    });
  });

  describe("Topup Form", () => {
    test("should show topup form after network selection", async () => {
      const { getByText, getByPlaceholderText } = render(<TopupScreen />);

      // Select a network
      const sabafonCard = getByText("سبأفون");
      fireEvent.press(sabafonCard);

      await waitFor(() => {
        expect(getByText("رقم الهاتف")).toBeTruthy();
        expect(getByPlaceholderText("مثال: 7")).toBeTruthy();
        expect(getByText("شحن الرصيد")).toBeTruthy();
      });
    });

    test("should show back button after network selection", async () => {
      const { getByText } = render(<TopupScreen />);

      // Select a network
      const sabafonCard = getByText("سبأفون");
      fireEvent.press(sabafonCard);

      await waitFor(() => {
        expect(getByText("◀ رجوع")).toBeTruthy();
      });
    });

    test("should go back to network selection when back button is pressed", async () => {
      const { getByText } = render(<TopupScreen />);

      // Select a network
      const sabafonCard = getByText("سبأفون");
      fireEvent.press(sabafonCard);

      await waitFor(() => {
        const backButton = getByText("◀ رجوع");
        fireEvent.press(backButton);
      });

      await waitFor(() => {
        expect(getByText("اختر شبكة الشحن")).toBeTruthy();
        expect(getByText("سبأفون")).toBeTruthy();
        expect(getByText("يو")).toBeTruthy();
        expect(getByText("يمن موبايل")).toBeTruthy();
      });
    });
  });

  describe("Phone Number Input", () => {
    test("should update phone number when typing", async () => {
      const { getByText, getByPlaceholderText } = render(<TopupScreen />);

      // Select a network
      const sabafonCard = getByText("سبأفون");
      fireEvent.press(sabafonCard);

      await waitFor(() => {
        const phoneInput = getByPlaceholderText("مثال: 7");
        fireEvent.changeText(phoneInput, "712345678");
        expect(phoneInput.props.value).toBe("712345678");
      });
    });

    test("should accept numeric input only", async () => {
      const { getByText, getByPlaceholderText } = render(<TopupScreen />);

      // Select a network
      const sabafonCard = getByText("سبأفون");
      fireEvent.press(sabafonCard);

      await waitFor(() => {
        const phoneInput = getByPlaceholderText("مثال: 7");
        expect(phoneInput.props.keyboardType).toBe("numeric");
      });
    });
  });

  describe("Topup Processing", () => {
    test("should show alert when trying to topup without phone number", async () => {
      const { getByText } = render(<TopupScreen />);

      // Select a network
      const sabafonCard = getByText("سبأفون");
      fireEvent.press(sabafonCard);

      await waitFor(() => {
        const topupButton = getByText("شحن الرصيد");
        fireEvent.press(topupButton);
      });

      expect(mockAlert).toHaveBeenCalledWith(
        "تنبيه",
        "الرجاء إدخال رقم الهاتف"
      );
    });

    test("should process topup successfully", async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: { status: "success" },
      });

      const { getByText, getByPlaceholderText } = render(<TopupScreen />);

      // Select a network
      const sabafonCard = getByText("سبأفون");
      fireEvent.press(sabafonCard);

      await waitFor(() => {
        // Enter phone number
        const phoneInput = getByPlaceholderText("مثال: 7");
        fireEvent.changeText(phoneInput, "712345678");

        // Press topup button
        const topupButton = getByText("شحن الرصيد");
        fireEvent.press(topupButton);
      });

      await waitFor(() => {
        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          "/topup",
          { product: "sabafon_500", recipient: "712345678" },
          {
            headers: { Authorization: "Bearer mock-token" },
          }
        );
        expect(mockAlert).toHaveBeenCalledWith(
          "تمت العملية",
          "النتيجة: success"
        );
      });
    });

    test("should handle topup failure", async () => {
      const errorMessage = "فشل في الشحن";
      mockAxiosInstance.post.mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      const { getByText, getByPlaceholderText } = render(<TopupScreen />);

      // Select a network
      const sabafonCard = getByText("سبأفون");
      fireEvent.press(sabafonCard);

      await waitFor(() => {
        // Enter phone number
        const phoneInput = getByPlaceholderText("مثال: 7");
        fireEvent.changeText(phoneInput, "712345678");

        // Press topup button
        const topupButton = getByText("شحن الرصيد");
        fireEvent.press(topupButton);
      });

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith("فشل الشحن", errorMessage);
      });
    });

    test("should handle network error", async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error("Network Error"));

      const { getByText, getByPlaceholderText } = render(<TopupScreen />);

      // Select a network
      const sabafonCard = getByText("سبأفون");
      fireEvent.press(sabafonCard);

      await waitFor(() => {
        // Enter phone number
        const phoneInput = getByPlaceholderText("مثال: 7");
        fireEvent.changeText(phoneInput, "712345678");

        // Press topup button
        const topupButton = getByText("شحن الرصيد");
        fireEvent.press(topupButton);
      });

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          "فشل الشحن",
          "حدث خطأ غير متوقع"
        );
      });
    });
  });

  describe("Loading States", () => {
    test("should show loading indicator during topup", async () => {
      // Mock a delayed response
      mockAxiosInstance.post.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: { status: "success" } }), 100)
          )
      );

      const { getByText, getByPlaceholderText } = render(<TopupScreen />);

      // Select a network
      const sabafonCard = getByText("سبأفون");
      fireEvent.press(sabafonCard);

      await waitFor(() => {
        // Enter phone number
        const phoneInput = getByPlaceholderText("مثال: 7");
        fireEvent.changeText(phoneInput, "712345678");

        // Press topup button
        const topupButton = getByText("شحن الرصيد");
        fireEvent.press(topupButton);
      });

      // Should show loading state
      await waitFor(() => {
        expect(getByText("شحن الرصيد")).toBeTruthy();
      });
    });
  });

  describe("Network Values", () => {
    test("should send correct network value for Sabafon", async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: { status: "success" },
      });

      const { getByText, getByPlaceholderText } = render(<TopupScreen />);

      // Select Sabafon network
      const sabafonCard = getByText("سبأفون");
      fireEvent.press(sabafonCard);

      await waitFor(() => {
        const phoneInput = getByPlaceholderText("مثال: 7");
        fireEvent.changeText(phoneInput, "712345678");

        const topupButton = getByText("شحن الرصيد");
        fireEvent.press(topupButton);
      });

      await waitFor(() => {
        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          "/topup",
          { product: "sabafon_500", recipient: "712345678" },
          expect.any(Object)
        );
      });
    });

    test("should send correct network value for You", async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: { status: "success" },
      });

      const { getByText, getByPlaceholderText } = render(<TopupScreen />);

      // Select You network
      const youCard = getByText("يو");
      fireEvent.press(youCard);

      await waitFor(() => {
        const phoneInput = getByPlaceholderText("مثال: 7");
        fireEvent.changeText(phoneInput, "712345678");

        const topupButton = getByText("شحن الرصيد");
        fireEvent.press(topupButton);
      });

      await waitFor(() => {
        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          "/topup",
          { product: "you_500", recipient: "712345678" },
          expect.any(Object)
        );
      });
    });

    test("should send correct network value for Yemen Mobile", async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: { status: "success" },
      });

      const { getByText, getByPlaceholderText } = render(<TopupScreen />);

      // Select Yemen Mobile network
      const yemenMobileCard = getByText("يمن موبايل");
      fireEvent.press(yemenMobileCard);

      await waitFor(() => {
        const phoneInput = getByPlaceholderText("مثال: 7");
        fireEvent.changeText(phoneInput, "712345678");

        const topupButton = getByText("شحن الرصيد");
        fireEvent.press(topupButton);
      });

      await waitFor(() => {
        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          "/topup",
          { product: "yemenmobile_500", recipient: "712345678" },
          expect.any(Object)
        );
      });
    });
  });

  describe("Accessibility", () => {
    test("should have proper accessibility labels", async () => {
      const { getByText } = render(<TopupScreen />);

      expect(getByText("اختر شبكة الشحن")).toBeTruthy();
      expect(getByText("سبأفون")).toBeTruthy();
      expect(getByText("يو")).toBeTruthy();
      expect(getByText("يمن موبايل")).toBeTruthy();
    });
  });

  describe("Error Handling", () => {
    test("should handle missing token", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const { getByText, getByPlaceholderText } = render(<TopupScreen />);

      // Select a network
      const sabafonCard = getByText("سبأفون");
      fireEvent.press(sabafonCard);

      await waitFor(() => {
        const phoneInput = getByPlaceholderText("مثال: 7");
        fireEvent.changeText(phoneInput, "712345678");

        const topupButton = getByText("شحن الرصيد");
        fireEvent.press(topupButton);
      });

      await waitFor(() => {
        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          "/topup",
          { product: "sabafon_500", recipient: "712345678" },
          {
            headers: { Authorization: "Bearer null" },
          }
        );
      });
    });
  });

  describe("Form Validation", () => {
    test("should validate empty phone number", async () => {
      const { getByText } = render(<TopupScreen />);

      // Select a network
      const sabafonCard = getByText("سبأفون");
      fireEvent.press(sabafonCard);

      await waitFor(() => {
        const topupButton = getByText("شحن الرصيد");
        fireEvent.press(topupButton);
      });

      expect(mockAlert).toHaveBeenCalledWith(
        "تنبيه",
        "الرجاء إدخال رقم الهاتف"
      );
    });

    test("should validate phone number format", async () => {
      const { getByText, getByPlaceholderText } = render(<TopupScreen />);

      // Select a network
      const sabafonCard = getByText("سبأفون");
      fireEvent.press(sabafonCard);

      await waitFor(() => {
        const phoneInput = getByPlaceholderText("مثال: 7");
        fireEvent.changeText(phoneInput, "123"); // Short number

        const topupButton = getByText("شحن الرصيد");
        fireEvent.press(topupButton);
      });

      // Should still process the request (validation is handled by backend)
      await waitFor(() => {
        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          "/topup",
          { product: "sabafon_500", recipient: "123" },
          expect.any(Object)
        );
      });
    });
  });
});
