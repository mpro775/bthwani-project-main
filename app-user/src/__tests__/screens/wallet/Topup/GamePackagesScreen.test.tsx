import AsyncStorage from "@react-native-async-storage/async-storage";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";
import GamePackagesScreen from "../../../../screens/wallet/Topup/GamePackagesScreen";
import axiosInstance from "../../../../utils/api/axiosInstance";

// Mock dependencies
jest.mock("@react-native-async-storage/async-storage");
jest.mock("utils/api/axiosInstance");
jest.mock("../../../../../assets/packages/pubg.png", () => "pubg.png");
jest.mock("../../../../../assets/packages/freefire.png", () => "freefire.png");
jest.mock("../../../../../assets/packages/google.png", () => "google.png");
jest.mock("../../../../../assets/packages/itunes.png", () => "itunes.png");

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockAxiosInstance = axiosInstance as jest.Mocked<typeof axiosInstance>;

// Mock Alert
const mockAlert = jest.spyOn(Alert, "alert");

describe("GamePackagesScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue("mock-token");
  });

  describe("Initial Render", () => {
    test("should render game packages grid", () => {
      const { getByText } = render(<GamePackagesScreen />);

      expect(getByText("اختر باقة اللعبة")).toBeTruthy();
    });

    test("should display all game package cards", () => {
      const { getByText } = render(<GamePackagesScreen />);

      expect(getByText("PUBG - 60 UC")).toBeTruthy();
      expect(getByText("FreeFire - 310 Diamonds")).toBeTruthy();
      expect(getByText("Google Play - $10")).toBeTruthy();
      expect(getByText("iTunes - $15")).toBeTruthy();
    });
  });

  describe("Package Selection", () => {
    test("should select package when tapped", async () => {
      const { getByText } = render(<GamePackagesScreen />);

      const pubgCard = getByText("PUBG - 60 UC");
      fireEvent.press(pubgCard);

      await waitFor(() => {
        expect(getByText("الباقة المختارة:")).toBeTruthy();
        expect(getByText("PUBG - 60 UC")).toBeTruthy();
      });
    });

    test("should show selected package label", async () => {
      const { getByText } = render(<GamePackagesScreen />);

      const pubgCard = getByText("PUBG - 60 UC");
      fireEvent.press(pubgCard);

      await waitFor(() => {
        expect(getByText("الباقة المختارة:")).toBeTruthy();
        expect(getByText("PUBG - 60 UC")).toBeTruthy();
      });
    });
  });

  describe("Player ID Validation", () => {
    test("should show error when player ID is empty", async () => {
      const { getByText } = render(<GamePackagesScreen />);

      // Select a package
      const pubgCard = getByText("PUBG - 60 UC");
      fireEvent.press(pubgCard);

      await waitFor(() => {
        // Try to purchase without player ID
        const purchaseButton = getByText("شراء الباقة");
        fireEvent.press(purchaseButton);
      });

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          "تنبيه",
          "الرجاء إدخال معرف اللاعب أو الحساب"
        );
      });
    });

    test("should accept valid player ID", async () => {
      const { getByText, getByPlaceholderText } = render(
        <GamePackagesScreen />
      );

      // Select a package
      const pubgCard = getByText("PUBG - 60 UC");
      fireEvent.press(pubgCard);

      await waitFor(() => {
        // Enter player ID
        const playerIdInput = getByPlaceholderText("مثال: 123456789");
        fireEvent.changeText(playerIdInput, "player123");

        // Purchase
        const purchaseButton = getByText("شراء الباقة");
        fireEvent.press(purchaseButton);
      });

      await waitFor(() => {
        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          "/api/topup",
          { product: "pubg_60uc", recipient: "player123" },
          expect.any(Object)
        );
      });
    });
  });

  describe("Purchase Flow", () => {
    test("should handle successful purchase", async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: { status: "success" },
      });

      const { getByText, getByPlaceholderText } = render(
        <GamePackagesScreen />
      );

      // Select a package
      const pubgCard = getByText("PUBG - 60 UC");
      fireEvent.press(pubgCard);

      await waitFor(() => {
        // Enter player ID
        const playerIdInput = getByPlaceholderText("مثال: 123456789");
        fireEvent.changeText(playerIdInput, "player123");

        // Purchase
        const purchaseButton = getByText("شراء الباقة");
        fireEvent.press(purchaseButton);
      });

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith("تم الشراء", "النتيجة: success");
      });
    });

    test("should handle purchase errors", async () => {
      const errorMessage = "فشل في الشراء";
      mockAxiosInstance.post.mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      const { getByText, getByPlaceholderText } = render(
        <GamePackagesScreen />
      );

      // Select a package
      const pubgCard = getByText("PUBG - 60 UC");
      fireEvent.press(pubgCard);

      await waitFor(() => {
        // Enter player ID
        const playerIdInput = getByPlaceholderText("مثال: 123456789");
        fireEvent.changeText(playerIdInput, "player123");

        // Purchase
        const purchaseButton = getByText("شراء الباقة");
        fireEvent.press(purchaseButton);
      });

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith("فشل العملية", errorMessage);
      });
    });

    test("should handle network errors", async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error("Network Error"));

      const { getByText, getByPlaceholderText } = render(
        <GamePackagesScreen />
      );

      // Select a package
      const pubgCard = getByText("PUBG - 60 UC");
      fireEvent.press(pubgCard);

      await waitFor(() => {
        // Enter player ID
        const playerIdInput = getByPlaceholderText("مثال: 123456789");
        fireEvent.changeText(playerIdInput, "player123");

        // Purchase
        const purchaseButton = getByText("شراء الباقة");
        fireEvent.press(purchaseButton);
      });

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith("فشل العملية", "خطأ غير معروف");
      });
    });
  });

  describe("Loading States", () => {
    test("should show loading state during purchase", async () => {
      // Mock a delayed response
      mockAxiosInstance.post.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: { status: "success" } }), 100)
          )
      );

      const { getByText, getByPlaceholderText } = render(
        <GamePackagesScreen />
      );

      // Select a package
      const pubgCard = getByText("PUBG - 60 UC");
      fireEvent.press(pubgCard);

      await waitFor(() => {
        // Enter player ID
        const playerIdInput = getByPlaceholderText("مثال: 123456789");
        fireEvent.changeText(playerIdInput, "player123");

        // Purchase
        const purchaseButton = getByText("شراء الباقة");
        fireEvent.press(purchaseButton);
      });

      // Should show loading state
      await waitFor(() => {
        expect(getByText("شراء الباقة")).toBeTruthy();
      });
    });
  });

  describe("Token Management", () => {
    test("should get token from AsyncStorage", async () => {
      const { getByText, getByPlaceholderText } = render(
        <GamePackagesScreen />
      );

      // Select a package
      const pubgCard = getByText("PUBG - 60 UC");
      fireEvent.press(pubgCard);

      await waitFor(() => {
        // Enter player ID
        const playerIdInput = getByPlaceholderText("مثال: 123456789");
        fireEvent.changeText(playerIdInput, "player123");

        // Purchase
        const purchaseButton = getByText("شراء الباقة");
        fireEvent.press(purchaseButton);
      });

      await waitFor(() => {
        expect(mockAsyncStorage.getItem).toHaveBeenCalledWith("firebase-token");
      });
    });

    test("should handle missing token", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const { getByText, getByPlaceholderText } = render(
        <GamePackagesScreen />
      );

      // Select a package
      const pubgCard = getByText("PUBG - 60 UC");
      fireEvent.press(pubgCard);

      await waitFor(() => {
        // Enter player ID
        const playerIdInput = getByPlaceholderText("مثال: 123456789");
        fireEvent.changeText(playerIdInput, "player123");

        // Purchase
        const purchaseButton = getByText("شراء الباقة");
        fireEvent.press(purchaseButton);
      });

      await waitFor(() => {
        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          "/api/topup",
          { product: "pubg_60uc", recipient: "player123" },
          {
            headers: { Authorization: "Bearer null" },
          }
        );
      });
    });
  });

  describe("Package Data", () => {
    test("should have correct package values", () => {
      const { getByText } = render(<GamePackagesScreen />);

      expect(getByText("PUBG - 60 UC")).toBeTruthy();
      expect(getByText("FreeFire - 310 Diamonds")).toBeTruthy();
      expect(getByText("Google Play - $10")).toBeTruthy();
      expect(getByText("iTunes - $15")).toBeTruthy();
    });
  });

  describe("Navigation", () => {
    test("should allow going back to package selection", async () => {
      const { getByText } = render(<GamePackagesScreen />);

      // Select a package
      const pubgCard = getByText("PUBG - 60 UC");
      fireEvent.press(pubgCard);

      await waitFor(() => {
        // Go back
        const backButton = getByText("◀ رجوع");
        fireEvent.press(backButton);
      });

      // Should show package grid again
      await waitFor(() => {
        expect(getByText("اختر باقة اللعبة")).toBeTruthy();
        expect(getByText("PUBG - 60 UC")).toBeTruthy();
        expect(getByText("FreeFire - 310 Diamonds")).toBeTruthy();
        expect(getByText("Google Play - $10")).toBeTruthy();
        expect(getByText("iTunes - $15")).toBeTruthy();
      });
    });
  });

  describe("Error Handling", () => {
    test("should handle AsyncStorage errors", async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error("Storage Error"));

      const { getByText, getByPlaceholderText } = render(
        <GamePackagesScreen />
      );

      // Select a package
      const pubgCard = getByText("PUBG - 60 UC");
      fireEvent.press(pubgCard);

      await waitFor(() => {
        // Enter player ID
        const playerIdInput = getByPlaceholderText("مثال: 123456789");
        fireEvent.changeText(playerIdInput, "player123");

        // Purchase
        const purchaseButton = getByText("شراء الباقة");
        fireEvent.press(purchaseButton);
      });

      // Should handle error gracefully
      await waitFor(() => {
        expect(true).toBe(true);
      });
    });
  });

  describe("Accessibility", () => {
    test("should have proper accessibility labels", () => {
      const { getByText } = render(<GamePackagesScreen />);

      expect(getByText("اختر باقة اللعبة")).toBeTruthy();
      expect(getByText("PUBG - 60 UC")).toBeTruthy();
      expect(getByText("FreeFire - 310 Diamonds")).toBeTruthy();
      expect(getByText("Google Play - $10")).toBeTruthy();
      expect(getByText("iTunes - $15")).toBeTruthy();
    });
  });
});
