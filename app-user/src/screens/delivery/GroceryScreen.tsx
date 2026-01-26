import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";

import {
  addFavorite,
  getFavoritesCounts,
  removeFavorite,
} from "@/api/favorites";
import CategoryItemCard from "@/components/category/CategoryItemCard";
import GroceryFiltersBar, {
  FilterKey,
} from "@/components/delivery/CategoryFiltersBar";
import DeliveryBannerSlider from "@/components/delivery/DeliveryBannerSlider";
import DeliveryHeader from "@/components/delivery/DeliveryHeader";
import COLORS from "@/constants/colors";
import { getAuthBanner } from "@/guards/bannerGateway";
import { RootStackParamList } from "@/types/navigation";
import axiosInstance from "@/utils/api/axiosInstance";

const ITEM_WIDTH = Math.round(Dimensions.get("window").width / 3.2);

// دالة اختيار أفضل عرض
const pickBestPromo = (
  arr?: { _id: string; value?: number; valueType?: "percentage" | "fixed" }[]
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
const ITEM_HEIGHT = 120;

type Props = NativeStackScreenProps<RootStackParamList, "GroceryMainScreen">;

type Store = {
  _id: string;
  name: string;
  address?: string;
  image?: string;
  logo?: string;
  rating?: number;
  tags?: string[];
  isFeatured?: boolean;
  isTrending?: boolean;
  isFavorite?: boolean;
  distanceMeters?: number;
  distanceKm?: number;
  time?: string;
  isOpen?: boolean;
};

export default function GroceryScreen({ route, navigation }: Props) {
  const parentCategoryId = route.params?.categoryId; // فئة الأب
  const [activeCategoryId, setActiveCategoryId] = useState<string | undefined>(
    parentCategoryId
  ); // ✅ الفئة المفعّلة

  // قاعدة البيانات للفئة (نجلبها من السيرفر) + النسخة المفلترة محليًا للعرض
  const [baseStores, setBaseStores] = useState<Store[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [subCategories, setSubCategories] = useState<
    { _id: string; name: string; image: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // فلتر واحد يطابق الباك
  const [filter, setFilter] = useState<FilterKey>("all");

  // إحداثيات للأقرب
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({});
  const geoKey =
    filter === "nearest" && coords.lat && coords.lng
      ? `${coords.lat.toFixed(3)},${coords.lng.toFixed(3)}`
      : "no-geo";

  // كاش بسيط للنتائج الأساسية لكل فئة (بدون nearest). TTL 60 ثانية.
  const cacheRef = useRef<Map<string, { ts: number; data: Store[] }>>(
    new Map()
  );
  const TTL = 60_000;

  // لو تغيّر route (دخلت من فئة أخرى)، حدّث الفئة المفعّلة
  useEffect(() => {
    setActiveCategoryId(parentCategoryId);
  }, [parentCategoryId]);

  // اطلب صلاحية الموقع عند اختيار "nearest"
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (filter !== "nearest") {
        setCoords({});
        return;
      }
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (mounted)
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [filter]);

  // جلب الفئات الفرعية للأب (للعرض كشرائح اختيار)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!parentCategoryId) {
        setSubCategories([]);
        return;
      }
      try {
        const { data } = await axiosInstance.get(
          `/delivery/categories/children/${parentCategoryId}`
        );
        if (!cancelled) setSubCategories(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setSubCategories([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [parentCategoryId]);

  // دالة مساعدة: جلب من السيرفر بحسب الفئة + nearest فقط
  const fetchBaseFromServer = useCallback(
    async (
      categoryIdForFetch?: string,
      nearest: { lat: number; lng: number } | null = null,
      signal?: AbortSignal
    ) => {
      const params: any = { page: 1, limit: 24 };
      if (categoryIdForFetch) params.categoryId = categoryIdForFetch;

      let endpoint = "/delivery/stores"; // الافتراضي
      if (
        nearest &&
        Number.isFinite(nearest.lat) &&
        Number.isFinite(nearest.lng)
      ) {
        endpoint = "/delivery/stores/search";
        params.filter = "nearest";
        params.lat = nearest.lat;
        params.lng = nearest.lng;
      }

      const { data } = await axiosInstance.get(endpoint, { params, signal });
      const raw = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.data)
        ? data.data
        : [];

      const list: Store[] = (raw || []).map((s: any) => ({
        ...s,
        distanceKm: s.distanceMeters ? s.distanceMeters / 1000 : s.distanceKm,
        isOpen: typeof s.isOpen === "boolean" ? s.isOpen : true,
        isFavorite: !!s.isFavorite,
        tags: s.tags || [],
      }));

      // جلب حالة المفضلة دفعة واحدة
      if (list.length) {
        try {
          const ids = list.map((x: any) => x._id);
          const map = await getFavoritesCounts("restaurant", ids);
          list.forEach((st: any) => {
            st.isFavorite = (map?.[st._id] ?? 0) === 1;
          });
        } catch {}
      }

      // ▼▼ اجلب العروض وادمجها ▼▼
      try {
        if (list.length) {
          const idsCsv = list.map((s) => s._id).join(",");
          const { data: promoResp } = await axiosInstance.get(
            "/delivery/promotions/by-stores",
            { params: { ids: idsCsv, channel: "app" } }
          );

          // promoResp قد يكون Map: { [storeId]: Promo[] } أو Array
          const getStorePromos = (sid: string) =>
            Array.isArray(promoResp)
              ? promoResp.filter((p: any) => p.store === sid)
              : promoResp?.[sid];

          list.forEach((s) => {
            const best = pickBestPromo(getStorePromos(s._id));
            if (best) {
              (s as any).promoBadge =
                best.valueType === "percentage"
                  ? `خصم ${best.value}%`
                  : `خصم ${best.value} ﷼`;
              (s as any).promoPercent =
                best.valueType === "percentage" ? best.value : undefined;
              (s as any).promoId = best._id;
            }
          });
        }
      } catch (e) {
        // تجاهل أخطاء العروض بدون قطع التجربة
      }

      return list;
    },
    []
  );

  // جلب مع كاش للفئات (بدون nearest). nearest لا نكاشّه لتغيره السريع.
  const fetchBaseWithCache = useCallback(
    async (categoryIdForFetch?: string, signal?: AbortSignal) => {
      const key = categoryIdForFetch || "no-cat";
      const hit = cacheRef.current.get(key);
      if (hit && Date.now() - hit.ts < TTL) {
        return hit.data;
      }
      const data = await fetchBaseFromServer(categoryIdForFetch, null, signal);
      cacheRef.current.set(key, { ts: Date.now(), data });
      return data;
    },
    [fetchBaseFromServer]
  );

  // مفتاح يعتمد على التغيير الذي يستدعي جلب سيرفري فعلاً:
  // - تغيّر الفئة
  // - nearest + إحداثيات
  const serverKey = useMemo(() => {
    const effCat = activeCategoryId ?? parentCategoryId ?? "no-cat";
    return filter === "nearest"
      ? `nearest|${effCat}|${geoKey}`
      : `base|${effCat}`;
  }, [activeCategoryId, parentCategoryId, filter, geoKey]);

  // الجلب السيرفري (مرة فقط عند تغيّرات حقيقية)
  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      try {
        const effCat = activeCategoryId ?? parentCategoryId;
        let data: Store[] = [];

        if (filter === "nearest") {
          if (coords.lat && coords.lng) {
            data = await fetchBaseFromServer(
              effCat,
              { lat: coords.lat, lng: coords.lng },
              controller.signal
            );
          } else {
            // لو nearest بدون إحداثيات، لا نجلب الآن
            data = [];
          }
        } else {
          data = await fetchBaseWithCache(effCat, controller.signal);
        }

        if (!alive) return;
        setBaseStores(data);
      } catch (e) {
        if (!alive) return;
        setBaseStores([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [
    serverKey,
    fetchBaseFromServer,
    fetchBaseWithCache,
    coords.lat,
    coords.lng,
  ]);

  // تطبيق الفلاتر “المحلية” بدون API على baseStores
  const applyLocalFilters = useCallback((list: Store[], f: FilterKey) => {
    let out = [...list];

    if (f === "featured") out = out.filter((s) => !!s.isFeatured);
    if (f === "trending") out = out.filter((s) => !!s.isTrending);
    if (f === "topRated")
      out = out
        .filter((s) => (s.rating ?? 0) > 0)
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (f === "favorite") out = out.filter((s) => !!s.isFavorite);

    // nearest تم تطبيقه سيرفريًا بالفعل
    return out;
  }, []);

  useEffect(() => {
    setStores(applyLocalFilters(baseStores, filter));
  }, [baseStores, filter, applyLocalFilters]);

  // تحديث المفضلة عند الرجوع للشاشة (يزامن baseStores فقط ثم يعيد بناء stores)
  useFocusEffect(
    useCallback(() => {
      if (!baseStores.length) return;
      const ids = baseStores.map((s) => s._id);
      getFavoritesCounts("restaurant", ids)
        .then((map) => {
          setBaseStores((prev) =>
            prev.map((s) => ({ ...s, isFavorite: (map?.[s._id] ?? 0) === 1 }))
          );
        })
        .catch(() => {});
    }, [baseStores.length])
  );

  const [favBusy, setFavBusy] = useState<Set<string>>(new Set());

  const toggleFavorite = async (storeId: string, cur: boolean, store?: any) => {
    // منع السبام: تجاهل لو هذا المتجر قيد المعالجة
    if (favBusy.has(storeId)) return;
    setFavBusy((s) => new Set(s).add(storeId));

    // تفاؤليًا: اعكس الحالة
    setStores((prev) =>
      prev.map((s) => (s._id === storeId ? { ...s, isFavorite: !cur } : s))
    );

    try {
      if (cur) {
        // إزالة من المفضلة
        await removeFavorite(storeId, "restaurant");
      } else {
        // إضافة للمفضلة — مرّر لقطة تساعد شاشة المفضلة لاحقًا
        await addFavorite(storeId, "restaurant", {
          title: store?.name,
          image:
            typeof store?.logo === "string" && store.logo
              ? store.logo
              : store?.image,
          rating: typeof store?.rating === "number" ? store.rating : undefined,
          storeId: storeId,
          storeType: store?.category?.usageType ?? undefined, // "grocery" | "restaurant"
        });
      }
    } catch (e: any) {
      // رول-باك عند الفشل (401 أو أي خطأ)
      setStores((prev) =>
        prev.map((s) => (s._id === storeId ? { ...s, isFavorite: cur } : s))
      );

      // احتياط: لو API ما أظهر البانر لسببٍ ما، أظهره هنا عند 401
      if (e?.response?.status === 401) {
        getAuthBanner()?.show("login");
      }
    } finally {
      // فكّ العلم للمتجر هذا
      setFavBusy((s) => {
        const n = new Set(s);
        n.delete(storeId);
        return n;
      });
    }
  };
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="#D84315" />
      </View>
    );
  }

  // ✅ شريحة "الكل" + الفئات الفرعية
  const categoryChips = [
    { _id: "__all__", name: "الكل", image: "" },
    ...subCategories,
  ];

  return (
    <View style={styles.container}>
      <DeliveryHeader />

      <DeliveryBannerSlider
        placement="category_header"
        channel="app"
        categoryId={parentCategoryId}
      />

      <View style={styles.subCategoriesContainer}>
        {categoryChips.length > 0 && (
          <FlatList
            data={categoryChips}
            horizontal
            keyExtractor={(item) => item._id}
            showsHorizontalScrollIndicator={false}
            snapToInterval={ITEM_WIDTH}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 10 }}
            renderItem={({ item }) => {
              const isAll = item._id === "__all__";
              const isActive = isAll
                ? activeCategoryId === parentCategoryId
                : activeCategoryId === item._id;
              return (
                <TouchableOpacity
                  style={[
                    styles.sliderCard,
                    isActive && {
                      borderWidth: 2,
                      borderColor: COLORS.primary,
                      backgroundColor: "#FFF6F3",
                    },
                  ]}
                  activeOpacity={0.85}
                  onPress={() => {
                    if (isAll) setActiveCategoryId(parentCategoryId);
                    else setActiveCategoryId(item._id);
                  }}
                >
                  {!!item.image && (
                    <Image
                      source={{ uri: item.image }}
                      style={styles.sliderImage}
                    />
                  )}
                  <Text
                    style={[
                      styles.sliderText,
                      isActive && { color: COLORS.primary },
                    ]}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>

      {/* ✅ الفلاتر (local/server-aware) */}
      <View style={styles.filtersRow}>
        <GroceryFiltersBar value={filter} onChange={(id) => setFilter(id)} />
      </View>

      <DeliveryBannerSlider
        placement="category_feed"
        channel="app"
        categoryId={parentCategoryId}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.itemsContainer}>
          {stores.length === 0 ? (
            <Text style={styles.emptyText}>
              لا توجد متاجر في هذه الفئة حالياً.
            </Text>
          ) : (
            stores.map((store) => (
              <CategoryItemCard
                key={`${store._id}-${store.isFavorite ? "fav" : "nofav"}`}
                item={{
                  id: store._id,
                  title: store.name,
                  subtitle: store.address || "",
                  distance:
                    typeof store.distanceKm === "number"
                      ? `${store.distanceKm.toFixed(1)} كم`
                      : "غير محدد",
                  time: store.time || "غير محدد",
                  rating: store.rating || 4.5,
                  isOpen: store.isOpen ?? true,
                  isFavorite: !!store.isFavorite,
                  tags: store.tags || [],
                  image: { uri: store.image },
                  logo: { uri: store.logo },

                  // 👇 أهم سطر لظهور الشارة
                  discountLabel: (store as any).promoBadge,
                }}
                onPress={() =>
                  navigation.navigate("BusinessDetails", { business: store })
                }
                onToggleFavorite={() =>
                  toggleFavorite(store._id, !!store.isFavorite, store)
                }
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  filtersRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  subCategoriesContainer: { marginTop: 2, marginBottom: 2 },
  sliderCard: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    marginRight: 12,
    backgroundColor: "#FFF",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#EEE",
    borderWidth: 1,
  },
  sliderImage: { width: ITEM_WIDTH - 20, height: 68, resizeMode: "contain" },
  sliderText: {
    fontFamily: "Cairo-Bold",
    fontSize: 14,
    color: COLORS.blue,
    textAlign: "center",
  },
  itemsContainer: {},
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 20,
    fontFamily: "Cairo-Bold",
  },
});
