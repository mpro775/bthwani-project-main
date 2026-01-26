import axiosInstance from "./axios-instance";
import { getAuthHeader } from "./auth";
import type {
  Store,
  Product,
  Category,
  Banner,
  GroceryStore,
  GroceryFilters,
  GroceryProduct,
  WaterOrder,
  WaterBottleInfo,
  GasOrder,
  WaterProvider,
  GasCylinderInfo,
  GasProvider,
  GroceryOrder,
  GroceryCategoryInfo,
} from "../types";

// Query parameter types
interface StoreQueryParams {
  limit?: number;
  trending?: boolean;
  category?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

interface ProductQueryParams {
  storeId?: string;
  category?: string;
  limit?: number;
}

interface Promotion {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  validUntil?: string;
}


// Get categories
export const fetchCategories = async (): Promise<Category[]> => {
  // المسار عام - لا نحتاج مصادقة
  const response = await axiosInstance.get<Category[]>("/delivery/categories", {
    // @ts-expect-error skip auth header for public route
    __skipAuthHeader: true,
  });
  return response.data as Category[];
};

// Get banners
export const fetchBanners = async (
  placement = "home_hero",
  channel = "app"
): Promise<Banner[]> => {
  const response = await axiosInstance.get<Banner[]>("/delivery/banners", {
    params: { placement, channel },
  });
  return response.data;
};

// Get stores
export const fetchStores = async (
  params: StoreQueryParams = {}
): Promise<Store[]> => {
  // المسار عام - لا نحتاج مصادقة
  const response = await axiosInstance.get<Store[]>("/delivery/stores", {
    params,
    // @ts-expect-error skip auth header for public route
    __skipAuthHeader: true,
  });
  return response.data as Store[];
};

// Get store details
export const fetchStoreDetails = async (storeId: string): Promise<Store> => {
  // المسار عام - لا نحتاج مصادقة
  const response = await axiosInstance.get<Store>(
    `/delivery/stores/${storeId}`,
    {
      // @ts-expect-error skip auth header for public route
      __skipAuthHeader: true,
    }
  );
  return response.data as Store;
};

// Search stores
export const searchStores = async (query: string): Promise<Store[]> => {
  // للبحث العام، لا نحتاج هيدر مصادقة - المسار عام
  const response = await axiosInstance.get<Store[]>("/delivery/stores/search", {
    params: { q: query },
    // @ts-expect-error skip auth header for public route
    __skipAuthHeader: true,
  });
  return response.data as Store[];
};

// Advanced search stores with filtering and sorting
export const searchStoresAdv = async (params: {
  q: string;
  categoryId?: string;
  page?: number;
  limit?: number;
  lat?: number;
  lng?: number;
  filter?: "all" | "favorite";
  sort?: "rating" | "distance" | "new";
}): Promise<{
  items: Store[];
  hasMore: boolean;
  total: number;
  page: number;
  limit: number;
}> => {
  // للبحث المتقدم، لا نحتاج هيدر مصادقة - المسار عام
  const response = await axiosInstance.get<{
    items: Store[];
    hasMore: boolean;
    total: number;
    page: number;
    limit: number;
  }>("/delivery/stores/search", {
    params,
    // @ts-expect-error skip auth header for public route
    __skipAuthHeader: true,
  });
  return response.data as {
    items: Store[];
    hasMore: boolean;
    total: number;
    page: number;
    limit: number;
  };
};

// Get products
export const fetchProducts = async (
  params: ProductQueryParams = {}
): Promise<Product[]> => {
  // المسار عام - لا نحتاج مصادقة
  const response = await axiosInstance.get<Product[]>("/delivery/products", {
    params,
    // @ts-expect-error skip auth header for public route
    __skipAuthHeader: true,
  });
  return response.data as Product[];
};

// Get product details
export const fetchProductDetails = async (
  productId: string
): Promise<Product> => {
  const response = await axiosInstance.get<Product>(
    `/delivery/products/${productId}`
  );
  return response.data as Product;
};

// Search products with advanced filtering
export const searchProducts = async (params: {
  q: string;
  categoryId?: string;
  subCategory?: string;
  storeId?: string;
  minPrice?: number;
  maxPrice?: number;
  isAvailable?: boolean;
  page?: number;
  limit?: number;
  sort?: "relevance" | "priceAsc" | "priceDesc" | "rating" | "new";
}): Promise<{
  items: Product[];
  hasMore: boolean;
  total: number;
  page: number;
  limit: number;
}> => {
  // للبحث في المنتجات، لا نحتاج هيدر مصادقة - المسار عام
  const response = await axiosInstance.get<{
    items: Product[];
    hasMore: boolean;
    total: number;
    page: number;
    limit: number;
  }>("/delivery/products/search", {
    params,
    // @ts-expect-error skip auth header for public route
    __skipAuthHeader: true,
  });
  return response.data as {
    items: Product[];
    hasMore: boolean;
    total: number;
    page: number;
    limit: number;
  };
};

// Get merchant product details
export const fetchMerchantProductDetails = async (
  productId: string
): Promise<Product> => {
  const response = await axiosInstance.get<Product>(
    `/merchant/products/${productId}`
  );
  return response.data as Product;
};

// Get daily offers
export const fetchDailyOffers = async (): Promise<Product[]> => {
  // المسار عام - لا نحتاج مصادقة
  const response = await axiosInstance.get<Product[]>(
    "/delivery/products/daily-offers",
    {
      // @ts-expect-error skip auth header for public route
      __skipAuthHeader: true,
    }
  );
  return response.data as Product[];
};

// Get nearby new products
export const fetchNearbyNewProducts = async (location: {
  lat: number;
  lng: number;
}): Promise<Product[]> => {
  // المسار عام - لا نحتاج مصادقة
  const response = await axiosInstance.get<Product[]>(
    "/delivery/products/nearby/new",
    {
      params: location,
      // @ts-expect-error skip auth header for public route
      __skipAuthHeader: true,
    }
  );
  return response.data as Product[];
};

// Get promotions
export const fetchPromotions = async (placement?: string, channel?: string): Promise<Promotion[]> => {
  // المسار عام - لا نحتاج مصادقة
  const params: any = {};
  if (placement) params.placement = placement;
  if (channel) params.channel = channel;
  
  const response = await axiosInstance.get<Promotion[]>("/promotions/by-placement", {
    params,
    // @ts-expect-error skip auth header for public route
    __skipAuthHeader: true,
  });
  return response.data as Promotion[];
};

// Note: Order functions moved to orders.ts
// Import from: import * as orderApi from './orders';
// Kept here for backward compatibility temporarily

// أخدمني Service APIs
export const createErrandOrder = async (errandData: {
  category: string;
  size?: string;
  weightKg?: string;
  description?: string;
  pickup: {
    label?: string;
    street?: string;
    city?: string;
    contactName?: string;
    phone?: string;
    location?: { lat: number; lng: number };
  };
  dropoff: {
    label?: string;
    street?: string;
    city?: string;
    contactName?: string;
    phone?: string;
    location?: { lat: number; lng: number };
  };
  waypoints?: Array<{
    label?: string;
    location: { lat: number; lng: number };
  }>;
  tip: number;
  scheduledFor?: string;
  paymentMethod: string;
  notes?: string;
}) => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.post("/errands/order", errandData, {
    headers,
  });
  return response.data;
};

