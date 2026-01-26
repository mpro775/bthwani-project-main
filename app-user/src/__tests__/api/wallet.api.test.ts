// __tests__/api/wallet.api.test.ts
import { chargeViaKuraimi, getWallet } from "../../api/wallet.api";

// Mock axios instance
jest.mock("utils/api/axiosInstance", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

import axiosInstance from "../../utils/api/axiosInstance";

describe("wallet.api", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getWallet", () => {
    test("يتم جلب معلومات المحفظة بنجاح", async () => {
      const mockResponse = {
        data: {
          id: "wallet-123",
          balance: 1500.5,
          currency: "YER",
          userId: "user-123",
          lastUpdated: "2024-01-01T10:00:00Z",
          status: "active",
        },
      };
      (axiosInstance.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getWallet();

      expect(axiosInstance.get).toHaveBeenCalledWith("/wallet");
      expect(result).toEqual(mockResponse.data);
    });

    test("يتم جلب محفظة فارغة", async () => {
      const mockResponse = {
        data: {
          id: "wallet-123",
          balance: 0,
          currency: "YER",
          userId: "user-123",
          lastUpdated: "2024-01-01T10:00:00Z",
          status: "active",
        },
      };
      (axiosInstance.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getWallet();

      expect(axiosInstance.get).toHaveBeenCalledWith("/wallet");
      expect(result).toEqual(mockResponse.data);
      expect(result.balance).toBe(0);
    });

    test("يتعامل مع أخطاء جلب المحفظة", async () => {
      const error = new Error("فشل في جلب معلومات المحفظة");
      (axiosInstance.get as jest.Mock).mockRejectedValue(error);

      await expect(getWallet()).rejects.toThrow("فشل في جلب معلومات المحفظة");
    });

    test("يتعامل مع محفظة غير موجودة", async () => {
      const error = new Error("المحفظة غير موجودة");
      (axiosInstance.get as jest.Mock).mockRejectedValue(error);

      await expect(getWallet()).rejects.toThrow("المحفظة غير موجودة");
    });

    test("يتعامل مع محفظة معطلة", async () => {
      const mockResponse = {
        data: {
          id: "wallet-123",
          balance: 1000,
          currency: "YER",
          userId: "user-123",
          lastUpdated: "2024-01-01T10:00:00Z",
          status: "suspended",
        },
      };
      (axiosInstance.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getWallet();

      expect(result.status).toBe("suspended");
      expect(result.balance).toBe(1000);
    });

    test("يتعامل مع محفظة بدون رصيد", async () => {
      const mockResponse = {
        data: {
          id: "wallet-123",
          balance: -50, // رصيد سالب
          currency: "YER",
          userId: "user-123",
          lastUpdated: "2024-01-01T10:00:00Z",
          status: "active",
        },
      };
      (axiosInstance.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getWallet();

      expect(result.balance).toBe(-50);
      expect(result.status).toBe("active");
    });
  });

  describe("chargeViaKuraimi", () => {
    test("يتم شحن المحفظة عبر كريمي بنجاح", async () => {
      const mockResponse = {
        data: {
          id: "transaction-123",
          amount: 500,
          status: "completed",
          method: "kuraimi",
          transactionId: "kuraimi-tx-123",
          timestamp: "2024-01-01T10:00:00Z",
          newBalance: 2000.5,
        },
      };
      (axiosInstance.post as jest.Mock).mockResolvedValue(mockResponse);

      const chargeData = {
        amount: 500,
        SCustID: "customer-123",
        PINPASS: "1234",
      };
      const result = await chargeViaKuraimi(chargeData);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/wallet/charge/kuraimi",
        chargeData
      );
      expect(result).toEqual(mockResponse.data);
      expect(result.status).toBe("completed");
      expect(result.data.method).toBe("kuraimi");
    });

    test("يتم شحن مبلغ صغير", async () => {
      const mockResponse = {
        data: {
          id: "transaction-124",
          amount: 10,
          status: "completed",
          method: "kuraimi",
          transactionId: "kuraimi-tx-124",
          timestamp: "2024-01-01T10:00:00Z",
          newBalance: 1510.5,
        },
      };
      (axiosInstance.post as jest.Mock).mockResolvedValue(mockResponse);

      const chargeData = {
        amount: 10,
        SCustID: "customer-123",
        PINPASS: "1234",
      };
      const result = await chargeViaKuraimi(chargeData);

      expect(result.data.amount).toBe(10);
      expect(result.status).toBe("completed");
    });

    test("يتم شحن مبلغ كبير", async () => {
      const mockResponse = {
        data: {
          id: "transaction-125",
          amount: 10000,
          status: "completed",
          method: "kuraimi",
          transactionId: "kuraimi-tx-125",
          timestamp: "2024-01-01T10:00:00Z",
          newBalance: 11500.5,
        },
      };
      (axiosInstance.post as jest.Mock).mockResolvedValue(mockResponse);

      const chargeData = {
        amount: 10000,
        SCustID: "customer-123",
        PINPASS: "1234",
      };
      const result = await chargeViaKuraimi(chargeData);

      expect(result.data.amount).toBe(10000);
      expect(result.status).toBe("completed");
    });

    test("يتعامل مع أخطاء الشحن", async () => {
      const error = new Error("فشل في شحن المحفظة");
      (axiosInstance.post as jest.Mock).mockRejectedValue(error);

      const chargeData = {
        amount: 500,
        SCustID: "customer-123",
        PINPASS: "1234",
      };

      await expect(chargeViaKuraimi(chargeData)).rejects.toThrow(
        "فشل في شحن المحفظة"
      );
    });

    test("يتعامل مع مبلغ غير صحيح", async () => {
      const error = new Error("المبلغ يجب أن يكون أكبر من صفر");
      (axiosInstance.post as jest.Mock).mockRejectedValue(error);

      const chargeData = {
        amount: -100,
        SCustID: "customer-123",
        PINPASS: "1234",
      };

      await expect(chargeViaKuraimi(chargeData)).rejects.toThrow(
        "المبلغ يجب أن يكون أكبر من صفر"
      );
    });

    test("يتعامل مع مبلغ صفر", async () => {
      const error = new Error("المبلغ يجب أن يكون أكبر من صفر");
      (axiosInstance.post as jest.Mock).mockRejectedValue(error);

      const chargeData = {
        amount: 0,
        SCustID: "customer-123",
        PINPASS: "1234",
      };

      await expect(chargeViaKuraimi(chargeData)).rejects.toThrow(
        "المبلغ يجب أن يكون أكبر من صفر"
      );
    });

    test("يتعامل مع SCustID فارغ", async () => {
      const error = new Error("معرف العميل مطلوب");
      (axiosInstance.post as jest.Mock).mockRejectedValue(error);

      const chargeData = {
        amount: 500,
        SCustID: "",
        PINPASS: "1234",
      };

      await expect(chargeViaKuraimi(chargeData)).rejects.toThrow(
        "معرف العميل مطلوب"
      );
    });

    test("يتعامل مع PINPASS فارغ", async () => {
      const error = new Error("كلمة المرور مطلوبة");
      (axiosInstance.post as jest.Mock).mockRejectedValue(error);

      const chargeData = {
        amount: 500,
        SCustID: "customer-123",
        PINPASS: "",
      };

      await expect(chargeViaKuraimi(chargeData)).rejects.toThrow(
        "كلمة المرور مطلوبة"
      );
    });

    test("يتعامل مع SCustID غير صحيح", async () => {
      const error = new Error("معرف العميل غير صحيح");
      (axiosInstance.post as jest.Mock).mockRejectedValue(error);

      const chargeData = {
        amount: 500,
        SCustID: "invalid-customer",
        PINPASS: "1234",
      };

      await expect(chargeViaKuraimi(chargeData)).rejects.toThrow(
        "معرف العميل غير صحيح"
      );
    });

    test("يتعامل مع PINPASS غير صحيح", async () => {
      const error = new Error("كلمة المرور غير صحيحة");
      (axiosInstance.post as jest.Mock).mockRejectedValue(error);

      const chargeData = {
        amount: 500,
        SCustID: "customer-123",
        PINPASS: "9999",
      };

      await expect(chargeViaKuraimi(chargeData)).rejects.toThrow(
        "كلمة المرور غير صحيحة"
      );
    });

    test("يتعامل مع رصيد غير كافي في حساب كريمي", async () => {
      const error = new Error("رصيد غير كافي في حساب كريمي");
      (axiosInstance.post as jest.Mock).mockRejectedValue(error);

      const chargeData = {
        amount: 10000,
        SCustID: "customer-123",
        PINPASS: "1234",
      };

      await expect(chargeViaKuraimi(chargeData)).rejects.toThrow(
        "رصيد غير كافي في حساب كريمي"
      );
    });

    test("يتعامل مع network timeout", async () => {
      const timeoutError = new Error("timeout of 10000ms exceeded");
      (axiosInstance.post as jest.Mock).mockRejectedValue(timeoutError);

      const chargeData = {
        amount: 500,
        SCustID: "customer-123",
        PINPASS: "1234",
      };

      await expect(chargeViaKuraimi(chargeData)).rejects.toThrow(
        "timeout of 10000ms exceeded"
      );
    });
  });

  describe("Integration Tests", () => {
    test("سير العملية الكاملة للمحفظة", async () => {
      // Step 1: Get current wallet balance
      const getWalletResponse = {
        data: {
          id: "wallet-123",
          balance: 1500.5,
          currency: "YER",
          userId: "user-123",
          status: "active",
        },
      };
      (axiosInstance.get as jest.Mock).mockResolvedValueOnce(getWalletResponse);

      const wallet = await getWallet();
      expect(wallet.balance).toBe(1500.5);

      // Step 2: Charge wallet via Kuraimi
      const chargeResponse = {
        data: {
          id: "transaction-123",
          amount: 500,
          status: "completed",
          method: "kuraimi",
          newBalance: 2000.5,
        },
      };
      (axiosInstance.post as jest.Mock).mockResolvedValueOnce(chargeResponse);

      const chargeData = {
        amount: 500,
        SCustID: "customer-123",
        PINPASS: "1234",
      };
      const transaction = await chargeViaKuraimi(chargeData);
      expect(transaction.status).toBe("completed");
      expect(transaction.data.newBalance).toBe(2000.5);

      // Step 3: Get updated wallet balance
      const updatedWalletResponse = {
        data: {
          id: "wallet-123",
          balance: 2000.5,
          currency: "YER",
          userId: "user-123",
          status: "active",
        },
      };
      (axiosInstance.get as jest.Mock).mockResolvedValueOnce(
        updatedWalletResponse
      );

      const updatedWallet = await getWallet();
      expect(updatedWallet.balance).toBe(2000.5);

      // Verify all API calls were made
      expect(axiosInstance.get).toHaveBeenCalledTimes(2);
      expect(axiosInstance.post).toHaveBeenCalledTimes(1);
    });

    test("يتعامل مع فشل الشحن مع الحفاظ على الرصيد الأصلي", async () => {
      // Step 1: Get initial wallet balance
      const initialWalletResponse = {
        data: {
          id: "wallet-123",
          balance: 1500.5,
          currency: "YER",
          userId: "user-123",
          status: "active",
        },
      };
      (axiosInstance.get as jest.Mock).mockResolvedValueOnce(
        initialWalletResponse
      );

      const initialWallet = await getWallet();
      expect(initialWallet.balance).toBe(1500.5);

      // Step 2: Attempt to charge (fails)
      const error = new Error("فشل في شحن المحفظة");
      (axiosInstance.post as jest.Mock).mockRejectedValueOnce(error);

      const chargeData = {
        amount: 500,
        SCustID: "customer-123",
        PINPASS: "1234",
      };

      await expect(chargeViaKuraimi(chargeData)).rejects.toThrow(
        "فشل في شحن المحفظة"
      );

      // Step 3: Verify wallet balance remains unchanged
      const finalWalletResponse = {
        data: {
          id: "wallet-123",
          balance: 1500.5, // نفس الرصيد
          currency: "YER",
          userId: "user-123",
          status: "active",
        },
      };
      (axiosInstance.get as jest.Mock).mockResolvedValueOnce(
        finalWalletResponse
      );

      const finalWallet = await getWallet();
      expect(finalWallet.balance).toBe(1500.5);

      // Verify API calls
      expect(axiosInstance.get).toHaveBeenCalledTimes(2);
      expect(axiosInstance.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("Edge Cases", () => {
    test("يتعامل مع استجابة API فارغة", async () => {
      const mockResponse = { data: null };
      (axiosInstance.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getWallet();
      expect(result).toBeNull();
    });

    test("يتعامل مع استجابة API مع data undefined", async () => {
      const mockResponse = { data: undefined };
      (axiosInstance.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getWallet();
      expect(result).toBeUndefined();
    });

    test("يتعامل مع مبالغ عشرية", async () => {
      const mockResponse = {
        data: {
          id: "transaction-126",
          amount: 99.99,
          status: "completed",
          method: "kuraimi",
          newBalance: 1600.49,
        },
      };
      (axiosInstance.post as jest.Mock).mockResolvedValue(mockResponse);

      const chargeData = {
        amount: 99.99,
        SCustID: "customer-123",
        PINPASS: "1234",
      };
      const result = await chargeViaKuraimi(chargeData);

      expect(result.data.amount).toBe(99.99);
      expect(result.status).toBe("completed");
    });

    test("يتعامل مع مبالغ كبيرة جداً", async () => {
      const mockResponse = {
        data: {
          id: "transaction-127",
          amount: 999999.99,
          status: "completed",
          method: "kuraimi",
          newBalance: 1001499.49,
        },
      };
      (axiosInstance.post as jest.Mock).mockResolvedValue(mockResponse);

      const chargeData = {
        amount: 999999.99,
        SCustID: "customer-123",
        PINPASS: "1234",
      };
      const result = await chargeViaKuraimi(chargeData);

      expect(result.data.amount).toBe(999999.99);
      expect(result.status).toBe("completed");
    });

    test("يتعامل مع محفظة معطلة", async () => {
      const mockResponse = {
        data: {
          id: "wallet-123",
          balance: 1000,
          currency: "YER",
          userId: "user-123",
          status: "suspended",
        },
      };
      (axiosInstance.get as jest.Mock).mockResolvedValue(mockResponse);

      const wallet = await getWallet();
      expect(wallet.status).toBe("suspended");

      // محاولة الشحن مع محفظة معطلة
      const error = new Error("المحفظة معطلة");
      (axiosInstance.post as jest.Mock).mockRejectedValue(error);

      const chargeData = {
        amount: 500,
        SCustID: "customer-123",
        PINPASS: "1234",
      };

      await expect(chargeViaKuraimi(chargeData)).rejects.toThrow(
        "المحفظة معطلة"
      );
    });
  });

  describe("Error Handling", () => {
    test("يتعامل مع أخطاء HTTP متعددة", async () => {
      // Test 400 Bad Request
      const badRequestError = new Error("Bad Request");
      (axiosInstance.post as jest.Mock).mockRejectedValueOnce(badRequestError);

      const chargeData = {
        amount: 500,
        SCustID: "customer-123",
        PINPASS: "1234",
      };

      await expect(chargeViaKuraimi(chargeData)).rejects.toThrow("Bad Request");

      // Test 401 Unauthorized
      const unauthorizedError = new Error("Unauthorized");
      (axiosInstance.post as jest.Mock).mockRejectedValueOnce(
        unauthorizedError
      );

      await expect(chargeViaKuraimi(chargeData)).rejects.toThrow(
        "Unauthorized"
      );

      // Test 500 Internal Server Error
      const serverError = new Error("Internal Server Error");
      (axiosInstance.post as jest.Mock).mockRejectedValueOnce(serverError);

      await expect(chargeViaKuraimi(chargeData)).rejects.toThrow(
        "Internal Server Error"
      );
    });

    test("يتعامل مع أخطاء الشبكة", async () => {
      const networkError = new Error("Network Error");
      (axiosInstance.get as jest.Mock).mockRejectedValue(networkError);

      await expect(getWallet()).rejects.toThrow("Network Error");
    });

    test("يتعامل مع أخطاء JSON parsing", async () => {
      const jsonError = new Error("Unexpected token < in JSON at position 0");
      (axiosInstance.get as jest.Mock).mockRejectedValue(jsonError);

      await expect(getWallet()).rejects.toThrow(
        "Unexpected token < in JSON at position 0"
      );
    });
  });
});
