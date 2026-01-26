import axiosInstance from "../utils/axios";
import type { Coupon } from "./wallet";

export interface CouponFormData {
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  expiryDate: string;
  assignedTo?: string;
  usageLimit?: number;
}

// Get all coupons
export async function getCoupons(params?: {
  status?: "active" | "used" | "expired";
  type?: string;
  assignedTo?: string;
  page?: number;
  pageSize?: number;
}): Promise<{
  coupons: Coupon[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const mapped = {
    page: params?.page,
    per_page: params?.pageSize,
    // filters إضافية عند الحاجة
  };
  const { data } = await axiosInstance.get<{
    coupons: Coupon[];
    total: number;
    page: number;
    pageSize: number;
  }>("/admin/wallet/coupons", {
    params: mapped,
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get coupon by ID
export async function getCoupon(id: string): Promise<Coupon> {
  const { data } = await axiosInstance.get<Coupon>(`/admin/wallet/coupons/${id}`, {
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Create new coupon
export async function createCoupon(coupon: CouponFormData): Promise<Coupon> {
  const { data } = await axiosInstance.post<Coupon>("/admin/wallet/coupons", coupon);
  return data;
}

// Update coupon
export async function updateCoupon(id: string, coupon: Partial<CouponFormData>): Promise<Coupon> {
  const { data } = await axiosInstance.patch<Coupon>(`/admin/wallet/coupons/${id}`, coupon);
  return data;
}

// Delete coupon
export async function deleteCoupon(id: string): Promise<void> {
  await axiosInstance.delete(`/admin/wallet/coupons/${id}`);
}

// Validate coupon code
export async function validateCouponCode(code: string): Promise<{
  valid: boolean;
  coupon?: Coupon;
  error?: string;
}> {
  const { data } = await axiosInstance.post<{
    valid: boolean;
    coupon?: Coupon;
    error?: string;
  }>("/admin/wallet/coupons/validate", { code });
  return data;
}

// Get coupon statistics
export async function getCouponStats(): Promise<{
  totalCoupons: number;
  activeCoupons: number;
  usedCoupons: number;
  expiredCoupons: number;
  totalUsage: number;
  averageDiscount: number;
}> {
  const { data } = await axiosInstance.get<{
    totalCoupons: number;
    activeCoupons: number;
    usedCoupons: number;
    expiredCoupons: number;
    totalUsage: number;
    averageDiscount: number;
  }>("/admin/wallet/coupons/stats", {
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Generate coupon codes
export async function generateCouponCodes(params: {
  count: number;
  prefix?: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  expiryDays: number;
  usageLimit?: number;
}): Promise<{ codes: string[] }> {
  const { data } = await axiosInstance.post<{ codes: string[] }>("/admin/wallet/coupons/generate", params);
  return data;
}
