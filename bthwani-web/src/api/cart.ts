import axiosInstance from "./axios-instance";
import { getAuthHeader } from "./auth";
import type { CartItem, Cart } from "../types";

interface CartFeeResponse {
  deliveryFee: number;
  serviceFee: number;
  total: number;
}

interface AddToCartRequest {
  productId: string;
  quantity: number;
  storeId?: string;
}

interface MergeCartRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

// Get user cart
export const getUserCart = async (userId: string): Promise<Cart> => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.get<Cart>(
    `/delivery/cart/user/${userId}`,
    { headers }
  );
  return response.data;
};

// Get cart by ID
export const getCartById = async (cartId: string): Promise<Cart> => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.get<Cart>(`/delivery/cart/${cartId}`, {
    headers,
  });
  return response.data;
};

// Add item to cart
export const addToCart = async (data: AddToCartRequest): Promise<CartItem> => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.post<CartItem>(
    "/delivery/cart/add",
    data,
    { headers }
  );
  return response.data;
};

// Calculate cart fees
export const getCartFee = async (cartId: string): Promise<CartFeeResponse> => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.get<CartFeeResponse>(
    "/delivery/cart/fee",
    {
      params: { cartId },
      headers,
    }
  );
  return response.data;
};

// Merge carts (useful when user logs in and has local cart)
export const mergeCart = async (data: MergeCartRequest): Promise<Cart> => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.post<Cart>(
    "/delivery/cart/merge",
    data,
    { headers }
  );
  return response.data;
};

// Remove item from cart
export const removeFromCart = async (productId: string): Promise<void> => {
  const headers = await getAuthHeader();
  await axiosInstance.delete(`/delivery/cart/${productId}`, { headers });
};

// Update cart item quantity
export const updateCartItem = async (
  productId: string,
  quantity: number
): Promise<CartItem> => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.patch<CartItem>(
    `/delivery/cart/${productId}`,
    { quantity },
    { headers }
  );
  return response.data;
};

// Clear cart
export const clearCart = async (): Promise<void> => {
  const headers = await getAuthHeader();
  await axiosInstance.delete("/delivery/cart", { headers });
};

// Validate coupon
export const validateCoupon = async (
  couponCode: string,
  cartId: string
): Promise<{
  isValid: boolean;
  discount: number;
  message: string;
}> => {
  const headers = await getAuthHeader();
  const response = await axiosInstance.post(
    "/coupons/validate",
    { couponCode, cartId },
    { headers }
  );
  return response.data;
};

export default {
  getUserCart,
  getCartById,
  addToCart,
  getCartFee,
  mergeCart,
  removeFromCart,
  updateCartItem,
  clearCart,
  validateCoupon,
};
