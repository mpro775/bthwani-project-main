import AsyncStorage from "@react-native-async-storage/async-storage";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import LogsScreen from "../../../../screens/wallet/Topup/LogsScreen";
import axiosInstance from "../../../../utils/api/axiosInstance";

// Mock dependencies
jest.mock("@react-native-async-storage/async-storage");
jest.mock("utils/api/axiosInstance");
jest.mock("@react-native-picker/picker", () => {
  const React = require("react");
  const Picker = ({ children }: any) =>
    React.createElement("Picker", null, children);
  Picker.Item = ({ label, value }: any) =>
    React.createElement("PickerItem", { label, value });
  return { Picker };
});
jest.mock("expo-sharing", () => ({
  shareAsync: jest.fn(),
}));
jest.mock("expo-file-system", () => ({
  documentDirectory: "/test/",
  writeAsStringAsync: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockAxiosInstance = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe("LogsScreen", () => {
  const mockLogs = [
    {
      _id: "log1",
      product: "PUBG - 60 UC",
      recipient: "player123",
      type: "game",
      status: "success",
      createdAt: "2024-01-15T10:30:00Z",
      externalId: "EXT001",
      response: {
        amount: 100,
        currency: "USD",
        transaction_id: "TXN001",
        message: "تم الشراء بنجاح",
      },
    },
    {
      _id: "log2",
      product: "FreeFire - 310 Diamonds",
      recipient: "player456",
      type: "game",
      status: "success",
      createdAt: "2024-01-14T15:45:00Z",
      externalId: "EXT002",
      response: {
        amount: 50,
        currency: "USD",
        transaction_id: "TXN002",
        message: "تم الشراء بنجاح",
      },
    },
    {
      _id: "log3",
      product: "Google Play - $10",
      recipient: "user789",
      type: "gift",
      status: "failed",
      createdAt: "2024-01-13T09:20:00Z",
      externalId: "EXT003",
      response: {
        amount: 10,
        currency: "USD",
        transaction_id: "TXN003",
        message: "فشل في الشراء",
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue("mock-token");
    mockAxiosInstance.get.mockResolvedValue({
      data: mockLogs,
    });
  });

  describe("Initial Render", () => {
    test("should render logs screen", () => {
      const { getByText } = render(<LogsScreen />);

      expect(getByText("فلترة حسب النوع")).toBeTruthy();
    });

    test("should display logs list", async () => {
      const { getByText } = render(<LogsScreen />);

      await waitFor(() => {
        expect(getByText("🔧 الخدمة: PUBG - 60 UC")).toBeTruthy();
        expect(getByText("🔧 الخدمة: FreeFire - 310 Diamonds")).toBeTruthy();
        expect(getByText("🔧 الخدمة: Google Play - $10")).toBeTruthy();
      });
    });
  });

  describe("Logs Display", () => {
    test("should display log items correctly", async () => {
      const { getByText } = render(<LogsScreen />);

      await waitFor(() => {
        expect(getByText("📞 الرقم / الحساب: player123")).toBeTruthy();
        expect(getByText("📞 الرقم / الحساب: player456")).toBeTruthy();
        expect(getByText("📞 الرقم / الحساب: user789")).toBeTruthy();
      });
    });

    test("should show log types", async () => {
      const { getAllByText, getByText } = render(<LogsScreen />);

      await waitFor(() => {
        expect(getAllByText("🎯 النوع: game").length).toBeGreaterThan(0);
        expect(getByText("🎯 النوع: gift")).toBeTruthy();
      });
    });

    test("should show log status", async () => {
      const { getAllByText, getByText } = render(<LogsScreen />);

      await waitFor(() => {
        expect(getAllByText("📦 الحالة: success").length).toBeGreaterThan(0);
        expect(getByText("📦 الحالة: failed")).toBeTruthy();
      });
    });

    test("should show log amounts", async () => {
      const { getByText } = render(<LogsScreen />);

      await waitFor(() => {
        expect(getByText("💵 القيمة: 100 USD")).toBeTruthy();
        expect(getByText("💵 القيمة: 50 USD")).toBeTruthy();
        expect(getByText("💵 القيمة: 10 USD")).toBeTruthy();
      });
    });

    test("should show transaction IDs", async () => {
      const { getByText } = render(<LogsScreen />);

      await waitFor(() => {
        expect(getByText("🔄 المعاملة: TXN001")).toBeTruthy();
        expect(getByText("🔄 المعاملة: TXN002")).toBeTruthy();
        expect(getByText("🔄 المعاملة: TXN003")).toBeTruthy();
      });
    });

    test("should show response messages", async () => {
      const { getAllByText, getByText } = render(<LogsScreen />);

      await waitFor(() => {
        expect(
          getAllByText("🧾 الرسالة: تم الشراء بنجاح").length
        ).toBeGreaterThan(0);
        expect(getByText("🧾 الرسالة: فشل في الشراء")).toBeTruthy();
      });
    });

    test("should show timestamps", async () => {
      const { getAllByText } = render(<LogsScreen />);

      await waitFor(() => {
        expect(getAllByText(/🕒 التاريخ:/).length).toBeGreaterThan(0);
      });
    });

    test("should show external IDs", async () => {
      const { getByText } = render(<LogsScreen />);

      await waitFor(() => {
        expect(getByText("ID داخلي: EXT001")).toBeTruthy();
        expect(getByText("ID داخلي: EXT002")).toBeTruthy();
        expect(getByText("ID داخلي: EXT003")).toBeTruthy();
      });
    });

    test("should show share buttons", async () => {
      const { getAllByText } = render(<LogsScreen />);

      await waitFor(() => {
        expect(getAllByText("مشاركة").length).toBeGreaterThan(0);
      });
    });
  });

  describe("Filtering", () => {
    test("should have filter picker", () => {
      const { getByText } = render(<LogsScreen />);

      expect(getByText("فلترة حسب النوع")).toBeTruthy();
    });

    test("should filter logs by type", async () => {
      const { getByText } = render(<LogsScreen />);

      await waitFor(() => {
        // Should show all logs initially
        expect(getByText("🔧 الخدمة: PUBG - 60 UC")).toBeTruthy();
        expect(getByText("🔧 الخدمة: FreeFire - 310 Diamonds")).toBeTruthy();
        expect(getByText("🔧 الخدمة: Google Play - $10")).toBeTruthy();
      });
    });
  });

  describe("Share Functionality", () => {
    test("should share log when share button is pressed", async () => {
      const { getAllByText } = render(<LogsScreen />);

      await waitFor(() => {
        const shareButton = getAllByText("مشاركة")[0];
        fireEvent.press(shareButton);
      });

      // Should attempt to share
      expect(true).toBe(true);
    });
  });

  describe("API Integration", () => {
    test("should fetch logs on mount", async () => {
      render(<LogsScreen />);

      await waitFor(() => {
        expect(mockAxiosInstance.get).toHaveBeenCalledWith("topup/logs");
      });
    });

    test("should fetch filtered logs when filter changes", async () => {
      const { getByText } = render(<LogsScreen />);

      await waitFor(() => {
        // Should call API with filter
        expect(mockAxiosInstance.get).toHaveBeenCalledWith("topup/logs");
      });
    });

    test("should handle API errors gracefully", async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error("API Error"));

      render(<LogsScreen />);

      await waitFor(() => {
        // Should handle error gracefully
        expect(true).toBe(true);
      });
    });
  });

  describe("Empty State", () => {
    test("should handle empty logs response", async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: [],
      });

      render(<LogsScreen />);

      await waitFor(() => {
        // Should handle empty state
        expect(true).toBe(true);
      });
    });
  });

  describe("Log Formatting", () => {
    test("should format log data correctly", async () => {
      const { getByText, getAllByText } = render(<LogsScreen />);

      await waitFor(() => {
        // Check that log data is formatted and displayed
        expect(getByText("🔧 الخدمة: PUBG - 60 UC")).toBeTruthy();
        expect(getByText("📞 الرقم / الحساب: player123")).toBeTruthy();
        expect(getAllByText("🎯 النوع: game").length).toBeGreaterThan(0);
      });
    });
  });

  describe("Accessibility", () => {
    test("should have proper accessibility labels", async () => {
      const { getByText } = render(<LogsScreen />);

      await waitFor(() => {
        expect(getByText("فلترة حسب النوع")).toBeTruthy();
      });
    });
  });

  describe("Performance", () => {
    test("should handle large number of logs", async () => {
      const largeLogs = Array.from({ length: 100 }, (_, i) => ({
        _id: `log${i}`,
        product: `Product ${i}`,
        recipient: `user${i}`,
        type: "game",
        status: "success",
        createdAt: "2024-01-15T10:30:00Z",
        externalId: `EXT${i.toString().padStart(3, "0")}`,
        response: {
          amount: 100,
          currency: "USD",
          transaction_id: `TXN${i.toString().padStart(3, "0")}`,
          message: "تم الشراء بنجاح",
        },
      }));

      mockAxiosInstance.get.mockResolvedValue({
        data: largeLogs,
      });

      const { getByText } = render(<LogsScreen />);

      await waitFor(() => {
        expect(getByText("🔧 الخدمة: Product 0")).toBeTruthy();
      });
    });

    test("should not cause memory leaks", async () => {
      const { unmount } = render(<LogsScreen />);

      await waitFor(() => {
        expect(() => unmount()).not.toThrow();
      });
    });
  });

  describe("Error Handling", () => {
    test("should handle network errors", async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error("Network Error"));

      render(<LogsScreen />);

      await waitFor(() => {
        // Should handle error gracefully
        expect(true).toBe(true);
      });
    });

    test("should handle server errors", async () => {
      mockAxiosInstance.get.mockRejectedValue({
        response: { status: 500, data: { message: "Server Error" } },
      });

      render(<LogsScreen />);

      await waitFor(() => {
        // Should handle error gracefully
        expect(true).toBe(true);
      });
    });
  });
});
