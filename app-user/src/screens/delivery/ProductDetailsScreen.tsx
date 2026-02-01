import { addFavorite, isFavorite, removeFavorite } from "@/api/favorites";
import COLORS from "@/constants/colors";
import { useCart } from "@/context/CartContext";
import axiosInstance from "@/utils/api/axiosInstance";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ========== Types ==========
type RouteParams = {
  product: {
    id: string;
    name: string;
    image: any;
    price: number;
    originalPrice?: number;
    description?: string;
  };
  storeId: string;
  store: string;
  storeType: "restaurant" | "grocery" | "shop";
};

type Promo = {
  _id: string;
  value?: number;
  valueType?: "percentage" | "fixed";
};

const { width } = Dimensions.get("window");
const IMAGE_HEIGHT = width * 0.74;

// ========== Helpers (اختيار أفضل خصم وتطبيقه) ==========
const pickBestPromo = (arr?: Promo[]) => {
  if (!arr || !arr.length) return undefined;
  const perc = arr
    .filter((p) => p.valueType === "percentage")
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  if (perc.length) return perc[0];
  const fixed = arr
    .filter((p) => p.valueType === "fixed")
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  return fixed[0] || arr[0];
};

const applyBestPromo = (basePrice: number, promos: Promo[]) => {
  const best = pickBestPromo(promos);
  if (!best)
    return {
      price: basePrice,
      originalPrice: undefined as number | undefined,
      label: undefined as string | undefined,
    };

  if (best.valueType === "percentage") {
    const v = Math.max(0, Math.min(100, best.value ?? 0));
    const price = Math.max(0, Math.round(basePrice * (1 - v / 100)));
    return { price, originalPrice: basePrice, label: `-${v}%` };
  } else {
    const v = Math.max(0, best.value ?? 0);
    const price = Math.max(0, basePrice - v);
    return { price, originalPrice: basePrice, label: `-${v} ر.ي` };
  }
};

// ===============================================

