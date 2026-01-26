import axiosInstance from "../utils/axios";

// ==================== Product Catalog ====================

export const getCatalogProducts = async (usageType?: string) => {
  const params = usageType ? { usageType } : {};
  const { data } = await axiosInstance.get("/merchant/catalog/products", { params });
  return data;
};

export const getCatalogProduct = async (id: string) => {
  const { data } = await axiosInstance.get(`/merchant/catalog/products/${id}`);
  return data;
};

export const createCatalogProduct = async (productData: any) => {
  const { data } = await axiosInstance.post("/merchant/catalog/products", productData);
  return data;
};

export const updateCatalogProduct = async (id: string, productData: any) => {
  const { data } = await axiosInstance.patch(`/merchant/catalog/products/${id}`, productData);
  return data;
};

// ==================== Categories ====================

export const getCategories = async (parent?: string) => {
  const params = parent ? { parent } : {};
  const { data } = await axiosInstance.get("/merchant/categories", { params });
  return data;
};

export const createCategory = async (categoryData: any) => {
  const { data } = await axiosInstance.post("/merchant/categories", categoryData);
  return data;
};

export const updateCategory = async (id: string, categoryData: any) => {
  const { data } = await axiosInstance.patch(`/merchant/categories/${id}`, categoryData);
  return data;
};

export const deleteCategory = async (id: string) => {
  const { data } = await axiosInstance.delete(`/merchant/categories/${id}`);
  return data;
};

// ==================== Attributes ====================

export const getAttributes = async () => {
  const { data } = await axiosInstance.get("/merchant/attributes");
  return data;
};

export const getAttributesByCategory = async (categoryId: string) => {
  const { data } = await axiosInstance.get("/merchant/attributes", {
    params: { category: categoryId }
  });
  return data;
};

export const createAttribute = async (attributeData: any) => {
  const { data } = await axiosInstance.post("/merchant/attributes", attributeData);
  return data;
};

export const updateAttribute = async (id: string, attributeData: any) => {
  const { data } = await axiosInstance.patch(`/merchant/attributes/${id}`, attributeData);
  return data;
};

export const deleteAttribute = async (id: string) => {
  const { data } = await axiosInstance.delete(`/merchant/attributes/${id}`);
  return data;
};

// ==================== Merchant Products ====================

export const getMerchantProducts = async (filters?: {
  merchantId?: string;
  storeId?: string;
  isAvailable?: boolean;
}) => {
  const { data } = await axiosInstance.get("/merchant/products", { params: filters });
  return data;
};

export const getMerchantProduct = async (id: string) => {
  const { data } = await axiosInstance.get(`/merchant/products/${id}`);
  return data;
};

export const createMerchantProduct = async (productData: any) => {
  const { data } = await axiosInstance.post("/merchant/products", productData);
  return data;
};

export const updateMerchantProduct = async (id: string, productData: any) => {
  const { data } = await axiosInstance.patch(`/merchant/products/${id}`, productData);
  return data;
};

export const deleteMerchantProduct = async (id: string) => {
  const { data } = await axiosInstance.delete(`/merchant/products/${id}`);
  return data;
};

export const updateMerchantProductStock = async (id: string, quantity: number) => {
  const { data } = await axiosInstance.patch(`/merchant/products/${id}/stock`, { quantity });
  return data;
};

// ==================== Merchants ====================

export const getMerchants = async (isActive?: boolean) => {
  const params = isActive !== undefined ? { isActive } : {};
  const { data } = await axiosInstance.get("/merchant", { params });
  return data;
};

export const getMerchant = async (id: string) => {
  const { data } = await axiosInstance.get(`/merchant/${id}`);
  return data;
};

export const createMerchant = async (merchantData: any) => {
  const { data } = await axiosInstance.post("/merchant", merchantData);
  return data;
};

export const updateMerchant = async (id: string, merchantData: any) => {
  const { data } = await axiosInstance.patch(`/merchant/${id}`, merchantData);
  return data;
};

export const deleteMerchant = async (id: string) => {
  const { data } = await axiosInstance.delete(`/merchant/${id}`);
  return data;
};

