// src/context/CartContext.tsx
import { useAuth } from "@/auth/AuthContext";
import axiosInstance from "@/utils/api/axiosInstance";
import { getOrCreateCartId } from "@/utils/cartId";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface CartProviderProps {
  children: ReactNode;
}

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: { uri: string } | string | null;
  originalPrice?: number;
  storeId: string;
  store: string;
  storeType: string;
  productType: "merchantProduct" | "deliveryProduct" | "restaurantProduct";
};

const imgOf = (x: any): { uri: string } | string | null => {
  if (!x) return null;
  if (typeof x === "string") return x;
  if (x?.uri) return { uri: x.uri };
  return null;
};

// 🧩 توحيد العناصر القادمة من الـ API
const normalizeItems = (raw: any[]): CartItem[] =>
  (raw || []).map((i: any) => {
    const id = i.productId ?? i.id ?? i._id;
    const q = Number(i.quantity);
    const storeId =
      i.storeId ?? i.store?._id ?? i.store ?? i.product?.storeId ?? "";

    return {
      id,
      productId: id,
      name: i.name ?? i.title ?? i.product?.name ?? "",
      price: Number(i.price) || 0,
      quantity: Number.isFinite(q) && q > 0 ? q : 1,
      image: imgOf(i.image) ?? imgOf(i.product?.image) ?? null,
      originalPrice: i.originalPrice,
      storeId,
      store: storeId,
      storeType: i.storeType ?? i.store?.type ?? "",
      productType: (i.productType as any) ?? "deliveryProduct",
    };
  });

