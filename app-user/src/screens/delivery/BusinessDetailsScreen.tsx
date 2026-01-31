// screens/delivery/BusinessDetailsScreen.tsx
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Platform,
  Share,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";

import FloatingCartButton from "@/components/FloatingCartButton";
import BusinessHeader from "@/components/business/BusinessHeader";
import BusinessInfoCard from "@/components/business/BusinessInfoCard";
import BusinessProductItem from "@/components/business/BusinessProductItem";
import BusinessTabs from "@/components/business/BusinessTabs";

import { fetchWithAuth } from "@/api/authService";
import {
  addFavorite,
  isFavorite as apiIsFavorite,
  getFavoritesCounts,
  removeFavorite,
} from "@/api/favorites";
import { useCart } from "@/context/CartContext";
import { RootStackParamList } from "@/types/navigation";
import axiosInstance from "@/utils/api/axiosInstance";
import { API_URL } from "@/utils/api/config";

// Enhanced color palette for web compatibility
const COLORS = {
  primary: "#FF500D",
  background: "#FFFFFF",
  surface: "#F8FAFC",
  text: "#1A3052",
  textLight: "#6B7280",
  border: "#E5E7EB",
  card: "#FFFFFF",
};

type NavProps = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "BusinessDetails">;

type StoreSection = { _id: string; name: string };
type SubCategory = { _id: string; name: string };

type MerchantProduct = {
  _id: string;
  section?: StoreSection;
  product?: { name: string; image?: string; description?: string };
  price: number;
  customImage?: string;
  customDescription?: string;
};

type StoreProduct = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image: string;
  subCategoryId?: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: { uri: string | undefined };
  description?: string;
  isFavorite?: boolean;
  rating?: number;
  discountLabel?: string; // لإظهار شارة الخصم
};

const INFOCARD_OVERLAP = 60;

