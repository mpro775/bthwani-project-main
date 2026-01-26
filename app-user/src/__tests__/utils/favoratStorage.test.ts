import axios from "axios";
import Toast from "react-native-toast-message";
import { getUserProfile } from "../../storage/userStorage";
import { FavoriteItem } from "../../types/types";
import axiosInstance from "../../utils/api/axiosInstance";
import {
  addFavorite,
  getAllUserFavorites,
  getFavoritesByType,
  isFavorite,
  removeFavorite,
} from "../../utils/favoratStorage";

// Mock dependencies
jest.mock("axios");
jest.mock("storage/userStorage");
jest.mock("utils/api/axiosInstance");
jest.mock("react-native-toast-message");

const mockAxios = axios as any;
const mockAxiosInstance = axiosInstance as any;
const mockGetUserProfile = getUserProfile as any;
const mockToast = Toast as any;

describe("favoratStorage", () => {
  const mockUser = {
    id: "user123",
    name: "Test User",
    email: "test@example.com",
  };

  const mockFavoriteItem: FavoriteItem = {
    _id: "fav1",
    itemId: "product123",
    itemType: "product",
    userId: "user123",
    createdAt: "2024-01-01T00:00:00Z",
  };

  const mockFavorites: FavoriteItem[] = [
    mockFavoriteItem,
    {
      _id: "fav2",
      itemId: "store456",
      itemType: "store",
      userId: "user123",
      createdAt: "2024-01-02T00:00:00Z",
    } as FavoriteItem,
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserProfile.mockResolvedValue(mockUser);
    mockAxiosInstance.get.mockResolvedValue({ data: mockFavorites });
    mockAxiosInstance.post.mockResolvedValue({ data: mockFavoriteItem });
    mockAxiosInstance.delete.mockResolvedValue({ data: { success: true } });
  });

  describe("getAllUserFavorites", () => {
    it("should fetch all user favorites successfully", async () => {
      const result = await getAllUserFavorites();

      expect(mockGetUserProfile).toHaveBeenCalledTimes(1);
      expect(mockAxiosInstance.get).toHaveBeenCalled();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return empty array when user has no ID", async () => {
      mockGetUserProfile.mockResolvedValue({ ...mockUser, id: undefined });

      const result = await getAllUserFavorites();

      expect(result).toEqual([]);
      expect(mockAxiosInstance.get).not.toHaveBeenCalled();
    });

    it("should return empty array when user profile is null", async () => {
      mockGetUserProfile.mockResolvedValue(null);

      const result = await getAllUserFavorites();

      expect(result).toEqual([]);
      expect(mockAxiosInstance.get).not.toHaveBeenCalled();
    });

    it("should handle API errors gracefully", async () => {
      const error = new Error("Network error");
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(getAllUserFavorites()).rejects.toThrow("Network error");
    });
  });

  describe("addFavorite", () => {
    it("should add favorite successfully and show success toast", async () => {
      const result = await addFavorite(mockFavoriteItem);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        "/users/favorites",
        mockFavoriteItem
      );
      expect(result).toBe(true);
    });

    it("should handle API errors and return false", async () => {
      const error = new Error("Network error");
      mockAxiosInstance.post.mockRejectedValue(error);

      const result = await addFavorite(mockFavoriteItem);

      expect(result).toBe(false);
    });
  });

  describe("removeFavorite", () => {
    it("should remove favorite successfully and show success toast", async () => {
      const result = await removeFavorite(mockFavoriteItem);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(
        "/users/favorites",
        { data: mockFavoriteItem }
      );
      expect(result).toBe(true);
    });

    it("should handle API errors and return false", async () => {
      const error = new Error("Network error");
      mockAxiosInstance.delete.mockRejectedValue(error);

      const result = await removeFavorite(mockFavoriteItem);

      expect(result).toBe(false);
    });
  });

  describe("isFavorite", () => {
    it("should return true when item is in favorites", async () => {
      const result = await isFavorite("product123", "product");

      expect(result).toBe(true);
    });

    it("should return false when item is not in favorites", async () => {
      const result = await isFavorite("nonexistent", "product");

      expect(result).toBe(false);
    });

    it("should return false when user has no ID", async () => {
      mockGetUserProfile.mockResolvedValue({ ...mockUser, id: undefined });

      const result = await isFavorite("product123", "product");

      expect(result).toBe(false);
    });
  });

  describe("getFavoritesByType", () => {
    it("should return favorites filtered by type", async () => {
      const result = await getFavoritesByType("product");

      expect(Array.isArray(result)).toBe(true);
    });

    it("should return empty array for non-existent type", async () => {
      const result = await getFavoritesByType("nonexistent" as any);

      expect(result).toEqual([]);
    });
  });

  describe("error handling scenarios", () => {
    it("should handle network timeout errors", async () => {
      const timeoutError = new Error("Request timeout");
      mockAxiosInstance.get.mockRejectedValue(timeoutError);

      await expect(getAllUserFavorites()).rejects.toThrow("Request timeout");
    });

    it("should handle server error responses", async () => {
      const serverError = {
        response: {
          status: 500,
          data: { message: "Internal server error" },
        },
      };
      mockAxiosInstance.post.mockRejectedValue(serverError);

      const result = await addFavorite(mockFavoriteItem);
      expect(result).toBe(false);
    });

    it("should handle validation errors", async () => {
      const validationError = {
        response: {
          status: 400,
          data: {
            message: "Validation failed",
            errors: ["Item ID is required", "Item type is required"],
          },
        },
      };
      mockAxiosInstance.post.mockRejectedValue(validationError);

      const result = await addFavorite(mockFavoriteItem);
      expect(result).toBe(false);
    });

    it("should handle authentication errors", async () => {
      const authError = {
        response: {
          status: 401,
          data: { message: "Unauthorized" },
        },
      };
      mockAxiosInstance.get.mockRejectedValue(authError);

      await expect(getAllUserFavorites()).rejects.toEqual(authError);
    });
  });

  describe("edge cases", () => {
    it("should handle favorite items with missing properties", async () => {
      const incompleteItem = {
        _id: "fav1",
        itemId: "product123",
      } as FavoriteItem;

      await addFavorite(incompleteItem);

      expect(mockAxiosInstance.post).toHaveBeenCalled();
    });

    it("should handle very long item IDs", async () => {
      const longItemId = "a".repeat(1000);
      const itemWithLongId = { ...mockFavoriteItem, itemId: longItemId };

      await addFavorite(itemWithLongId);

      expect(mockAxiosInstance.post).toHaveBeenCalled();
    });

    it("should handle special characters in item IDs", async () => {
      const specialChars = [
        "!@#$%^&*()",
        "Hello-World",
        "product_123",
        "store-456",
      ];

      for (const itemId of specialChars) {
        const item = { ...mockFavoriteItem, itemId };
        await addFavorite(item);
      }

      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(specialChars.length);
    });
  });
});
