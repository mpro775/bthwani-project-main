import axiosInstance from "./axios-instance";
import { getAuthHeader } from "./auth";
import type { User, Address } from "../types";
import type { ApiResponse } from "../types/api";

// Get user profile
export const fetchUserProfile = async (): Promise<User> => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.get<ApiResponse<User>>("/users/me", { headers });

  // استخراج البيانات من البنية الجديدة
  const apiResponse = response.data;
  if (!apiResponse.success || !apiResponse.data) {
    throw new Error(apiResponse.error?.userMessage || "فشل تحميل البروفايل");
  }

  const user = apiResponse.data;
  return {
    ...user,
    id: user.id || user._id || "",
  };
};

// Update user profile
export const updateUserProfile = async (data: Partial<User>): Promise<User> => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.patch<ApiResponse<User>>("/users/profile", data, {
    headers,
  });
  
  const apiResponse = response.data;
  if (!apiResponse.success || !apiResponse.data) {
    throw new Error(apiResponse.error?.userMessage || "فشل تحديث البروفايل");
  }
  
  return apiResponse.data;
};

// Update user avatar
export const updateUserAvatar = async (imageUrl: string): Promise<User> => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.patch<ApiResponse<User>>(
    "/users/avatar",
    { image: imageUrl },
    { headers }
  );
  
  const apiResponse = response.data;
  if (!apiResponse.success || !apiResponse.data) {
    throw new Error(apiResponse.error?.userMessage || "فشل تحديث الصورة");
  }
  
  return apiResponse.data;
};

// Add user address
export const addUserAddress = async (
  address: Omit<Address, "_id">
): Promise<Address> => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.post<ApiResponse<Address>>(
    "/users/address",
    address,
    { headers }
  );
  
  const apiResponse = response.data;
  if (!apiResponse.success || !apiResponse.data) {
    throw new Error(apiResponse.error?.userMessage || "فشل إضافة العنوان");
  }
  
  return apiResponse.data;
};

// Update user address
export const updateUserAddress = async (payload: Address): Promise<Address> => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.patch<ApiResponse<Address>>(
    `/users/address/${payload._id}`,
    payload,
    { headers }
  );
  
  const apiResponse = response.data;
  if (!apiResponse.success || !apiResponse.data) {
    throw new Error(apiResponse.error?.userMessage || "فشل تحديث العنوان");
  }
  
  return apiResponse.data;
};

// Delete user address
export const deleteUserAddress = async (addressId: string): Promise<void> => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.delete<ApiResponse<void>>(`/users/address/${addressId}`, { headers });
  
  const apiResponse = response.data;
  if (!apiResponse.success) {
    throw new Error(apiResponse.error?.userMessage || "فشل حذف العنوان");
  }
};

// Set default address
export const setDefaultUserAddress = async (
  address: Address
): Promise<Address> => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.patch<ApiResponse<Address>>(
    "/users/default-address",
    address,
    { headers }
  );
  
  const apiResponse = response.data;
  if (!apiResponse.success || !apiResponse.data) {
    throw new Error(apiResponse.error?.userMessage || "فشل تعيين العنوان الافتراضي");
  }
  
  return apiResponse.data;
};

export default {
  fetchUserProfile,
  updateUserProfile,
  updateUserAvatar,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultUserAddress,
};
