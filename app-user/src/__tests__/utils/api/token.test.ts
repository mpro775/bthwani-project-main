import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  clearToken,
  getToken,
  setToken,
  validateToken,
} from "../../../utils/api/token";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe("Token Management", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getToken", () => {
    test("should get token from storage successfully", async () => {
      const mockToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      mockAsyncStorage.getItem.mockResolvedValue(mockToken);

      const result = await getToken();

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith("auth-token");
      expect(result).toBe(mockToken);
    });

    test("should return null when token is not found", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await getToken();

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith("auth-token");
      expect(result).toBeNull();
    });

    test("should handle storage errors gracefully", async () => {
      const error = new Error("Storage error");
      mockAsyncStorage.getItem.mockRejectedValue(error);

      const result = await getToken();

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith("auth-token");
      expect(result).toBeNull();
    });

    test("should handle empty string token", async () => {
      mockAsyncStorage.getItem.mockResolvedValue("");

      const result = await getToken();

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith("auth-token");
      expect(result).toBe("");
    });
  });

  describe("setToken", () => {
    test("should set token to storage successfully", async () => {
      const mockToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      mockAsyncStorage.setItem.mockResolvedValue();

      await setToken(mockToken);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        "auth-token",
        mockToken
      );
    });

    test("should handle empty token", async () => {
      mockAsyncStorage.setItem.mockResolvedValue();

      await setToken("");

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith("auth-token", "");
    });

    test("should handle null token", async () => {
      mockAsyncStorage.setItem.mockResolvedValue();

      await setToken(null);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith("auth-token", "");
    });

    test("should handle storage errors", async () => {
      const error = new Error("Storage error");
      mockAsyncStorage.setItem.mockRejectedValue(error);

      await expect(setToken("test-token")).rejects.toThrow("Storage error");
    });

    test("should handle undefined token", async () => {
      mockAsyncStorage.setItem.mockResolvedValue();

      await setToken(undefined);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith("auth-token", "");
    });
  });

  describe("clearToken", () => {
    test("should remove token from storage successfully", async () => {
      mockAsyncStorage.removeItem.mockResolvedValue();

      await clearToken();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith("auth-token");
    });

    test("should handle storage errors", async () => {
      const error = new Error("Storage error");
      mockAsyncStorage.removeItem.mockRejectedValue(error);

      await expect(clearToken()).rejects.toThrow("Storage error");
    });

    test("should not throw when token does not exist", async () => {
      mockAsyncStorage.removeItem.mockResolvedValue();

      await expect(clearToken()).resolves.not.toThrow();
    });
  });

  describe("validateToken", () => {
    test("should validate JWT token format correctly", () => {
      const validToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

      const result = validateToken(validToken);

      expect(result).toBe(true);
    });

    test("should reject invalid JWT token format", () => {
      const invalidTokens = [
        "invalid-token",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid",
        "not-a-jwt-token",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwfQ.invalid-signature",
      ];

      invalidTokens.forEach((token) => {
        const result = validateToken(token);
        expect(result).toBe(false);
      });
    });

    test("should handle null token", () => {
      const result = validateToken(null);

      expect(result).toBe(false);
    });

    test("should handle undefined token", () => {
      const result = validateToken(undefined);

      expect(result).toBe(false);
    });

    test("should handle empty string token", () => {
      const result = validateToken("");

      expect(result).toBe(false);
    });

    test("should handle token with only two parts", () => {
      const invalidToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwfQ";

      const result = validateToken(invalidToken);

      expect(result).toBe(false);
    });

    test("should handle token with more than three parts", () => {
      const invalidToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwfQ.extra.part";

      const result = validateToken(invalidToken);

      expect(result).toBe(false);
    });

    test("should validate token with special characters in payload", () => {
      const validToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20ifQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

      const result = validateToken(validToken);

      expect(result).toBe(true);
    });
  });

  describe("Token Expiration", () => {
    test("should detect expired token", () => {
      // Create a token with past expiration
      const expiredToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid-signature";

      const result = validateToken(expiredToken);

      expect(result).toBe(false);
    });

    test("should accept token without expiration", () => {
      const tokenWithoutExp =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.invalid-signature";

      const result = validateToken(tokenWithoutExp);

      expect(result).toBe(true);
    });
  });

  describe("Integration Tests", () => {
    test("should handle complete token lifecycle", async () => {
      const mockToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

      // Set token
      mockAsyncStorage.setItem.mockResolvedValue();
      await setToken(mockToken);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        "auth-token",
        mockToken
      );

      // Get token
      mockAsyncStorage.getItem.mockResolvedValue(mockToken);
      const retrievedToken = await getToken();
      expect(retrievedToken).toBe(mockToken);

      // Validate token
      const isValid = validateToken(retrievedToken);
      expect(isValid).toBe(true);

      // Clear token
      mockAsyncStorage.removeItem.mockResolvedValue();
      await clearToken();
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith("auth-token");
    });

    test("should handle token refresh scenario", async () => {
      const oldToken = "old-token";
      const newToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

      // Set old token
      mockAsyncStorage.setItem.mockResolvedValue();
      await setToken(oldToken);

      // Validate old token (should fail)
      const isOldTokenValid = validateToken(oldToken);
      expect(isOldTokenValid).toBe(false);

      // Set new token
      await setToken(newToken);

      // Validate new token (should pass)
      const isNewTokenValid = validateToken(newToken);
      expect(isNewTokenValid).toBe(true);
    });
  });

  describe("Error Scenarios", () => {
    test("should handle concurrent token operations", async () => {
      const token1 = "token1";
      const token2 = "token2";

      // Simulate concurrent operations
      const promises = [
        setToken(token1),
        setToken(token2),
        getToken(),
        clearToken(),
      ];

      await Promise.all(promises);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(2);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledTimes(1);
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledTimes(1);
    });

    test("should handle storage quota exceeded", async () => {
      const error = new Error("QuotaExceededError");
      mockAsyncStorage.setItem.mockRejectedValue(error);

      await expect(setToken("large-token")).rejects.toThrow(
        "QuotaExceededError"
      );
    });

    test("should handle corrupted storage", async () => {
      mockAsyncStorage.getItem.mockResolvedValue("corrupted-data");

      const result = await getToken();

      expect(result).toBe("corrupted-data");
      expect(validateToken(result)).toBe(false);
    });
  });

  describe("Security Tests", () => {
    test("should not expose sensitive information in errors", async () => {
      const sensitiveToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXNzd29yZCI6InNlY3JldCIsInN1YiI6IjEyMzQ1Njc4OTAiLCJuYW1lIjoiSm9obiBEb2UiLCJpYXQiOjE1MTYyMzkwMjJ9.invalid-signature";

      const result = validateToken(sensitiveToken);

      expect(result).toBe(false);
    });

    test("should handle malformed JWT tokens", () => {
      const malformedTokens = [
        "header.payload", // Missing signature
        ".payload.signature", // Missing header
        "header..signature", // Missing payload
        "header.payload.", // Missing signature
        ".payload.", // Missing header and signature
        "header..", // Missing payload and signature
        "..signature", // Missing header and payload
        "...", // All parts empty
      ];

      malformedTokens.forEach((token) => {
        const result = validateToken(token);
        expect(result).toBe(false);
      });
    });
  });
});
