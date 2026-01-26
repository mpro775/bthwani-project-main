// __tests__/api/passwordResetApi.test.ts
import {
  requestPasswordReset,
  resetPassword,
  verifyResetCode,
} from "../../api/passwordResetApi";

// Mock axios instance
jest.mock("@/utils/api/axiosInstance", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

import axiosInstance from "../../utils/api/axiosInstance";

describe("passwordResetApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("requestPasswordReset", () => {
    test("يتم طلب إعادة تعيين كلمة المرور بنجاح", async () => {
      const mockResponse = { data: { message: "تم إرسال رمز التحقق بنجاح" } };
      (axiosInstance.post as jest.Mock).mockResolvedValue(mockResponse);

      const email = "test@example.com";
      const result = await requestPasswordReset(email);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "auth/password/forgot",
        { email },
        {
          timeout: 10000,
          headers: { "Content-Type": "application/json" },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    test("يتعامل مع أخطاء طلب إعادة تعيين كلمة المرور", async () => {
      const error = new Error("فشل في إرسال رمز التحقق");
      (axiosInstance.post as jest.Mock).mockRejectedValue(error);

      const email = "test@example.com";

      await expect(requestPasswordReset(email)).rejects.toThrow(
        "فشل في إرسال رمز التحقق"
      );
    });

    test("يتعامل مع timeout", async () => {
      const timeoutError = new Error("timeout of 10000ms exceeded");
      (axiosInstance.post as jest.Mock).mockRejectedValue(timeoutError);

      const email = "test@example.com";

      await expect(requestPasswordReset(email)).rejects.toThrow(
        "timeout of 10000ms exceeded"
      );
    });
  });

  describe("verifyResetCode", () => {
    test("يتم التحقق من رمز إعادة التعيين بنجاح", async () => {
      const mockResponse = {
        data: { ok: true, resetToken: "reset-token-123" },
      };
      (axiosInstance.post as jest.Mock).mockResolvedValue(mockResponse);

      const email = "test@example.com";
      const code = "123456";
      const result = await verifyResetCode(email, code);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "auth/password/verify",
        { email: "test@example.com", code: "123456" },
        { timeout: 15000 }
      );
      expect(result).toEqual({ ok: true, resetToken: "reset-token-123" });
    });

    test("يقوم بتنظيف البريد الإلكتروني والرمز", async () => {
      const mockResponse = {
        data: { ok: true, resetToken: "reset-token-123" },
      };
      (axiosInstance.post as jest.Mock).mockResolvedValue(mockResponse);

      const email = "  TEST@EXAMPLE.COM  ";
      const code = "  123456  ";
      await verifyResetCode(email, code);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "auth/password/verify",
        { email: "test@example.com", code: "123456" },
        { timeout: 15000 }
      );
    });

    test("يتعامل مع أخطاء التحقق من الرمز", async () => {
      const error = new Error("رمز التحقق غير صحيح");
      (axiosInstance.post as jest.Mock).mockRejectedValue(error);

      const email = "test@example.com";
      const code = "123456";

      await expect(verifyResetCode(email, code)).rejects.toThrow(
        "رمز التحقق غير صحيح"
      );
    });

    test("يتعامل مع timeout في التحقق", async () => {
      const timeoutError = new Error("timeout of 15000ms exceeded");
      (axiosInstance.post as jest.Mock).mockRejectedValue(timeoutError);

      const email = "test@example.com";
      const code = "123456";

      await expect(verifyResetCode(email, code)).rejects.toThrow(
        "timeout of 15000ms exceeded"
      );
    });
  });

  describe("resetPassword", () => {
    test("يتم إعادة تعيين كلمة المرور بنجاح", async () => {
      const mockResponse = {
        data: { ok: true, message: "تم تغيير كلمة المرور بنجاح" },
      };
      (axiosInstance.post as jest.Mock).mockResolvedValue(mockResponse);

      const resetToken = "reset-token-123";
      const newPassword = "newPassword123";
      const result = await resetPassword(resetToken, newPassword);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "auth/password/reset",
        { resetToken, newPassword },
        { timeout: 15000 }
      );
      expect(result).toEqual({
        ok: true,
        message: "تم تغيير كلمة المرور بنجاح",
      });
    });

    test("يتعامل مع أخطاء إعادة تعيين كلمة المرور", async () => {
      const error = new Error("فشل في تغيير كلمة المرور");
      (axiosInstance.post as jest.Mock).mockRejectedValue(error);

      const resetToken = "reset-token-123";
      const newPassword = "newPassword123";

      await expect(resetPassword(resetToken, newPassword)).rejects.toThrow(
        "فشل في تغيير كلمة المرور"
      );
    });

    test("يتعامل مع timeout في إعادة تعيين كلمة المرور", async () => {
      const timeoutError = new Error("timeout of 15000ms exceeded");
      (axiosInstance.post as jest.Mock).mockRejectedValue(timeoutError);

      const resetToken = "reset-token-123";
      const newPassword = "newPassword123";

      await expect(resetPassword(resetToken, newPassword)).rejects.toThrow(
        "timeout of 15000ms exceeded"
      );
    });

    test("يتعامل مع resetToken فارغ", async () => {
      const error = new Error("resetToken مطلوب");
      (axiosInstance.post as jest.Mock).mockRejectedValue(error);

      const resetToken = "";
      const newPassword = "newPassword123";

      await expect(resetPassword(resetToken, newPassword)).rejects.toThrow(
        "resetToken مطلوب"
      );
    });

    test("يتعامل مع كلمة مرور فارغة", async () => {
      const error = new Error("كلمة المرور الجديدة مطلوبة");
      (axiosInstance.post as jest.Mock).mockRejectedValue(error);

      const resetToken = "reset-token-123";
      const newPassword = "";

      await expect(resetPassword(resetToken, newPassword)).rejects.toThrow(
        "كلمة المرور الجديدة مطلوبة"
      );
    });
  });

  describe("Integration Tests", () => {
    test("سير العملية الكاملة لإعادة تعيين كلمة المرور", async () => {
      // Step 1: Request password reset
      const requestResponse = { data: { message: "تم إرسال رمز التحقق" } };
      (axiosInstance.post as jest.Mock).mockResolvedValueOnce(requestResponse);

      await requestPasswordReset("test@example.com");
      expect(axiosInstance.post).toHaveBeenCalledWith(
        "auth/password/forgot",
        { email: "test@example.com" },
        expect.any(Object)
      );

      // Step 2: Verify reset code
      const verifyResponse = {
        data: { ok: true, resetToken: "reset-token-123" },
      };
      (axiosInstance.post as jest.Mock).mockResolvedValueOnce(verifyResponse);

      const verificationResult = await verifyResetCode(
        "test@example.com",
        "123456"
      );
      expect(verificationResult).toEqual({
        ok: true,
        resetToken: "reset-token-123",
      });

      // Step 3: Reset password
      const resetResponse = {
        data: { ok: true, message: "تم تغيير كلمة المرور" },
      };
      (axiosInstance.post as jest.Mock).mockResolvedValueOnce(resetResponse);

      const resetResult = await resetPassword(
        "reset-token-123",
        "newPassword123"
      );
      expect(resetResult).toEqual({
        ok: true,
        message: "تم تغيير كلمة المرور",
      });

      // Verify all calls were made
      expect(axiosInstance.post).toHaveBeenCalledTimes(3);
    });
  });
});