const CommonProductDetailsScreen = () => {
  const { product, storeId, storeType, store } = useRoute<any>()
    .params as RouteParams;
  const navigation = useNavigation();
  const { addToCart } = useCart();

  // مفضلة المنتج
  const [favorite, setFavorite] = useState(false);
  const scaleAnim = new Animated.Value(1);

  // ✅ السعر الفعلي بعد الخصم + السعر القديم + شارة الخصم
  const [unitPrice, setUnitPrice] = useState<number>(product.price);
  const [origPrice, setOrigPrice] = useState<number | undefined>(
    product.originalPrice
  );
  const [discountLabel, setDiscountLabel] = useState<string | undefined>(
    undefined
  );

  // Grocery inputs
  const [quantity, setQuantity] = useState(1);
  const [inputKg, setInputKg] = useState("1");
  const [inputAmount, setInputAmount] = useState("");

  // ========== Fetch promos for (product + store) ==========
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // 1) عروض المنتج
        const prodRes = await axiosInstance.get(`/delivery/promotions/by-products?ids=${encodeURIComponent(
            product.id
          )}&channel=app`);
        const prodMap: Record<string, Promo[]> = prodRes.data || {};

        // 2) عروض المتجر
        const storeRes = await axiosInstance.get(`/delivery/promotions/by-stores?ids=${encodeURIComponent(
            storeId
          )}&channel=app`);
        const storeMap: Record<string, Promo[]> = storeRes.data || {};

        const allPromos: Promo[] = [
          ...(prodMap[product.id] || []),
          ...(storeMap[storeId] || []),
        ];

        // 3) طبّق أفضل خصم (سياسة best)
        const applied = applyBestPromo(product.price, allPromos);
        if (!cancelled) {
          setUnitPrice(applied.price);
          setOrigPrice(applied.originalPrice);
          setDiscountLabel(applied.label);
        }
      } catch (e) {
        // لو فشل، نحتفظ بسعر المنتج كما هو
        if (!cancelled) {
          setUnitPrice(product.price);
          setOrigPrice(product.originalPrice);
          setDiscountLabel(undefined);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [product.id, product.price, product.originalPrice, storeId]);

  // ========== Favorite ==========
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ok = await isFavorite(product.id, "product");
        if (mounted) setFavorite(!!ok);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [product.id]);

  const toggleFavorite = async () => {
    const next = !favorite;
    setFavorite(next);
    Animated.spring(scaleAnim, {
      toValue: next ? 1.18 : 1,
      useNativeDriver: true,
    }).start();
    try {
      if (next) {
        await addFavorite(product.id, "product", {
          title: product.name,
          image:
            typeof product.image === "string"
              ? product.image
              : product.image?.uri,
          price: unitPrice,
          storeId,
          storeType: storeType as "restaurant" | "grocery",
        });
      } else {
        await removeFavorite(product.id, "product");
      }
    } catch {
      setFavorite(!next); // rollback عند 401 أو أي خطأ
    }
  };

  // ========== Grocery inputs handlers ==========
  const pricePerKg = unitPrice; // ⭐ السعر بعد الخصم لو فيه
  const handleKgChange = (value: string) => {
    setInputKg(value);
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      setInputAmount((num * pricePerKg).toFixed(0));
    } else {
      setInputAmount("");
    }
  };
  const handleAmountChange = (value: string) => {
    setInputAmount(value);
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      setInputKg((num / pricePerKg).toFixed(2));
    } else {
      setInputKg("");
    }
  };

  // ========== Add to cart ==========
  const handleAddToCart = async () => {
    let itemQty = 1;
    let itemType: "restaurantProduct" | "merchantProduct" | "deliveryProduct" =
      "merchantProduct";
    let itemPrice = unitPrice; // ⭐ خذ السعر بعد الخصم

    if (storeType === "grocery") {
      itemQty = parseFloat(inputKg) || 1;
      itemType = "deliveryProduct";
      itemPrice = pricePerKg;
    } else if (storeType === "restaurant") {
      itemQty = quantity;
      itemType = "restaurantProduct";
      itemPrice = unitPrice;
    } else {
      itemQty = 1;
      itemType = "merchantProduct";
      itemPrice = unitPrice;
    }

    const result = await addToCart({
      id: product.id,
      productId: product.id,
      productType: itemType,
      name: product.name,
      price: itemPrice,
      quantity: itemQty,
      image: product.image,
      originalPrice: origPrice, // ⭐ مرّر السعر القديم لو موجود
      storeId,
      store,
      storeType,
    });

    if (result.success) {
      Alert.alert("✅ تمت الإضافة", `${product.name} تمت إضافته إلى السلة`);
    } else {
      const msg =
        result.reason === "auth"
          ? "يجب تسجيل الدخول لإضافة المنتج إلى السلة"
          : result.reason === "store_conflict"
            ? "لا يمكنك خلط منتجات من متاجر مختلفة"
            : result.reason === "validation"
              ? "بيانات المنتج أو المتجر ناقصة"
              : "تحقق من الاتصال وحاول مرة أخرى";
      Alert.alert("تعذر الإضافة", msg);
    }
  };

  // ========== Price UI ==========
  const renderPrice = () => {
    if (origPrice && origPrice > unitPrice) {
      const discount = Math.round(((origPrice - unitPrice) / origPrice) * 100);
      return (
        <View style={styles.priceContainer}>
          <Text style={styles.originalPrice}>{origPrice.toFixed(1)} ر.ي</Text>
          <Text style={styles.discountedPrice}>{unitPrice.toFixed(1)} ر.ي</Text>
          {!!discountLabel && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountLabel}</Text>
            </View>
          )}
          {!discountLabel && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discount}%</Text>
            </View>
          )}
        </View>
      );
    }
    return <Text style={styles.price}>{unitPrice.toFixed(1)} ر.ي</Text>;
  };

  // إجمالي الدفع الظاهر أسفل الشاشة
  const totalToPay = useMemo(() => {
    if (storeType === "grocery") {
      const amount =
        parseFloat(inputAmount) ||
        pricePerKg * (parseFloat(inputKg || "0") || 0);
      return Math.max(0, amount).toFixed(1);
    }
    return (unitPrice * quantity).toFixed(1);
  }, [storeType, pricePerKg, inputAmount, inputKg, unitPrice, quantity]);

  // ========== Render ==========
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* صورة المنتج */}
        <Animated.View
          style={[styles.imageContainer, { transform: [{ scale: scaleAnim }] }]}
        >
          <Image
            source={product.image}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={[
              "transparent",
              "rgba(255,133,0,0.15)",
              "rgba(255,133,0,0.42)",
            ]}
            style={styles.imageGradient}
            start={{ x: 0.5, y: 0.4 }}
            end={{ x: 0.5, y: 1 }}
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => (navigation as any).goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={toggleFavorite}
          >
            <MaterialIcons
              name={favorite ? "favorite" : "favorite-border"}
              size={28}
              color={favorite ? "#FF5252" : "#fff"}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* تفاصيل المنتج */}
        <View style={styles.detailsCard}>
          <View style={styles.header}>
            <Text style={styles.name}>{product.name}</Text>
            {renderPrice()}
          </View>

          {!!product.description && (
            <Text style={styles.description}>{product.description}</Text>
          )}

          {storeType === "grocery" && (
            <View style={styles.section}>
              <View style={styles.dualInputRow}>
                {/* الكمية (كيلو) */}
                <View style={styles.inputContainer}>
                  <Text style={styles.smallLabel}>الكمية (كيلو)</Text>
                  <View style={styles.innerRow}>
                    <TextInput
                      value={inputKg}
                      onChangeText={handleKgChange}
                      keyboardType="decimal-pad"
                      style={styles.smallInput}
                      placeholder="مثلاً 0.25"
                    />
                    <Text style={styles.amountUnit}>كجم</Text>
                  </View>
                </View>
                {/* المبلغ (ريال) */}
                <View style={styles.inputContainer}>
                  <Text style={styles.smallLabel}>المبلغ (ريال)</Text>
                  <View style={styles.innerRow}>
                    <TextInput
                      value={inputAmount}
                      onChangeText={handleAmountChange}
                      keyboardType="numeric"
                      style={styles.smallInput}
                      placeholder="مثلاً 200"
                    />
                    <Text style={styles.amountUnit}>ريال</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {storeType === "restaurant" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>الكمية المطلوبة</Text>
              <View style={styles.amountInputRow}>
                <TouchableOpacity
                  onPress={() => setQuantity((q) => Math.max(q - 1, 1))}
                  style={styles.qtyButton}
                >
                  <Text style={styles.qtyText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyText}>{quantity}</Text>
                <TouchableOpacity
                  onPress={() => setQuantity((q) => q + 1)}
                  style={styles.qtyButton}
                >
                  <Text style={styles.qtyText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleAddToCart}
            style={styles.addButton}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>إضافة إلى السلة</Text>
            <Ionicons
              name="cart"
              size={20}
              color="#fff"
              style={styles.cartIcon}
            />
          </TouchableOpacity>
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>المجموع</Text>
            <Text style={styles.totalPriceSmall}>{totalToPay} ر.ي</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// ========== Styles ==========
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContainer: { paddingBottom: 140, marginBottom: 40 },

  dualInputRow: {
    flexDirection: "row-reverse",
    gap: 8,
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  inputContainer: { flex: 1, marginHorizontal: 3 },
  smallLabel: {
    fontSize: 13,
    color: COLORS.blue,
    fontFamily: "Cairo-Bold",
    marginBottom: 2,
    marginRight: 2,
  },
  innerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8F3",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  smallInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 3,
    paddingHorizontal: 7,
    backgroundColor: "transparent",
    borderWidth: 0,
    color: COLORS.blue,
    fontFamily: "Cairo-Bold",
    textAlign: "center",
  },
  amountUnit: {
    fontSize: 12,
    marginRight: 5,
    color: COLORS.blue,
    fontFamily: "Cairo-Bold",
  },

  imageContainer: {
    height: IMAGE_HEIGHT,
    width: "100%",
    overflow: "hidden",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    backgroundColor: "#FFF6F0",
    marginBottom: -22,
  },
  image: { width: "100%", height: "100%" },
  imageGradient: { ...StyleSheet.absoluteFillObject, bottom: 0, zIndex: 1 },

  amountInputRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginTop: 8,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 48 : 22,
    left: 16,
    backgroundColor: "rgba(255,133,0,0.54)",
    borderRadius: 22,
    padding: 8,
    zIndex: 2,
  },
  favoriteButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 48 : 22,
    right: 16,
    backgroundColor: "rgba(255,133,0,0.54)",
    borderRadius: 22,
    padding: 8,
    zIndex: 2,
  },

  detailsCard: {
    flex: 1,
    padding: 26,
    backgroundColor: "#fff",
    fontFamily: "Cairo-Bold",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -28,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  name: {
    fontSize: 22,
    fontFamily: "Cairo-Bold",
    color: COLORS.blue,
    flex: 1,
    marginRight: 5,
  },
  priceContainer: {
    alignItems: "flex-end",
    flexDirection: "row-reverse",
    gap: 7,
  },
  price: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Cairo-Bold",
    color: COLORS.primary,
  },
  originalPrice: {
    fontSize: 16,
    color: "#bbb",
    textDecorationLine: "line-through",
    fontFamily: "Cairo-Bold",
  },
  discountedPrice: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Cairo-Bold",
    color: COLORS.orangeDark,
    marginLeft: 5,
  },
  discountBadge: {
    backgroundColor: "#FFE1B9",
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 1,
    alignSelf: "center",
    marginLeft: 7,
  },
  discountText: {
    fontSize: 13,
    color: COLORS.orangeDark,
    fontFamily: "Cairo-Bold",
  },

  description: {
    fontSize: 15.5,
    color: "#515151",
    fontFamily: "Cairo-Bold",
    lineHeight: 25,
    marginBottom: 23,
    marginTop: -4,
    opacity: 0.97,
  },
  section: { marginBottom: 10 },
  sectionTitle: {
    fontSize: 15.5,
    color: "#7C4D26",
    fontFamily: "Cairo-Bold",
    marginBottom: 12,
    marginRight: 2,
  },

  qtyButton: { paddingHorizontal: 14, paddingVertical: 6 },
  qtyText: {
    color: "#fff",
    fontSize: 18,
    marginHorizontal: 10,
    minWidth: 28,
    textAlign: "center",
    fontFamily: "Cairo-Bold",
    letterSpacing: 1,
  },

  footer: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#FFD9BD",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 20,
  },
  totalContainer: { alignItems: "center", marginTop: 8 },
  totalText: { fontSize: 14, color: COLORS.blue, fontFamily: "Cairo-Bold" },
  totalPriceSmall: {
    fontSize: 16,
    color: COLORS.primary,
    fontFamily: "Cairo-Bold",
    marginTop: 4,
  },

  addButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    fontFamily: "Cairo-Bold",
    paddingHorizontal: 24,
    borderRadius: 13,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: COLORS.orangeDark,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "Cairo-Bold",
    marginLeft: 4,
  },
  cartIcon: { marginHorizontal: 6 },
});

export default CommonProductDetailsScreen;
