import axiosInstance from "../utils/axios";

// Unwrap backend response: API returns { success, data, meta }
const unwrap = (data: unknown): unknown =>
  data !== null && typeof data === "object" && "data" in data
    ? (data as { data: unknown }).data
    : data;

// ==================== Product Catalog ====================

export const getCatalogProducts = async (usageType?: string) => {
  const params = usageType ? { usageType } : {};
  const { data } = await axiosInstance.get("/merchants/catalog/products", { params });
  return unwrap(data);
};

export const getCatalogProduct = async (id: string) => {
  const { data } = await axiosInstance.get(`/merchants/catalog/products/${id}`);
  return unwrap(data);
};

export const createCatalogProduct = async (productData: any) => {
  const { data } = await axiosInstance.post("/merchants/catalog/products", productData);
  return unwrap(data);
};

export const updateCatalogProduct = async (id: string, productData: any) => {
  const { data } = await axiosInstance.patch(`/merchants/catalog/products/${id}`, productData);
  return unwrap(data);
};

// ==================== Categories ====================

export const getCategories = async (parent?: string, usageType?: string) => {
  const params: Record<string, string> = {};
  if (parent) params.parent = parent;
  if (usageType) params.usageType = usageType;
  const { data } = await axiosInstance.get("/merchants/categories", { params });
  return unwrap(data);
};

export const createCategory = async (categoryData: any) => {
  const { data } = await axiosInstance.post("/merchants/categories", categoryData);
  return unwrap(data);
};

export const updateCategory = async (id: string, categoryData: any) => {
  const { data } = await axiosInstance.patch(`/merchants/categories/${id}`, categoryData);
  return unwrap(data);
};

export const deleteCategory = async (id: string) => {
  const { data } = await axiosInstance.delete(`/merchants/categories/${id}`);
  return unwrap(data);
};

// ==================== Attributes ====================

export const getAttributes = async () => {
  const { data } = await axiosInstance.get("/merchants/attributes");
  return unwrap(data);
};

export const getAttributesByCategory = async (categoryId: string) => {
  const { data } = await axiosInstance.get("/merchants/attributes", {
    params: { category: categoryId }
  });
  return unwrap(data);
};

export const createAttribute = async (attributeData: any) => {
  const { data } = await axiosInstance.post("/merchants/attributes", attributeData);
  return unwrap(data);
};

export const updateAttribute = async (id: string, attributeData: any) => {
  const { data } = await axiosInstance.patch(`/merchants/attributes/${id}`, attributeData);
  return unwrap(data);
};

export const deleteAttribute = async (id: string) => {
  const { data } = await axiosInstance.delete(`/merchants/attributes/${id}`);
  return unwrap(data);
};

// ==================== Merchant Products ====================

export const getMerchantProducts = async (filters?: {
  merchantId?: string;
  storeId?: string;
  isAvailable?: boolean;
}) => {
  const { data } = await axiosInstance.get("/merchants/products", { params: filters });
  return unwrap(data);
};

export const getMerchantProduct = async (id: string) => {
  const { data } = await axiosInstance.get(`/merchants/products/${id}`);
  return unwrap(data);
};

export const createMerchantProduct = async (productData: any) => {
  const { data } = await axiosInstance.post("/merchants/products", productData);
  return unwrap(data);
};

export const updateMerchantProduct = async (id: string, productData: any) => {
  const { data } = await axiosInstance.patch(`/merchants/products/${id}`, productData);
  return unwrap(data);
};

export const deleteMerchantProduct = async (id: string) => {
  const { data } = await axiosInstance.delete(`/merchants/products/${id}`);
  return unwrap(data);
};

export const updateMerchantProductStock = async (id: string, quantity: number) => {
  const { data } = await axiosInstance.patch(`/merchants/products/${id}/stock`, { quantity });
  return unwrap(data);
};

// ==================== Merchants ====================

export const getMerchants = async (isActive?: boolean) => {
  const params = isActive !== undefined ? { isActive } : {};
  const { data } = await axiosInstance.get("/merchants", { params });
  return unwrap(data);
};

export const getMerchant = async (id: string) => {
  const { data } = await axiosInstance.get(`/merchants/${id}`);
  return unwrap(data);
};

export const createMerchant = async (merchantData: any) => {
  const { data } = await axiosInstance.post("/merchants", merchantData);
  return unwrap(data);
};

export const updateMerchant = async (id: string, merchantData: any) => {
  const { data } = await axiosInstance.patch(`/merchants/${id}`, merchantData);
  return unwrap(data);
};

export const deleteMerchant = async (id: string) => {
  const { data } = await axiosInstance.delete(`/merchants/${id}`);
  return unwrap(data);
};
