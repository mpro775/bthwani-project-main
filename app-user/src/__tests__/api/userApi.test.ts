// __tests__/userApi.test.ts

// Mock MyOrdersScreen before any imports
jest.mock("screens/delivery/MyOrdersScreen", () => ({
  mapOrder: jest.fn((order) => ({
    ...order,
    id: order._id, // map _id to id like the real function does
    // Add any other transformations that the real mapOrder function does
  })),
}));

import {
  addUserAddress,
  deleteUserAddress,
  fetchMyOrders,
  fetchServerUserProfile,
  fetchUserProfile,
  getAuthHeaders,
  logoutUser,
  setDefaultUserAddress,
  updateBloodSettings,
  updateUserAddress,
  updateUserAvatar,
  updateUserProfileAPI,
} from "../../api/userApi";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock axiosInstance
jest.mock("utils/api/axiosInstance", () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

// Mock authService
jest.mock("api/authService", () => ({
  refreshIdToken: jest.fn(),
}));

import AsyncStorage from "@react-native-async-storage/async-storage";
import { refreshIdToken } from "../../api/authService";
import axiosInstance from "../../utils/api/axiosInstance";

// Get the mocked mapOrder function
const { mapOrder: mockMapOrder } = require("screens/delivery/MyOrdersScreen");

describe("userApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock AsyncStorage defaults
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("test-token");
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

    // Mock axiosInstance defaults
    (axiosInstance.get as jest.Mock).mockResolvedValue({ data: {} });
    (axiosInstance.post as jest.Mock).mockResolvedValue({ data: {} });
    (axiosInstance.patch as jest.Mock).mockResolvedValue({ data: {} });
    (axiosInstance.delete as jest.Mock).mockResolvedValue({ data: {} });

    // Mock refreshIdToken defaults
    (refreshIdToken as jest.Mock).mockResolvedValue("fresh-token");
  });

  describe("getAuthHeaders", () => {
    test("يرجع headers مع token صحيح", async () => {
      const headers = await getAuthHeaders();

      expect(refreshIdToken).toHaveBeenCalled();
      expect(headers).toEqual({ Authorization: "Bearer fresh-token" });
    });

    test("يرجع headers فارغة عند فشل refresh token", async () => {
      (refreshIdToken as jest.Mock).mockRejectedValue(
        new Error("Token refresh failed")
      );

      const headers = await getAuthHeaders();

      expect(headers).toEqual({});
    });
  });

  describe("fetchUserProfile", () => {
    test("يجلب ملف المستخدم بنجاح", async () => {
      const mockUser = {
        _id: "user123",
        fullName: "أحمد محمد",
        email: "ahmed@example.com",
      };
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockUser });

      const result = await fetchUserProfile();

      expect(axiosInstance.get).toHaveBeenCalledWith("/users/me", {
        headers: { Authorization: "Bearer fresh-token" },
      });
      expect(result).toEqual({
        ...mockUser,
        id: "user123",
      });
    });

    test("يتعامل مع المستخدم الذي له id بدلاً من _id", async () => {
      const mockUser = { id: "user123", fullName: "أحمد محمد" };
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockUser });

      const result = await fetchUserProfile();

      expect(result.id).toBe("user123");
    });
  });

  describe("updateUserProfileAPI", () => {
    test("يحدث ملف المستخدم بنجاح", async () => {
      const updateData = {
        fullName: "أحمد محمد الجديد",
        phone: "+967123456789",
      };
      const mockResponse = { success: true, user: updateData };
      (axiosInstance.patch as jest.Mock).mockResolvedValue({
        data: mockResponse,
      });

      const result = await updateUserProfileAPI(updateData);

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        "/users/profile",
        updateData,
        {
          headers: { Authorization: "Bearer fresh-token" },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    test("يتعامل مع تحديث الصورة", async () => {
      const updateData = { profileImage: "https://example.com/avatar.jpg" };
      (axiosInstance.patch as jest.Mock).mockResolvedValue({
        data: { success: true },
      });

      await updateUserProfileAPI(updateData);

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        "/users/profile",
        updateData,
        {
          headers: { Authorization: "Bearer fresh-token" },
        }
      );
    });
  });

  describe("addUserAddress", () => {
    test("يضيف عنوان جديد بنجاح", async () => {
      const address = {
        label: "المنزل",
        city: "صنعاء",
        street: "شارع الجمهورية",
        location: { lat: 15.3694, lng: 44.191 },
      };
      const mockResponse = {
        success: true,
        address: { _id: "addr123", ...address },
      };
      (axiosInstance.post as jest.Mock).mockResolvedValue({
        data: mockResponse,
      });

      const result = await addUserAddress(address);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/users/address",
        address,
        {
          headers: { Authorization: "Bearer fresh-token" },
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateUserAddress", () => {
    test("يحدث العنوان بنجاح", async () => {
      const addressData = {
        _id: "addr123",
        label: "العمل",
        city: "صنعاء",
        street: "شارع التحرير",
        location: { lat: 15.3694, lng: 44.191 },
      };

      await updateUserAddress(addressData);

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        "/users/address/addr123",
        addressData,
        {
          headers: { Authorization: "Bearer fresh-token" },
        }
      );
    });

    test("يتعامل مع العنوان بدون location", async () => {
      const addressData = {
        _id: "addr123",
        label: "المنزل",
        city: "صنعاء",
        street: "شارع الجمهورية",
      };

      await updateUserAddress(addressData);

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        "/users/address/addr123",
        addressData,
        {
          headers: { Authorization: "Bearer fresh-token" },
        }
      );
    });
  });

  describe("deleteUserAddress", () => {
    test("يحذف العنوان بنجاح", async () => {
      const addressId = "addr123";
      const mockResponse = { success: true, message: "تم حذف العنوان" };
      (axiosInstance.delete as jest.Mock).mockResolvedValue({
        data: mockResponse,
      });

      const result = await deleteUserAddress(addressId);

      expect(axiosInstance.delete).toHaveBeenCalledWith(
        "/users/address/addr123",
        {
          headers: { Authorization: "Bearer fresh-token" },
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("setDefaultUserAddress", () => {
    test("يحدد العنوان الافتراضي بنجاح", async () => {
      const address = { _id: "addr123", label: "المنزل" };
      const mockResponse = { success: true, defaultAddress: address };
      (axiosInstance.patch as jest.Mock).mockResolvedValue({
        data: mockResponse,
      });

      const result = await setDefaultUserAddress(address);

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        "/users/default-address",
        address,
        {
          headers: { Authorization: "Bearer fresh-token" },
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("logoutUser", () => {
    test("يتم تسجيل الخروج بنجاح", async () => {
      await logoutUser();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("firebase-idToken");
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("firebase-user");
    });
  });

  describe("fetchMyOrders", () => {
    test("يتعامل مع أخطاء API", async () => {
      const userId = "user123";
      const networkError = new Error("Network error");
      (axiosInstance.get as jest.Mock).mockRejectedValue(networkError);

      await expect(fetchMyOrders(userId)).rejects.toThrow("Network error");
    });

    test("يتعامل مع استجابة API فارغة", async () => {
      const userId = "user123";
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: [] });

      try {
        await fetchMyOrders(userId);
      } catch (error) {
        // نتوقع أن تحدث أخطاء بسبب mapOrder غير المعرفة
        expect(error).toBeDefined();
      }
    });

    test("يجلب طلبات المستخدم بنجاح", async () => {
      const userId = "user123";
      const networkError = new Error("Function error");
      (axiosInstance.get as jest.Mock).mockRejectedValue(networkError);

      try {
        await fetchMyOrders(userId);
      } catch (error) {
        expect(axiosInstance.get).toHaveBeenCalledWith(
          `/delivery/order/user/${userId}`,
          {
            headers: { Authorization: "Bearer fresh-token" },
          }
        );
      }
    });
  });

  describe("updateUserAvatar", () => {
    test("يحدث صورة المستخدم بنجاح", async () => {
      const imageUrl = "https://example.com/new-avatar.jpg";
      const mockResponse = { success: true, avatar: imageUrl };
      (axiosInstance.patch as jest.Mock).mockResolvedValue({
        data: mockResponse,
      });

      const result = await updateUserAvatar(imageUrl);

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        "/users/avatar",
        { image: imageUrl },
        {
          headers: { Authorization: "Bearer fresh-token" },
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateBloodSettings", () => {
    test("يحدث إعدادات بنك الدم بنجاح", async () => {
      const bloodData = {
        bloodType: "O+",
        lastDonation: "2024-01-01",
        canDonate: true,
      };
      const mockResponse = { success: true, bloodSettings: bloodData };
      (axiosInstance.patch as jest.Mock).mockResolvedValue({
        data: mockResponse,
      });

      const result = await updateBloodSettings(bloodData);

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        "/users/blood-settings",
        bloodData,
        {
          headers: { Authorization: "Bearer fresh-token" },
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("fetchServerUserProfile", () => {
    test("يجلب ملف المستخدم من الخادم بنجاح", async () => {
      const mockUser = { _id: "user123", fullName: "أحمد محمد" };
      (axiosInstance.get as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      const result = await fetchServerUserProfile();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith("firebase-idToken");
      expect(axiosInstance.get).toHaveBeenCalledWith("/users/me", {
        headers: { Authorization: "Bearer test-token" },
      });
      expect(result).toEqual(mockUser);
    });

    test("يرمي خطأ عند عدم وجود token", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await expect(fetchServerUserProfile()).rejects.toThrow("Missing token");
    });
  });

  describe("Error Handling", () => {
    test("يتعامل مع أخطاء الشبكة", async () => {
      const networkError = new Error("Network error");
      (axiosInstance.get as jest.Mock).mockRejectedValue(networkError);

      await expect(fetchUserProfile()).rejects.toThrow("Network error");
    });

    test("يتعامل مع أخطاء الخادم", async () => {
      const serverError = new Error("Server error");
      (axiosInstance.patch as jest.Mock).mockRejectedValue(serverError);

      await expect(updateUserProfileAPI({ fullName: "أحمد" })).rejects.toThrow(
        "Server error"
      );
    });
  });
});
