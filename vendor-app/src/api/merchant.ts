import axiosInstance from "./axiosInstance";
import { unwrapResponse } from "../utils/apiHelpers";

export interface MerchantProduct {
  _id: string;
  product: {
    _id: string;
    name: string;
    category?: { _id: string; name: string };
    image?: string;
  };
  price: number;
  isAvailable: boolean;
  customImage?: string;
  customDescription?: string;
  stock?: number;
  section?: { _id: string; name: string };
}

export interface CreateMerchantProductDto {
  product: string;
  merchant?: string;
  vendorId?: string;
  store: string;
  price: number;
  stock?: number;
  isAvailable: boolean;
  customDescription?: string;
  customImage?: string;
}

// GET products for current merchant (by merchantId)
export const getMyProducts = async (merchantId: string) => {
  const res = await axiosInstance.get(`/merchants/${merchantId}/products`);
  return unwrapResponse<MerchantProduct[]>(res);
};

// GET products for vendor (by vendorId) - يُستخدم من تطبيق التاجر
export const getVendorProducts = async (
  vendorId: string,
  storeId?: string
) => {
  const params: Record<string, string> = {};
  if (storeId) params.storeId = storeId;
  const res = await axiosInstance.get(
    `/merchants/vendor/${vendorId}/products`,
    { params: Object.keys(params).length ? params : undefined }
  );
  const data = unwrapResponse<MerchantProduct[]>(res);
  return Array.isArray(data) ? data : [];
};

// GET single product
export const getProduct = async (productId: string) => {
  const res = await axiosInstance.get(`/merchants/products/${productId}`);
  return unwrapResponse<MerchantProduct>(res);
};

// CREATE product
export const createProduct = async (productData: CreateMerchantProductDto) => {
  const res = await axiosInstance.post("/merchants/products", productData);
  return unwrapResponse<MerchantProduct>(res);
};

// UPDATE product
export const updateProduct = async (
  productId: string,
  productData: Partial<CreateMerchantProductDto>
) => {
  const res = await axiosInstance.patch(
    `/merchants/products/${productId}`,
    productData
  );
  return unwrapResponse<MerchantProduct>(res);
};

// DELETE product
export const deleteProduct = async (productId: string) => {
  const res = await axiosInstance.delete(`/merchants/products/${productId}`);
  return unwrapResponse<any>(res);
};

// UPDATE stock
export const updateStock = async (productId: string, quantity: number) => {
  const res = await axiosInstance.patch(
    `/merchants/products/${productId}/stock`,
    { quantity }
  );
  return unwrapResponse<any>(res);
};

// GET catalog products
export const getCatalogProducts = async (usageType = "grocery") => {
  const res = await axiosInstance.get("/merchants/catalog/products", {
    params: { usageType },
  });
  return unwrapResponse<any>(res);
};

