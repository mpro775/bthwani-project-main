// __tests__/authService.test.ts
import {
  fetchWithAuth,
  loginWithEmail,
  refreshIdToken,
  registerWithEmail,
  sendPasswordReset,
  storeFirebaseTokens,
} from "../../api/authService";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiSet: jest.fn(),
  multiGet: jest.fn(),
}));

// Mock axios
jest.mock("axios", () => ({
  post: jest.fn(),
}));

// Mock marketing/push
jest.mock("marketing/push", () => ({
  registerPushToken: jest.fn(),
}));

// Mock utils/lib/track
jest.mock("utils/lib/track", () => ({
  track: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { registerPushToken } from "../../marketing/push";
import { track } from "../../utils/lib/track";

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock AsyncStorage defaults
    (AsyncStorage.multiSet as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([
      ["", null],
      ["", null],
    ]);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    // Mock axios defaults
    (axios.post as jest.Mock).mockResolvedValue({ data: {} });

    // Mock fetch defaults
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  describe("registerWithEmail", () => {
    test("يتم التسجيل بنجاح", async () => {
      const mockResponse = { idToken: "token123", localId: "user123" };
      (axios.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await registerWithEmail("test@example.com", "password123");

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/accounts:signUp"),
        {
          email: "test@example.com",
          password: "password123",
          returnSecureToken: true,
        }
      );
      expect(result).toEqual(mockResponse);
    });

    test("يتعامل مع أخطاء التسجيل", async () => {
      const error = new Error("Registration failed");
      (axios.post as jest.Mock).mockRejectedValue(error);

      await expect(
        registerWithEmail("test@example.com", "password123")
      ).rejects.toThrow("Registration failed");
    });
  });

  describe("loginWithEmail", () => {
    test("يتم تسجيل الدخول بنجاح", async () => {
      const mockResponse = {
        idToken: "token123",
        refreshToken: "refresh123",
        expiresIn: "3600",
        localId: "user123",
        email: "test@example.com",
      };
      (axios.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await loginWithEmail("test@example.com", "password123");

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/accounts:signInWithPassword"),
        {
          email: "test@example.com",
          password: "password123",
          returnSecureToken: true,
        }
      );
      expect(AsyncStorage.multiSet).toHaveBeenCalledWith([
        ["firebase-idToken", "token123"],
        ["firebase-refreshToken", "refresh123"],
        ["firebase-expiryTime", expect.any(String)],
      ]);
      expect(result).toEqual(mockResponse);
    });

    test("يتعامل مع فشل track بدون كسر تسجيل الدخول", async () => {
      const mockResponse = {
        idToken: "token123",
        refreshToken: "refresh123",
        expiresIn: "3600",
      };
      (axios.post as jest.Mock).mockResolvedValue({ data: mockResponse });
      (track as jest.Mock).mockRejectedValue(new Error("Track failed"));

      const result = await loginWithEmail("test@example.com", "password123");

      expect(result).toEqual(mockResponse);
      expect(track).toHaveBeenCalledWith({ type: "login" });
    });

    test("يتعامل مع فشل push registration بدون كسر تسجيل الدخول", async () => {
      const mockResponse = {
        idToken: "token123",
        refreshToken: "refresh123",
        expiresIn: "3600",
      };
      (axios.post as jest.Mock).mockResolvedValue({ data: mockResponse });
      (registerPushToken as jest.Mock).mockRejectedValue(
        new Error("Push failed")
      );

      const result = await loginWithEmail("test@example.com", "password123");

      expect(result).toEqual(mockResponse);
      expect(registerPushToken).toHaveBeenCalled();
    });

    test("يتعامل مع أخطاء تسجيل الدخول", async () => {
      const error = new Error("Login failed");
      (axios.post as jest.Mock).mockRejectedValue(error);

      await expect(
        loginWithEmail("test@example.com", "password123")
      ).rejects.toThrow("Login failed");
    });
  });

  describe("sendPasswordReset", () => {
    test("يتم إرسال إعادة تعيين كلمة المرور بنجاح", async () => {
      const mockResponse = { email: "test@example.com" };
      (axios.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await sendPasswordReset("test@example.com");

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/accounts:sendOobCode"),
        { requestType: "PASSWORD_RESET", email: "test@example.com" }
      );
      expect(result).toEqual(mockResponse);
    });

    test("يتعامل مع أخطاء إعادة تعيين كلمة المرور", async () => {
      const error = new Error("Password reset failed");
      (axios.post as jest.Mock).mockRejectedValue(error);

      await expect(sendPasswordReset("test@example.com")).rejects.toThrow(
        "Password reset failed"
      );
    });
  });

  describe("refreshIdToken", () => {
    test("يرجع الـ token الموجود إذا لم ينتهي", async () => {
      const futureTime = Date.now() + 10000; // 10 seconds in future
      (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([
        ["", "refresh123"],
        ["", futureTime.toString()],
      ]);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("existing-token");

      const result = await refreshIdToken();

      expect(result).toBe("existing-token");
      expect(axios.post).not.toHaveBeenCalled();
    });

    test("يحدث الـ token إذا انتهى", async () => {
      const pastTime = Date.now() - 10000; // 10 seconds in past
      (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([
        ["", "refresh123"],
        ["", pastTime.toString()],
      ]);

      const mockResponse = {
        id_token: "new-token",
        refresh_token: "new-refresh",
        expires_in: "3600",
      };
      (axios.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await refreshIdToken();

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/token"),
        expect.stringContaining("grant_type=refresh_token"),
        expect.objectContaining({
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        })
      );
      expect(AsyncStorage.multiSet).toHaveBeenCalledWith([
        ["firebase-idToken", "new-token"],
        ["firebase-refreshToken", "new-refresh"],
        ["firebase-expiryTime", expect.any(String)],
      ]);
      expect(result).toBe("new-token");
    });

    test("يرمي خطأ إذا لم يكن هناك refresh token", async () => {
      (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([
        ["", null],
        ["", null],
      ]);

      await expect(refreshIdToken()).rejects.toThrow("No refresh token");
    });

    test("يتعامل مع أخطاء تحديث الـ token", async () => {
      (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([
        ["", "refresh123"],
        ["", "0"],
      ]);

      const error = new Error("Token refresh failed");
      (axios.post as jest.Mock).mockRejectedValue(error);

      await expect(refreshIdToken()).rejects.toThrow("Token refresh failed");
    });
  });

  describe("fetchWithAuth", () => {
    test("يضيف Authorization header مع token صحيح", async () => {
      (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([
        ["", "refresh123"],
        ["", "0"],
      ]);

      const mockResponse = {
        id_token: "new-token",
        refresh_token: "new-refresh",
        expires_in: "3600",
      };
      (axios.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      await fetchWithAuth("https://api.example.com/data");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.example.com/data",
        expect.objectContaining({
          headers: {
            Authorization: "Bearer new-token",
          },
        })
      );
    });

    test("يحافظ على headers الموجودة", async () => {
      (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([
        ["", "refresh123"],
        ["", "0"],
      ]);

      const mockResponse = {
        id_token: "new-token",
        refresh_token: "new-refresh",
        expires_in: "3600",
      };
      (axios.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const customOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: "data" }),
      };

      await fetchWithAuth("https://api.example.com/data", customOptions);

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.example.com/data",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer new-token",
          },
          body: JSON.stringify({ test: "data" }),
        })
      );
    });

    test("يتعامل مع أخطاء refresh token", async () => {
      (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([
        ["", null],
        ["", null],
      ]);

      await expect(
        fetchWithAuth("https://api.example.com/data")
      ).rejects.toThrow("No refresh token");
    });
  });

  describe("storeFirebaseTokens", () => {
    test("يحفظ الـ tokens في AsyncStorage", async () => {
      const idToken = "test-id-token";
      const refreshToken = "test-refresh-token";
      const expiresIn = 3600;

      await storeFirebaseTokens(idToken, refreshToken, expiresIn);

      expect(AsyncStorage.multiSet).toHaveBeenCalledWith([
        ["firebase-idToken", idToken],
        ["firebase-refreshToken", refreshToken],
        ["firebase-expiryTime", expect.any(String)],
      ]);
    });

    test("يحسب وقت الانتهاء بشكل صحيح", async () => {
      const expiresIn = 3600;
      const beforeCall = Date.now();

      await storeFirebaseTokens("token", "refresh", expiresIn);

      const afterCall = Date.now();
      const [, , [, expiryTimeStr]] = (AsyncStorage.multiSet as jest.Mock).mock
        .calls[0][0];
      const expiryTime = parseInt(expiryTimeStr, 10);

      expect(expiryTime).toBeGreaterThan(beforeCall + expiresIn * 1000 - 100);
      expect(expiryTime).toBeLessThan(afterCall + expiresIn * 1000 + 100);
    });
  });
});
