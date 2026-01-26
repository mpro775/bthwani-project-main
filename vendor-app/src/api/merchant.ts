import axiosInstance from "./axiosInstance";

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
  merchant: string;
  store: string;
  price: number;
  stock?: number;
  isAvailable: boolean;
  customDescription?: string;
  customImage?: string;
}

// GET products for current merchant
export const getMyProducts = async (merchantId: string) => {
  const { data } = await axiosInstance.get<MerchantProduct[]>(
    `/merchant/${merchantId}/products`
  );
  return data;
};

// GET single product
export const getProduct = async (productId: string) => {
  const { data } = await axiosInstance.get<MerchantProduct>(
    `/merchant/products/${productId}`
  );
  return data;
};

// CREATE product
export const createProduct = async (productData: CreateMerchantProductDto) => {
  const { data } = await axiosInstance.post<MerchantProduct>(
    "/merchant/products",
    productData
  );
  return data;
};

// UPDATE product
export const updateProduct = async (
  productId: string,
  productData: Partial<CreateMerchantProductDto>
) => {
  const { data } = await axiosInstance.patch<MerchantProduct>(
    `/merchant/products/${productId}`,
    productData
  );
  return data;
};

// DELETE product
export const deleteProduct = async (productId: string) => {
  const { data } = await axiosInstance.delete(`/merchant/products/${productId}`);
  return data;
};

// UPDATE stock
export const updateStock = async (productId: string, quantity: number) => {
  const { data } = await axiosInstance.patch(
    `/merchant/products/${productId}/stock`,
    { quantity }
  );
  return data;
};

// GET catalog products
export const getCatalogProducts = async (usageType = "grocery") => {
  const { data } = await axiosInstance.get("/merchant/catalog/products", {
    params: { usageType },
  });
  return data;
};