export const fetchUserErrands = async (userId: string) => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.get(`/errands/user/${userId}`, {
    headers,
  });
  return response.data;
};

export const fetchErrandDetails = async (errandId: string) => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.get(`/errands/${errandId}`, { headers });
  return response.data;
};

export const updateErrandStatus = async (errandId: string, status: string) => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.patch(
    `/errands/${errandId}/status`,
    { status },
    { headers }
  );
  return response.data;
};

export const rateErrand = async (
  errandId: string,
  rating: number,
  review?: string
) => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.post(
    `/errands/${errandId}/rate`,
    { rating, review },
    { headers }
  );
  return response.data;
};

export const getErrandCategories = async () => {
  const response = await axiosInstance.get("/errands/categories");
  return response.data;
};

export const getAvailableDrivers = async (pickupLocation: {
  lat: number;
  lng: number;
}) => {
  const response = await axiosInstance.get("/errands/drivers/available", {
    params: pickupLocation,
  });
  return response.data;
};

// Grocery APIs (متاجر البقالة)
export const fetchGroceryStores = async (params?: {
  limit?: number;
  category?: string;
  location?: { lat: number; lng: number };
}) => {
  const response = await axiosInstance.get<GroceryStore[]>("/grocery/stores", {
    params,
  });
  return response.data;
};

export const fetchGroceryStoreDetails = async (storeId: string) => {
  const response = await axiosInstance.get<GroceryStore>(
    `/grocery/stores/${storeId}`
  );
  return response.data;
};

export const searchGroceryProducts = async (
  query: string,
  filters?: GroceryFilters
) => {
  const response = await axiosInstance.get<GroceryProduct[]>(
    "/grocery/products/search",
    {
      params: { q: query, ...filters },
    }
  );
  return response.data;
};

export const fetchGroceryProducts = async (
  storeId: string,
  filters?: GroceryFilters
) => {
  const response = await axiosInstance.get<GroceryProduct[]>(
    `/grocery/stores/${storeId}/products`,
    {
      params: filters,
    }
  );
  return response.data;
};

export const fetchGroceryCategories = async () => {
  const response = await axiosInstance.get<GroceryCategoryInfo[]>(
    "/grocery/categories"
  );
  return response.data;
};

export const createGroceryOrder = async (orderData: {
  storeId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  address: {
    label: string;
    city: string;
    street: string;
    location?: { lat: number; lng: number };
  };
  deliveryTime?: string;
  specialInstructions?: string;
}) => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.post<GroceryOrder>(
    "/grocery/order",
    orderData,
    { headers }
  );
  return response.data;
};

export const fetchUserGroceryOrders = async (userId: string) => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.get<GroceryOrder[]>(
    `/grocery/order/user/${userId}`,
    { headers }
  );
  return response.data;
};

export const fetchGroceryOrderDetails = async (orderId: string) => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.get<GroceryOrder>(
    `/grocery/order/${orderId}`,
    { headers }
  );
  return response.data;
};