const pickBestPromo = (
  arr?: { value?: number; valueType?: "percentage" | "fixed"; _id: string }[]
) => {
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

const applyBestPromo = (
  basePrice: number,
  promos: { value?: number; valueType?: "percentage" | "fixed"; _id: string }[]
) => {
  const best = pickBestPromo(promos);
  if (!best)
    return { price: basePrice, originalPrice: undefined, label: undefined };

  if (best.valueType === "percentage") {
    const v = Math.max(0, Math.min(100, best.value ?? 0));
    const price = Math.max(0, Math.round(basePrice * (1 - v / 100)));
    return { price, originalPrice: basePrice, label: `خصم ${v}%` };
  } else {
    const v = Math.max(0, best.value ?? 0);
    const price = Math.max(0, basePrice - v);
    return { price, originalPrice: basePrice, label: `-${v} ر.ي` };
  }
};

export default function BusinessDetailsScreen() {
  /** ----- Nav + Route ----- */
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavProps>();
  const params = route.params as any;

  const businessId: string | undefined =
    params?.businessId ?? params?.storeId ?? params?.business?._id;

  // قد تأتي بيانات المتجر كاملةً من الشاشة السابقة
  const [business, setBusiness] = useState<any>(params?.business ?? null);

  /** ----- Layout ----- */
  const { width: screenWidth } = Dimensions.get("window");
  const containerPadding = 16;
  const contentMaxWidth = screenWidth - 32;
  const cardRadius = 12;

  /** ----- State ----- */
  const { addToCart } = useCart();
  const [categories, setCategories] = useState<string[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<
    Record<string, Product[]>
  >({});
  const [selectedTab, setSelectedTab] = useState<string>("");

  // مفضلة المتجر
  const [storeFavorite, setStoreFavorite] = useState(false);
  const [favBusy, setFavBusy] = useState(false);

  /** ----- Fetch store if needed ----- */
  useEffect(() => {
    if (business) return;
    if (!businessId) {
      Alert.alert("تنبيه", "لا يوجد معرّف متجر");
      navigation.goBack();
      return;
    }
    (async () => {
      try {
        const res = await fetchWithAuth(
          `${API_URL}/delivery/stores/${businessId}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const store = json?.data ?? json;
        setBusiness(store);
      } catch (e) {
        console.warn("Failed to load store", e);
        Alert.alert("خطأ", "تعذّر تحميل بيانات المتجر");
        navigation.goBack();
      }
    })();
  }, [businessId, business]);

  /** ----- Load tabs + products + promos + fav counts ----- */
  useEffect(() => {
    if (!business) return;

    const loadAll = async () => {
      try {
        let tabs: string[] = [];
        const grouped: Record<string, Product[]> = {};

        if (business.category?.usageType === "grocery") {
          // === البقالات ===
          const sectionRes = await fetchWithAuth(
            `${API_URL}/delivery/sections?store=${business._id}`
          );
          const sectionJson = await sectionRes.json();
          const sections: StoreSection[] = Array.isArray(sectionJson?.data)
            ? sectionJson.data
            : Array.isArray(sectionJson) ? sectionJson : [];
          tabs = sections.map((s) => s.name);

          const prodsRes = await fetchWithAuth(
            `${API_URL}/groceries/merchant-products?store=${business._id}`
          );
          const prodsJson = await prodsRes.json();
          const allProds: MerchantProduct[] = Array.isArray(prodsJson?.data)
            ? prodsJson.data
            : Array.isArray(prodsJson) ? prodsJson : [];

          // اجمع كل IDs للمنتجات
          const productIds = Array.from(new Set(allProds.map((p) => p._id)));
          const idsParam = encodeURIComponent(productIds.join(","));

          // عروض المنتج + عرض المتجر
          const [prodPromRes, storePromRes] = await Promise.all([
            fetch(
              `${API_URL}/delivery/promotions/by-products?ids=${idsParam}&channel=app`
            ),
            fetch(
              `${API_URL}/delivery/promotions/by-stores?ids=${encodeURIComponent(
                business._id
              )}&channel=app`
            ),
          ]);

          const prodPromJson = prodPromRes.ok ? await prodPromRes.json() : null;
          const storePromJson = storePromRes.ok ? await storePromRes.json() : null;
          const prodPromList = Array.isArray(prodPromJson?.data)
            ? prodPromJson.data
            : Array.isArray(prodPromJson) ? prodPromJson : [];
          const storePromList = Array.isArray(storePromJson?.data)
            ? storePromJson.data
            : Array.isArray(storePromJson) ? storePromJson : [];
          const productPromoMap: Record<string, any[]> = {};
          prodPromList.forEach((p: any) => {
            const pid = p.product?.toString?.() ?? p.product ?? p.productId ?? p._id;
            if (pid) {
              if (!productPromoMap[pid]) productPromoMap[pid] = [];
              productPromoMap[pid].push(p);
            }
          });
          const storePromos = storePromList.filter(
            (p: any) => (p.store?.toString?.() ?? p.store) === business._id
          );

          sections.forEach((sec) => {
            grouped[sec.name] = allProds
              .filter((p) => p.section?._id === sec._id)
              .map((p) => {
                const basePrice = p.price;
                const mergedPromos = [
                  ...(productPromoMap[p._id] || []),
                  ...storePromos,
                ];
                const {
                  price,
                  originalPrice,
                  label: discountLabel,
                } = applyBestPromo(basePrice, mergedPromos);

                return {
                  id: p._id,
                  name: p.product?.name ?? "بدون اسم",
                  price,
                  originalPrice,
                  image: { uri: p.customImage || p.product?.image },
                  description: p.customDescription || p.product?.description,
                  discountLabel,
                } as Product;
              });
          });
        } else {
          // === المطاعم ===: الفئات الداخلية = GET /delivery/subcategories?storeId=xxx
          const subRes = await fetchWithAuth(
            `${API_URL}/delivery/subcategories?storeId=${business._id}`
          );
          const subJson = await subRes.json();
          const subs: SubCategory[] = Array.isArray(subJson?.data)
            ? subJson.data
            : Array.isArray(subJson) ? subJson : [];
          tabs = subs.map((s) => s.name);

          // منتجات المتجر = GET /delivery/stores/:id/products
          const prodRes = await fetchWithAuth(
            `${API_URL}/delivery/stores/${business._id}/products`
          );
          const prodJson = await prodRes.json();
          const payload = prodJson?.data ?? prodJson;
          const prodsList = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
          const prods: StoreProduct[] = prodsList;

          const productIds = Array.from(new Set(prods.map((p) => p._id)));
          const idsParam = encodeURIComponent(productIds.join(","));

          const [prodPromRes, storePromRes] = await Promise.all([
            fetch(
              `${API_URL}/delivery/promotions/by-products?ids=${idsParam}&channel=app`
            ),
            fetch(
              `${API_URL}/delivery/promotions/by-stores?ids=${encodeURIComponent(
                business._id
              )}&channel=app`
            ),
          ]);

          const prodPromJsonR = prodPromRes.ok ? await prodPromRes.json() : null;
          const storePromJsonR = storePromRes.ok ? await storePromRes.json() : null;
          const prodPromListR = Array.isArray(prodPromJsonR?.data)
            ? prodPromJsonR.data
            : Array.isArray(prodPromJsonR) ? prodPromJsonR : [];
          const storePromListR = Array.isArray(storePromJsonR?.data)
            ? storePromJsonR.data
            : Array.isArray(storePromJsonR) ? storePromJsonR : [];
          const productPromoMap: Record<string, any[]> = {};
          prodPromListR.forEach((p: any) => {
            const pid = p.product?.toString?.() ?? p.product ?? p.productId ?? p._id;
            if (pid) {
              if (!productPromoMap[pid]) productPromoMap[pid] = [];
              productPromoMap[pid].push(p);
            }
          });
          const storePromos = storePromListR.filter(
            (p: any) => (p.store?.toString?.() ?? p.store) === business._id
          );

          subs.forEach((sub) => {
            const subId = typeof sub._id === "string" ? sub._id : (sub as any)._id?.toString?.();
            grouped[sub.name] = prods
              .filter((p) => {
                const pSub = (p as any).subCategoryId ?? (p as any).subCategory?._id ?? (p as any).subCategory;
                const pSubStr = typeof pSub === "string" ? pSub : pSub?.toString?.();
                return pSubStr === subId;
              })
              .map((p) => {
                const basePrice = p.price;
                const mergedPromos = [
                  ...(productPromoMap[p._id] || []),
                  ...storePromos,
                ];
                const {
                  price,
                  originalPrice,
                  label: discountLabel,
                } = applyBestPromo(basePrice, mergedPromos);

                return {
                  id: p._id,
                  name: p.name,
                  price,
                  originalPrice,
                  image: { uri: p.image },
                  description: p.description,
                  discountLabel,
                } as Product;
              });
          });
        }

        // مفضلة المنتجات (counts)
        const allProductIds = Array.from(
          new Set(
            Object.values(grouped)
              .flat()
              .map((p) => p.id)
          )
        );
        if (allProductIds.length) {
          try {
            const map = await getFavoritesCounts("product", allProductIds);
            Object.keys(grouped).forEach((k) => {
              grouped[k] = grouped[k].map((p) => ({
                ...p,
                isFavorite: (map?.[p.id] ?? 0) === 1,
              }));
            });
          } catch {}
        }

        setCategories(tabs);
        setProductsByCategory(grouped);
        setSelectedTab(tabs[0] || "");
      } catch (err) {
        console.error("خطأ في جلب بيانات صفحة المتجر:", err);
      }
    };

    loadAll();
  }, [business]);

  /** ----- Fetch store favorite (once store ready) ----- */
  useEffect(() => {
    (async () => {
      if (!business?._id) return;
      try {
        const exists = await apiIsFavorite(business._id, "restaurant");
        setStoreFavorite(!!exists);
      } catch {
        setStoreFavorite(false);
      }
    })();
  }, [business?._id]);

  /** ----- Share store ----- */
  const handleShare = async () => {
    if (!business) return;
    const webUrl =
      business.shareUrl || `https://bthwani.com/store/${business._id}`;
    const deeplink = `bthwani://store/${business._id}`;
    const message = `جرّب ${business.name} على تطبيق بثواني:\n${webUrl}`;

    try {
      await Share.share(
        Platform.select({
          ios: { message, url: webUrl, title: business.name },
          android: { message: `${message}\n${deeplink}` },
          default: { message },
        }) as any
      );
    } catch (e) {
      Alert.alert("لم تتم المشاركة", "حاول مجددًا لاحقًا.");
    }
  };

  /** ----- Toggle store favorite ----- */
  const toggleStoreFavorite = async () => {
    if (!business || favBusy) return;
    const next = !storeFavorite;
    setStoreFavorite(next); // optimistic
    setFavBusy(true);
    try {
      if (next) {
        await addFavorite(business._id, "restaurant", {
          title: business.name,
          image: business.image,
          rating: business.rating,
          storeType: business.category?.usageType,
        });
      } else {
        await removeFavorite(business._id, "restaurant");
      }
    } catch (e) {
      setStoreFavorite(!next); // rollback
      Alert.alert("تعذّر تحديث المفضلة");
    } finally {
      setFavBusy(false);
    }
  };

  /** ----- Toggle product favorite ----- */
  const toggleProductFavorite = async (prod: Product) => {
    if (!business) return;
    setProductsByCategory((prev) => {
      const next: typeof prev = {};
      for (const [cat, list] of Object.entries(prev)) {
        next[cat] = list.map((p) =>
          p.id === prod.id ? { ...p, isFavorite: !p.isFavorite } : p
        );
      }
      return next;
    });

    try {
      if (prod.isFavorite) {
        await removeFavorite(prod.id, "product");
      } else {
        await addFavorite(prod.id, "product", {
          title: prod.name,
          image: prod.image?.uri,
          price: prod.price,
          rating: prod.rating,
          storeId: business._id,
          storeType: business.category?.usageType,
        });
      }
    } catch {
      // rollback
      setProductsByCategory((prev) => {
        const next: typeof prev = {};
        for (const [cat, list] of Object.entries(prev)) {
          next[cat] = list.map((p) =>
            p.id === prod.id ? { ...p, isFavorite: !!prod.isFavorite } : p
          );
        }
        return next;
      });
    }
  };

  /** ----- Render ----- */
  if (!business) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#D84315" />
      </View>
    );
  }

  const renderHeader = () => (
    <>
      <BusinessHeader
        image={{ uri: business.image }}
        onBackPress={() => navigation.goBack()}
        onSharePress={handleShare}
        onFavoritePress={toggleStoreFavorite}
        isFavorite={storeFavorite}
        favoriteDisabled={favBusy}
      />
      <BusinessInfoCard
        business={{
          ...business,
          categories,
          distance: business.distance || "غير محدد",
          time: business.time || "غير محدد",
          isFavorite: storeFavorite,
        }}
      />
      <View style={styles.tabsWrap}>
        <BusinessTabs
          categories={categories}
          selected={selectedTab}
          onSelect={setSelectedTab}
        />
      </View>
    </>
  );

  const renderFooter = () => <View style={styles.footerSpacing} />;
  const products = productsByCategory[selectedTab] || [];

  // Grid configuration
  const getGridConfig = () => {
    return { numColumns: 2, margin: 7 };
  };

  const { numColumns, margin: CARD_MARGIN } = getGridConfig();
  const ITEM_WIDTH =
    (screenWidth - (numColumns + 1) * CARD_MARGIN - containerPadding * 2) /
    numColumns;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <FlatList
        data={products}
        numColumns={numColumns}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingHorizontal: containerPadding, maxWidth: contentMaxWidth },
        ]}
        columnWrapperStyle={products.length > 0 ? styles.row : undefined}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: Product }) => (
          <View
            style={{
              width: ITEM_WIDTH,
              margin: CARD_MARGIN,
            }}
          >
            <BusinessProductItem
              product={item}
              isFavorite={!!item.isFavorite}
              onToggleFavorite={() => toggleProductFavorite(item)}
              storeId={business._id}
              storeType={
                business.category?.usageType === "grocery"
                  ? "grocery"
                  : "restaurant"
              }
              onAdd={async (product: Product, qty: number) => {
                const success = await addToCart({
                  id: product.id,
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  quantity: qty,
                  image: product.image?.uri ?? null,
                  originalPrice: product.originalPrice,
                  storeId: business._id,
                  store: business._id,
                  storeType:
                    business.category?.usageType === "grocery"
                      ? "grocery"
                      : "restaurant",
                  productType:
                    business.category?.usageType === "grocery"
                      ? "deliveryProduct"
                      : "restaurantProduct",
                });
                if (success) {
                  Alert.alert(
                    "✅ تمت الإضافة",
                    "تمت إضافة المنتج إلى السلة بنجاح"
                  );
                } else {
                  Alert.alert(
                    "⚠️ تعارض في السلة",
                    "لا يمكنك خلط منتجات من متاجر مختلفة"
                  );
                }
              }}
            />
          </View>
        )}
        ListEmptyComponent={<View style={styles.emptyWrap} />}
      />
      <FloatingCartButton />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  headerWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    zIndex: 10,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingBottom: 20,
    alignSelf: "center",
    width: "100%",
  },
  scroll: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  infoCardOverlap: {
    marginTop: -INFOCARD_OVERLAP,
    zIndex: 20,
  },
  tabsWrap: {
    marginTop: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  footerSpacing: {
    height: 80,
  },
});
