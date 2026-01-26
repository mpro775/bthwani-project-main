import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import CategoryFiltersBar from "@/components/category/CategoryFiltersBar";
import CategoryItemCard from "@/components/category/CategoryItemCard";
import DeliveryBannerSlider from "@/components/delivery/DeliveryBannerSlider";
import DeliveryHeader from "@/components/delivery/DeliveryHeader";
import { RootStackParamList } from "@/types/navigation";
import { DeliveryStore } from "@/types/types";
import axiosInstance from "@/utils/api/axiosInstance";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  DeliveryStoreWithDistance,
  enrichStoresWithDistance,
} from "@/utils/enrichStoresWithDistance";

// ⭐ جديد: API المفضلة + محدد النوع
import {
  addFavorite,
  getFavoritesCounts,
  removeFavorite,
} from "@/api/favorites";
import { getAuthBanner } from "@/guards/bannerGateway";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "BusinessDetails"
>;
type CategoryDetailsRouteProp = RouteProp<
  RootStackParamList,
  "CategoryDetails"
>;
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

const CategoryDetailsScreen = () => {
  const route = useRoute<CategoryDetailsRouteProp>();
  const { categoryId } = route.params;
  const navigation = useNavigation<NavigationProp>();

  const [stores, setStores] = useState<DeliveryStoreWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterModal, setFilterModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    meal: "",
    trending: false,
    featured: false,
    topRated: false,
    nearest: false,
    favorite: false,
  });
  useFocusEffect(
    React.useCallback(() => {
      if (!stores.length) return;
      const ids = stores.map((s) => s._id);
      getFavoritesCounts("restaurant", ids)
        .then((map) => {
          setStores((prev) =>
            prev.map((s) => {
              const v = map?.[s._id];
              return { ...s, isFavorite: (v ?? 0) === 1 };
            })
          );
        })
        .catch((e) => {});
    }, [stores.length])
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/delivery/stores?categoryId=${categoryId}`);
        // data already available from axiosInstance
        const arr: DeliveryStore[] = Array.isArray(res.data) ? res.data : [];

        const unique = new Map<string, DeliveryStore>();
        arr.forEach((s) => {
          if (s?._id && !unique.has(s._id)) unique.set(s._id, s);
        });
        const enriched = await enrichStoresWithDistance(
          Array.from(unique.values())
        );

        const final = enriched.map((store) => ({
          ...store,
          isOpen: typeof store.isOpen === "boolean" ? store.isOpen : true,
          isFavorite:
            typeof store.isFavorite === "boolean" ? store.isFavorite : false,
          tags: store.tags || [],
        }));

        // ⭐ جديد: اجلب عروض المتاجر دفعة واحدة
        if (final.length) {
          const idsParam = encodeURIComponent(
            final.map((s) => s._id).join(",")
          );
          // مرّر القناة/المدينة لو متوفرة عندك
          const promosRes = await axiosInstance.get(`/delivery/promotions/by-stores?ids=${idsParam}&channel=app`);
          const promoMap: Record<string, any[]> = promosRes.data;

          // دمج أفضل عرض في بيانات المتاجر
          final.forEach((s) => {
            const best = pickBestPromo(promoMap[s._id]);
            (s as any).promoBadge = best
              ? best.valueType === "percentage"
                ? `خصم ${best.value}%`
                : `خصم ${best.value} ﷼`
              : undefined;
            (s as any).promoPercent =
              best?.valueType === "percentage" ? best.value : undefined;
            (s as any).promoId = best?._id;
          });
        }

        // ⭐ (اختياري) جلب المفضلة كما عندك
        if (final.length) {
          try {
            const ids = final.map((s) => s._id);
            const map = await getFavoritesCounts("restaurant", ids);
            final.forEach((s) => {
              const v = map?.[s._id];
              (s as any).isFavorite = (v ?? 0) === 1;
            });
          } catch (e) {}
        }

        setStores(final);
      } catch (error) {
        setStores([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryId]);

  // ⭐ جديد: تبديل المفضلة
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

  const filteredStores = useMemo(() => {
    let list = stores.filter((store) => {
      if (activeFilters.meal && !store.tags?.includes(activeFilters.meal))
        return false;
      if (activeFilters.trending && !store.isTrending) return false;
      if (activeFilters.featured && !store.isFeatured) return false;
      if (activeFilters.favorite && !store.isFavorite) return false;
      return true;
    });

    if (activeFilters.topRated) {
      list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (activeFilters.nearest) {
      list = [...list].sort(
        (a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
      );
    }
    return list;
  }, [stores, activeFilters]);

  const handleFilterBarChange = (id: string) => {
    if (id === "topRated")
      setActiveFilters((f) => ({ ...f, topRated: true, nearest: false }));
    else if (id === "nearest")
      setActiveFilters((f) => ({ ...f, nearest: true, topRated: false }));
    else if (id === "favorite")
      setActiveFilters((f) => ({ ...f, favorite: !f.favorite }));
    else
      setActiveFilters((f) => ({
        ...f,
        topRated: false,
        nearest: false,
        favorite: false,
      }));
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#D84315" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.stickyHeader}>
        <DeliveryHeader />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <DeliveryBannerSlider
          placement="category_header"
          channel="app"
          categoryId={categoryId}
          // city={currentCity} // اختياري لو عندك مدينة المستخدم
        />

        <View style={styles.filtersRow}>
          <CategoryFiltersBar onChange={handleFilterBarChange} />
          <TouchableOpacity
            style={styles.filterIconBtn}
            onPress={() => setFilterModal(true)}
          >
            <Text style={styles.filterIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.itemsContainer}>
          {filteredStores.length === 0 ? (
            <Text style={styles.emptyText}>
              لا توجد متاجر في هذه الفئة حالياً.
            </Text>
          ) : (
            filteredStores.map((store) => (
              <CategoryItemCard
                key={`${store._id}-${store.isFavorite ? "fav" : "nofav"}`}
                item={{
                  id: store._id,
                  title: store.name,
                  subtitle: store.address || "",
                  distance: store.distance || "غير محدد",
                  time: store.time || "غير محدد",
                  rating: store.rating || 4.5,
                  isOpen: true,
                  isFavorite: !!store.isFavorite, // ✅ المهم
                  tags: store.tags || [],
                  image: { uri: store.image },
                  logo: { uri: store.logo },
                  discountLabel: (store as any).promoBadge,
                }}
                onPress={() =>
                  navigation.navigate("BusinessDetails", { business: store })
                }
                // ✅ مرّر الكولباك:
                onToggleFavorite={() =>
                  toggleFavorite(store._id, !!store.isFavorite, store)
                }
              />
            ))
          )}
        </View>

        {/* Modal التصفية كما هو */}
        <Modal visible={filterModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.filterModalContent}>
              <Text style={styles.modalTitle}>تصفية المطاعم</Text>
              {/* ... بقية محتوى المودال بدون تغيير ... */}
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => setFilterModal(false)}
              >
                <Text style={styles.applyBtnText}>تطبيق التصفية</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

// ... Styles نفس اللي عندك ...

export default CategoryDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  filtersRow: {
    flexDirection: "row-reverse", // للعربي. اجعلها "row" للإنجليزي
    alignItems: "center",
    marginBottom: 8,
    gap: 8, // لو مدعومة في RN لديك
  },

  stickyHeader: {
    zIndex: 10,
    backgroundColor: "#fff",
    paddingBottom: 6,
  },
  filterIconBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    marginRight: 8,
    elevation: 1,
  },
  modalTitle: {
    fontSize: 18,
    color: "#D84315",
    fontFamily: "Cairo-Bold",
    marginBottom: 10,
    alignSelf: "center",
  },

  filterIcon: {
    fontSize: 16,
    color: "#D84315",
    fontFamily: "Cairo-Bold",
  },
  filterModalContent: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    margin: 24,
    alignItems: "center",
  },
  optionBtn: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginHorizontal: 6,
    marginBottom: 6,
  },
  activeOptionBtn: {
    backgroundColor: "#D84315",
  },
  checkBox: {
    borderWidth: 1,
    borderColor: "#AAA",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  activeCheckBox: {
    backgroundColor: "#FFE7E2",
    borderColor: "#D84315",
  },
  applyBtn: {
    backgroundColor: "#D84315",
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 10,
    marginTop: 24,
  },
  applyBtnText: {
    color: "#fff",
    fontFamily: "Cairo-Bold",
    fontSize: 15,
  },
  optionText: {
    fontSize: 14,
    fontFamily: "Cairo-Bold",
    color: "#222",
    paddingHorizontal: 3,
  },
  filterLabel: {
    fontSize: 15,
    color: "#D84315",
    fontFamily: "Cairo-Bold",
    marginBottom: 4,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  filterOptionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  section: {
    marginBottom: 10,
  },
  contentContainer: {
    paddingBottom: 20,
    paddingTop: 6,
  },
  itemsContainer: {
    marginTop: 20,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 20,
    fontFamily: "Cairo-Regular",
  },
});