export const rateGroceryOrder = async (
  orderId: string,
  rating: number,
  review?: string
) => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.post<GroceryOrder>(
    `/grocery/order/${orderId}/rate`,
    { rating, review },
    { headers }
  );
  return response.data;
};

// Gas Service APIs (خدمة الغاز)
export const fetchGasProviders = async () => {
  const response = await axiosInstance.get<GasProvider[]>("/gas/providers");
  return response.data;
};

export const fetchGasCylinders = async () => {
  const response = await axiosInstance.get<GasCylinderInfo[]>("/gas/cylinders");
  return response.data;
};

export const createGasOrder = async (gasOrderData: {
  serviceType: string;
  cylinderType: string;
  quantity: number;
  deliveryAddress: {
    label?: string;
    street?: string;
    city?: string;
    contactName?: string;
    phone?: string;
    location?: { lat: number; lng: number };
  };
  scheduledDate?: string;
  scheduledTime?: string;
  specialInstructions?: string;
  paymentMethod: string;
}) => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.post<GasOrder>(
    "/gas/order",
    gasOrderData,
    { headers }
  );
  return response.data;
};

export const fetchUserGasOrders = async (userId: string) => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.get<GasOrder[]>(
    `/gas/order/user/${userId}`,
    { headers }
  );
  return response.data;
};

export const fetchGasOrderDetails = async (orderId: string) => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.get<GasOrder>(`/gas/order/${orderId}`, {
    headers,
  });
  return response.data;
};

export const updateGasOrderStatus = async (orderId: string, status: string) => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.patch<GasOrder>(
    `/gas/order/${orderId}/status`,
    { status },
    { headers }
  );
  return response.data;
};

export const rateGasOrder = async (
  orderId: string,
  rating: number,
  review?: string
) => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.post<GasOrder>(
    `/gas/order/${orderId}/rate`,
    { rating, review },
    { headers }
  );
  return response.data;
};

// Water Service APIs (خدمة الماء)
export const fetchWaterProviders = async () => {
  const response = await axiosInstance.get<WaterProvider[]>("/water/providers");
  return response.data;
};

export const fetchWaterBottles = async () => {
  const response = await axiosInstance.get<WaterBottleInfo[]>("/water/bottles");
  return response.data;
};

export const createWaterOrder = async (waterOrderData: {
  serviceType: string;
  bottleType: string;
  quantity: number;
  deliveryAddress: {
    label?: string;
    street?: string;
    city?: string;
    contactName?: string;
    phone?: string;
    location?: { lat: number; lng: number };
  };
  scheduledDate?: string;
  scheduledTime?: string;
  specialInstructions?: string;
  paymentMethod: string;
  isRecurring?: boolean;
  recurringFrequency?: "weekly" | "biweekly" | "monthly";
}) => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.post<WaterOrder>(
    "/water/order",
    waterOrderData,
    { headers }
  );
  return response.data;
};

export const fetchUserWaterOrders = async (userId: string) => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.get<WaterOrder[]>(
    `/water/order/user/${userId}`,
    { headers }
  );
  return response.data;
};

export const fetchWaterOrderDetails = async (orderId: string) => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.get<WaterOrder>(
    `/water/order/${orderId}`,
    { headers }
  );
  return response.data;
};

export const updateWaterOrderStatus = async (
  orderId: string,
  status: string
) => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.patch<WaterOrder>(
    `/water/order/${orderId}/status`,
    { status },
    { headers }
  );
  return response.data;
};

export const rateWaterOrder = async (
  orderId: string,
  rating: number,
  review?: string
) => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.post<WaterOrder>(
    `/water/order/${orderId}/rate`,
    { rating, review },
    { headers }
  );
  return response.data;
};

export default {
  fetchCategories,
  fetchBanners,
  fetchStores,
  fetchStoreDetails,
  searchStores,
  searchStoresAdv,
  fetchProducts,
  fetchProductDetails,
  searchProducts,
  fetchMerchantProductDetails,
  fetchDailyOffers,
  fetchNearbyNewProducts,
  fetchPromotions,
  // أخدمني APIs
  createErrandOrder,
  fetchUserErrands,
  fetchErrandDetails,
  updateErrandStatus,
  rateErrand,
  getErrandCategories,
  getAvailableDrivers,
  // Grocery APIs
  fetchGroceryStores,
  fetchGroceryStoreDetails,
  searchGroceryProducts,
  fetchGroceryProducts,
  fetchGroceryCategories,
  createGroceryOrder,
  fetchUserGroceryOrders,
  fetchGroceryOrderDetails,
  rateGroceryOrder,
  // Gas APIs
  fetchGasProviders,
  fetchGasCylinders,
  createGasOrder,
  fetchUserGasOrders,
  fetchGasOrderDetails,
  updateGasOrderStatus,
  rateGasOrder,
  // Water APIs
  fetchWaterProviders,
  fetchWaterBottles,
  createWaterOrder,
  fetchUserWaterOrders,
  fetchWaterOrderDetails,
  updateWaterOrderStatus,
  rateWaterOrder,
};
