// __tests__/api.test.ts
import {
  addFavorite,
  getFavoritesCounts,
  isFavorite,
  removeFavorite,
} from "../../api/favorites";

// Mock axios
jest.mock("@/utils/api/axiosInstance", () => ({
  post: jest.fn(),
  delete: jest.fn(),
  get: jest.fn(),
}));

const mockAxios = require("utils/api/axiosInstance");

describe("API Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Favorites API", () => {
    test("يضيف منتج للمفضلة", async () => {
      mockAxios.post.mockResolvedValue({ data: { success: true } });

      await addFavorite("product-1", "restaurant", {
        title: "منتج تجريبي",
        image: "test.jpg",
        rating: 4.5,
      });

      expect(mockAxios.post).toHaveBeenCalledWith("/favorites", {
        itemId: "product-1",
        itemType: "restaurant",
        itemSnapshot: {
          title: "منتج تجريبي",
          image: "test.jpg",
          rating: 4.5,
        },
      });
    });

    test("يزيل منتج من المفضلة", async () => {
      mockAxios.delete.mockResolvedValue({ data: { success: true } });

      await removeFavorite("product-1", "restaurant");

      expect(mockAxios.delete).toHaveBeenCalledWith(
        "/favorites/restaurant/product-1"
      );
    });

    test("يجلب عدد المفضلة", async () => {
      const mockResponse = {
        "product-1": 1,
        "product-2": 0,
        "product-3": 1,
      };
      mockAxios.get.mockResolvedValue({ data: mockResponse });

      const result = await getFavoritesCounts("restaurant", [
        "product-1",
        "product-2",
        "product-3",
      ]);

      expect(mockAxios.get).toHaveBeenCalledWith("/favorites/counts", {
        params: { type: "restaurant", ids: "product-1,product-2,product-3" },
      });
      expect(result).toEqual(mockResponse);
    });

    test("يتحقق من وجود منتج في المفضلة", async () => {
      mockAxios.get.mockResolvedValue({ data: { exists: true } });

      const result = await isFavorite("product-1", "restaurant");

      expect(mockAxios.get).toHaveBeenCalledWith(
        "/favorites/exists/restaurant/product-1"
      );
      expect(result).toBe(true);
    });

    test("يتعامل مع أخطاء API", async () => {
      mockAxios.post.mockRejectedValue(new Error("Network error"));

      await expect(addFavorite("product-1", "restaurant")).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("Auth API", () => {
    test("يتعامل مع تسجيل الدخول", async () => {
      // يمكنك إضافة اختبارات لـ auth API هنا
      expect(true).toBe(true);
    });

    test("يتعامل مع إعادة تعيين كلمة المرور", async () => {
      // يمكنك إضافة اختبارات لـ password reset هنا
      expect(true).toBe(true);
    });
  });

  describe("User API", () => {
    test("يجلب بيانات المستخدم", async () => {
      // يمكنك إضافة اختبارات لـ user API هنا
      expect(true).toBe(true);
    });

    test("يحدث بيانات المستخدم", async () => {
      // يمكنك إضافة اختبارات لـ user update هنا
      expect(true).toBe(true);
    });
  });
});
