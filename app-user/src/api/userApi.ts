import axiosInstance from "../utils/api/axiosInstance";
import { mapOrder } from "../utils/orderUtils";
import { refreshIdToken } from "./authService";
import { getUtilityOrders } from "./utilityApi";
import { getMyErrands } from "./akhdimniApi";

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

/**
 * جلب كل الطلبات الموحدة: ديلفري + غاز/وايت + اخدمني، مرتبة حسب التاريخ.
 */
export const fetchAllMyOrders = async (userId: string) => {
  const headers = await getAuthHeaders();
  const [deliveryRes, utilityList, errandList] = await Promise.all([
    axiosInstance.get(`/delivery/order/user/${userId}`, { headers }).catch(() => ({ data: [] })),
    getUtilityOrders().catch(() => []),
    getMyErrands().catch(() => []),
  ]);
  const deliveryData = deliveryRes?.data?.data ?? deliveryRes?.data ?? [];
  const delivery = Array.isArray(deliveryData) ? deliveryData : [];
  const deliveryOrders = delivery.map((o: any) => ({ ...o, orderType: o.orderType ?? "marketplace" }));
  const utilityOrders = (Array.isArray(utilityList) ? utilityList : []).map((o: any) => ({
    ...o,
    orderType: "utility",
    utility: {
      kind: o.kind,
      variant: o.variant,
      quantity: o.quantity,
      city: o.city,
      unitPrice: o.productPrice,
      subtotal: o.total != null ? o.total - (o.deliveryFee ?? 0) : undefined,
    },
  }));
  const errandOrders = (Array.isArray(errandList) ? errandList : []).map((o: any) => ({
    ...o,
    orderType: "errand",
    errand: {
      pickup: o.pickup,
      dropoff: o.dropoff,
      deliveryFee: o.deliveryFee,
    },
  }));
  const merged = [...deliveryOrders, ...utilityOrders, ...errandOrders];
  const byDate = (a: any, b: any) => {
    const da = new Date(a.createdAt ?? a.date ?? 0).getTime();
    const db = new Date(b.createdAt ?? b.date ?? 0).getTime();
    return db - da;
  };
  merged.sort(byDate);
  return merged.map(mapOrder);
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
