import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveUserProfile, getUserProfile, updateUserProfile, clearUserProfile } from "../../storage/userStorage";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe("userStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUserProfile = {
    id: "user-123",
    name: "Test User",
    email: "test@example.com",
    phone: "+1234567890",
    avatar: "https://example.com/avatar.jpg",
  };

  describe("saveUserProfile", () => {
    test("should save user profile successfully", async () => {
      await saveUserProfile(mockUserProfile);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        "userProfile",
        JSON.stringify(mockUserProfile)
      );
    });

    test("should handle errors gracefully", async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error("Storage error"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      await saveUserProfile(mockUserProfile);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("getUserProfile", () => {
    test("should return null when no profile is saved", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await getUserProfile();

      expect(result).toBeNull();
    });

    test("should return saved profile", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockUserProfile));

      const result = await getUserProfile();

      expect(result).toEqual(mockUserProfile);
    });

    test("should handle errors and return null", async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error("Storage error"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const result = await getUserProfile();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("updateUserProfile", () => {
    test("should update existing profile", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockUserProfile));
      const updates = { name: "Updated Name", email: "updated@example.com" };

      const result = await updateUserProfile(updates);

      expect(result).toEqual({ ...mockUserProfile, ...updates });
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    test("should return null when no profile exists to update", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      const updates = { name: "Updated Name" };

      const result = await updateUserProfile(updates);

      expect(result).toBeNull();
      expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
    });

    test("should handle update errors", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockUserProfile));
      mockAsyncStorage.setItem.mockRejectedValue(new Error("Update error"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const result = await updateUserProfile({ name: "Updated Name" });

      expect(result).toEqual({ ...mockUserProfile, name: "Updated Name" });
      consoleSpy.mockRestore();
    });
  });

  describe("clearUserProfile", () => {
    test("should remove profile successfully", async () => {
      await clearUserProfile();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith("userProfile");
    });

    test("should handle removal errors", async () => {
      mockAsyncStorage.removeItem.mockRejectedValue(new Error("Remove error"));

      await expect(clearUserProfile()).rejects.toThrow("Remove error");
    });
  });
});