type CartContextType = {
  items: CartItem[];
  totalPrice: number;
  totalQuantity: number;
  activeStoreId: string | null;
  addToCart: (item: CartItem, qty?: number) => Promise<boolean>;
  updateQuantity: (
    id: string,
    storeId: string,
    productType: string,
    qty: number
  ) => Promise<void>;
  removeFromCart: (
    id: string,
    storeId: string,
    productType: string
  ) => Promise<void>;
  clearCart: () => Promise<void>;
  mergeGuestCart: (userId: string) => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { authReady, isLoggedIn, lastAuthChangeTs } = useAuth();

  const extractItems = (res: any) =>
    res?.data?.items ?? res?.data?.cart?.items ?? [];

  const activeStoreId = useMemo(
    () => (items.length ? items[0].storeId || null : null),
    [items]
  );

  const loadCart = async (userId?: string) => {
    const cartId = await getOrCreateCartId();
    const getUserCart = () =>
      axiosInstance.get(`/delivery/cart/user/${userId}`, {
        headers: { "x-silent-401": "1" },
      });
    const getGuestCart = () =>
      axiosInstance.get(`/delivery/cart/${cartId}`, {
        headers: { "x-silent-401": "1" },
      });

    try {
      let res;
      if (userId) {
        try {
          res = await getUserCart();
        } catch (e) {
          if (
            axios.isAxiosError(e) &&
            (e.response?.status === 401 || e.response?.status === 404)
          ) {
            res = await getGuestCart();
          } else throw e;
        }
      } else {
        res = await getGuestCart();
      }
      const raw = extractItems(res);
      setItems(normalizeItems(raw));
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const st = e.response?.status;
        if (st === 401 || st === 404) {
          setItems([]); // ضيف/لا توجد سلة
          return;
        }
      }
      console.warn("loadCart unexpected error:", e);
    }
  };

  // إقلاع أولي
  useEffect(() => {
    loadCart();
  }, []);

  // إعادة تحميل السلة عند تغيّر حالة الأوث
  useEffect(() => {
    if (!authReady) return;
    (async () => {
      const userId = await AsyncStorage.getItem("userId");
      await loadCart(userId || undefined);
    })();
  }, [authReady, isLoggedIn, lastAuthChangeTs]);

  const addToCart = async (item: CartItem, qty = 1): Promise<boolean> => {
    const cartId = await getOrCreateCartId();
    const userId = await AsyncStorage.getItem("userId");
    if (!item.storeId || !item.id) return false;

    // ✅ منع الخلط محليًا بدون ريكوست
    if (activeStoreId && activeStoreId !== item.storeId) {
      return false;
    }

    const quantity = Number.isFinite(qty as any)
      ? (qty as number)
      : item.quantity ?? 1;

    const body: any = {
      cartId,
      store: item.storeId,
      items: [
        {
          productId: item.id,
          productType: item.productType,
          name: item.name,
          price: item.price,
          quantity,
          store: item.storeId,
          image: typeof item.image === "string" ? item.image : item.image?.uri,
        },
      ],
    };

    try {
      const res = await axiosInstance.post("/delivery/cart/add", body, {
        headers: { "x-silent-401": "1" },
      });
      const raw = extractItems(res);
      setItems(normalizeItems(raw));
      return true;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const st = err.response?.status;
        const code = (err.response?.data as any)?.code;

        if (st === 409 && code === "CART_STORE_TOO_FAR") {
          // المتجر بعيد عن الموجودين بالسلة
          return false; // خلّي الشاشة تقرر تعرض توست/مودال
        }
        if (st === 401 || st === 404) {
          const userId = await AsyncStorage.getItem("userId");
          await loadCart(userId || undefined);
        }
      }
      return false;
    }
  };

  const updateQuantity = async (
    id: string,
    storeId: string,
    productType: string,
    quantity: number
  ) => {
    if (quantity <= 0) return removeFromCart(id, storeId, productType);

    // تحديث تفاؤلي
    setItems((prev) =>
      prev.map((i) =>
        (i.id === id || i.productId === id) &&
        (i.storeId === storeId || i.store === storeId) &&
        i.productType === productType
          ? { ...i, quantity }
          : i
      )
    );

    try {
      await axiosInstance.put(
        `/delivery/cart/items/${id}`,
        { quantity, productType },
        { headers: { "x-silent-401": "1" } }
      );
    } catch {
      // تجاهل بهدوء
    } finally {
      const userId = await AsyncStorage.getItem("userId");
      await loadCart(userId || undefined);
    }
  };

  const removeFromCart = async (
    id: string,
    storeId: string,
    productType: string
  ) => {
    const cartId = await getOrCreateCartId();
    const userId = await AsyncStorage.getItem("userId");
    const url = userId
      ? `/delivery/cart/user/${userId}/items/${id}?storeId=${storeId}&productType=${productType}`
      : `/delivery/cart/${cartId}/items/${id}?storeId=${storeId}&productType=${productType}`;

    try {
      await axiosInstance.delete(url, { headers: { "x-silent-401": "1" } });
    } catch {
      // صامت
    } finally {
      await loadCart(userId || undefined);
    }
  };

  const clearCart = async () => {
    const cartId = await getOrCreateCartId();
    const userId = await AsyncStorage.getItem("userId");
    const url = userId
      ? `/delivery/cart/user/${userId}`
      : `/delivery/cart/${cartId}`;

    try {
      await axiosInstance.delete(url, { headers: { "x-silent-401": "1" } });
    } catch {
      // اعتبرها فارغة
    } finally {
      setItems([]);
    }
  };

  const mergeGuestCart = async (userId: string) => {
    const json = await AsyncStorage.getItem("guestCart");
    if (!json) return;
    const guestItems: CartItem[] = JSON.parse(json);
    const storeId = await AsyncStorage.getItem("guestStoreId");

    try {
      await axiosInstance.post(
        "/delivery/cart/merge",
        { items: guestItems, storeId },
        { headers: { "x-silent-401": "1" } }
      );
      await AsyncStorage.removeItem("guestCart");
      await AsyncStorage.removeItem("guestStoreId");
      await loadCart(userId);
    } catch (e) {
      console.warn("Failed to merge guest cart", e);
    }
  };

  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalPrice,
        totalQuantity,
        activeStoreId,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        mergeGuestCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
