import axiosInstance from "../utils/api/axiosInstance";
import { mapOrder } from "../utils/orderUtils";
import { refreshIdToken } from "./authService";

const getAuthHeaders = async () => {
  try {
    const token = await refreshIdToken(); // ← يجدد التوكن تلقائيًا إن انتهت
    return { Authorization: `Bearer ${token}` };
  } catch (error) {
    console.warn("⚠️ فشل في جلب التوكن:", error);
    return {};
  }
};

// ✅ 1. الحصول على بيانات المستخدم
// الـ Backend يرجع { success, data: <user>, meta } — البيانات الفعلية في response.data.data
export const fetchUserProfile = async () => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.get(`/users/me`, { headers });

  const raw = response.data?.data ?? response.data;
  const id = raw?.id ?? raw?._id;

  return {
    ...raw,
    id,
    uid: raw?.uid ?? id ?? "",
  };
};

// ✅ 2. تحديث بيانات المستخدم (الاسم، الصورة، الهاتف...)
// الصورة يتم رفعها من الفرونت إلى Bunny، ثم يرسل الرابط هنا
type UpdateUserProfilePayload = {
  fullName?: string;
  phone?: string;
  profileImage?: string; // ← رابط مباشر فقط
};

export const updateUserProfileAPI = async (data: UpdateUserProfilePayload) => {
  const headers = await getAuthHeaders();
  const response = await axiosInstance.patch(`/users/profile`, data, {
    headers,
  });
  return response.data;
};

// ✅ 3. إضافة عنوان للمستخدم
export const addUserAddress = async (address: any) => {
  const headers = await getAuthHeaders();
  const res = await axiosInstance.post(`/users/address`, address, { headers });
  return res.data;
};

export const updateUserAddress = async (payload: {
  _id: string;
  label: string;
  city: string;
  street: string;
  location?: { lat: number; lng: number };
}) => {
  const headers = await getAuthHeaders();
  const { _id, ...body } = payload;
  return axiosInstance.patch(`/users/address/${_id}`, body, { headers });
};
// ✅ 4. حذف عنوان
export const deleteUserAddress = async (addressId: string) => {
  const headers = await getAuthHeaders();
  const res = await axiosInstance.delete(`/users/address/${addressId}`, {
    headers,
  });
  return res.data;
};

// ✅ 5. تحديد عنوان افتراضي
// الباكند يتوقع: { addressId: string } في الـ body
export const setDefaultUserAddress = async (addressId: string) => {
  const headers = await getAuthHeaders();
  const res = await axiosInstance.patch(
    `/users/default-address`,
    { addressId },
    { headers }
  );
  return res.data;
};

export const fetchMyOrders = async (userId: string) => {
  const headers = await getAuthHeaders();
  const res = await axiosInstance.get(`/delivery/order/user/${userId}`, {
    headers,
  });
  const data = res.data?.data || res.data || [];
  return data.map(mapOrder); // mapOrder كما عرفته
};
export const updateUserAvatar = async (imageUrl: string) => {
  const headers = await getAuthHeaders();
  const res = await axiosInstance.patch(
    `/users/avatar`,
    { image: imageUrl }, // ✅ تطابق مع req.body.image
    { headers }
  );
  return res.data;
};
