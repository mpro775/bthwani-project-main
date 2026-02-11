import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
  ScrollView,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { RootStackParamList } from "@/types/navigation";
import {
  KenzItem,
  KenzListResponse,
  KenzCategory,
  KENZ_CATEGORIES,
  KENZ_YEMEN_CITIES,
  KenzYemenCity,
} from "@/types/types";
import {
  getKenzList,
  getKenzCategoriesTree,
  getKenzFavorites,
  addKenzFavorite,
  removeKenzFavorite,
  type KenzSortOption,
  type KenzCondition,
  type KenzDeliveryOption,
} from "@/api/kenzApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";
import KenzCard from "@/components/kenz/KenzCard";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "KenzList">;

const KenzListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, isLoggedIn } = useAuth();
  const [items, setItems] = useState<KenzItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    KenzCategory | undefined
  >();
  const [selectedCity, setSelectedCity] = useState<KenzYemenCity | undefined>();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState<KenzSortOption>("newest");
  const [selectedCondition, setSelectedCondition] = useState<
    KenzCondition | undefined
  >();
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<
    KenzDeliveryOption | undefined
  >();
  const [categoryOptions, setCategoryOptions] = useState<string[]>(
    KENZ_CATEGORIES as unknown as string[],
  );
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [openDropdown, setOpenDropdown] = useState<
    "category" | "city" | "condition" | "delivery" | "sort" | null
  >(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadItemsRef = useRef<
    ((cursor?: string, isLoadMore?: boolean) => Promise<void>) | null
  >(null);

  useEffect(() => {
    getKenzCategoriesTree()
      .then((tree) => {
        const flatten = (
          list: { nameAr: string; children?: unknown[] }[],
        ): string[] => {
          const out: string[] = [];
          for (const node of list) {
            out.push(node.nameAr);
            if (node.children?.length)
              out.push(
                ...flatten(
                  node.children as { nameAr: string; children?: unknown[] }[],
                ),
              );
          }
          return out;
        };
        if (tree?.length) setCategoryOptions(flatten(tree));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setFavoritedIds(new Set());
      return;
    }
    getKenzFavorites()
      .then((res) => {
        const ids = new Set((res?.items ?? []).map((i) => i._id));
        setFavoritedIds(ids);
      })
      .catch(() => setFavoritedIds(new Set()));
  }, [user?.uid]);

  const handleFavoriteToggle = useCallback(
    async (item: KenzItem) => {
      const id = item._id;
      const isFav = favoritedIds.has(id);
      setFavoritedIds((prev) => {
        const next = new Set(prev);
        if (isFav) next.delete(id);
        else next.add(id);
        return next;
      });
      try {
        if (isFav) await removeKenzFavorite(id);
        else await addKenzFavorite(id);
      } catch {
        setFavoritedIds((prev) => {
          const next = new Set(prev);
          if (isFav) next.add(id);
          else next.delete(id);
          return next;
        });
      }
    },
    [favoritedIds],
  );

  const loadItems = useCallback(
    async (cursor?: string, isLoadMore = false) => {
      try {
        if (isLoadMore) {
          setLoadingMore(true);
        } else if (!cursor) {
          setLoading(true);
        }

        const response: KenzListResponse = await getKenzList(
          cursor,
          selectedCategory,
          undefined,
          selectedCity,
          searchQuery.trim() || undefined,
          sortOption,
          selectedCondition,
          selectedDeliveryOption,
        );
        const list = response?.items ?? [];

        if (isLoadMore) {
          setItems((prev) => [...prev, ...list]);
        } else {
          setItems(list);
        }

        setNextCursor(response.nextCursor);
        setHasMore(!!response.nextCursor);
      } catch (error) {
        console.error("خطأ في تحميل الإعلانات:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [
      selectedCategory,
      selectedCity,
      selectedCondition,
      selectedDeliveryOption,
      searchQuery,
      sortOption,
    ],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadItems();
  }, [loadItems]);

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore && nextCursor) {
      loadItems(nextCursor, true);
    }
  }, [hasMore, loadingMore, nextCursor, loadItems]);

  const handleItemPress = useCallback(
    (item: KenzItem) => {
      navigation.navigate("KenzDetails", { itemId: item._id });
    },
    [navigation],
  );

  const handleCreatePress = useCallback(() => {
    navigation.navigate("KenzCreate");
  }, [navigation]);

  const handleCategoryChange = useCallback(
    (category: KenzCategory | undefined) => {
      setSelectedCategory(category);
      setItems([]);
      setNextCursor(undefined);
      setHasMore(true);
      loadItems(undefined, false);
    },
    [loadItems],
  );

  const handleCityChange = useCallback(
    (city: KenzYemenCity | undefined) => {
      setSelectedCity(city);
      setItems([]);
      setNextCursor(undefined);
      setHasMore(true);
      loadItems(undefined, false);
    },
    [loadItems],
  );

  const handleConditionChange = useCallback(
    (condition: KenzCondition | undefined) => {
      setSelectedCondition(condition);
      setItems([]);
      setNextCursor(undefined);
      setHasMore(true);
      loadItems(undefined, false);
    },
    [loadItems],
  );

  const handleDeliveryOptionChange = useCallback(
    (deliveryOption: KenzDeliveryOption | undefined) => {
      setSelectedDeliveryOption(deliveryOption);
      setItems([]);
      setNextCursor(undefined);
      setHasMore(true);
      loadItems(undefined, false);
    },
    [loadItems],
  );

  useEffect(() => {
    loadItemsRef.current = loadItems;
  }, [loadItems]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // بحث مع تأخير (debounce) لتفادي الطلبات الكثيرة عند الكتابة
  const searchDebounceFirstRef = useRef(true);
  useEffect(() => {
    if (searchDebounceFirstRef.current) {
      searchDebounceFirstRef.current = false;
      return;
    }
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setItems([]);
      setNextCursor(undefined);
      setHasMore(true);
      loadItemsRef.current?.(undefined, false);
    }, 400);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  const CONDITION_OPTIONS: { value: KenzCondition; label: string }[] = [
    { value: "new", label: "جديد" },
    { value: "used", label: "مستعمل" },
    { value: "refurbished", label: "مجدد" },
  ];
  const DELIVERY_OPTIONS: { value: KenzDeliveryOption; label: string }[] = [
    { value: "meetup", label: "لقاء" },
    { value: "delivery", label: "توصيل" },
    { value: "both", label: "لقاء وتوصيل" },
  ];
  const SORT_OPTIONS: { value: KenzSortOption; label: string }[] = [
    { value: "newest", label: "الأحدث" },
    { value: "price_asc", label: "السعر (أقل أولاً)" },
    { value: "price_desc", label: "السعر (أعلى أولاً)" },
    { value: "views_desc", label: "الأكثر مشاهدة" },
  ];

  const applySort = useCallback(
    (opt: KenzSortOption) => {
      setSortOption(opt);
      setItems([]);
      setNextCursor(undefined);
      setHasMore(true);
      loadItems(undefined, false);
    },
    [loadItems],
  );

  const renderFilterBar = () => (
    <View style={styles.filterBar}>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={COLORS.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث في الإعلانات..."
            placeholderTextColor={COLORS.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity
          style={styles.selectTrigger}
          onPress={() => setOpenDropdown("sort")}
        >
          <Text style={styles.selectTriggerText} numberOfLines={1}>
            {SORT_OPTIONS.find((o) => o.value === sortOption)?.label ?? "ترتيب"}
          </Text>
          <Ionicons name="chevron-down" size={18} color={COLORS.gray} />
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
      >
        <TouchableOpacity
          style={styles.selectChip}
          onPress={() => setOpenDropdown("category")}
        >
          <Text style={styles.selectChipLabel}>الفئة</Text>
          <Text style={styles.selectChipValue} numberOfLines={1}>
            {selectedCategory ?? "الكل"}
          </Text>
          <Ionicons name="chevron-down" size={14} color={COLORS.gray} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.selectChip}
          onPress={() => setOpenDropdown("condition")}
        >
          <Text style={styles.selectChipLabel}>الحالة</Text>
          <Text style={styles.selectChipValue} numberOfLines={1}>
            {selectedCondition
              ? CONDITION_OPTIONS.find((o) => o.value === selectedCondition)
                  ?.label
              : "الكل"}
          </Text>
          <Ionicons name="chevron-down" size={14} color={COLORS.gray} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.selectChip}
          onPress={() => setOpenDropdown("delivery")}
        >
          <Text style={styles.selectChipLabel}>التوصيل</Text>
          <Text style={styles.selectChipValue} numberOfLines={1}>
            {selectedDeliveryOption
              ? DELIVERY_OPTIONS.find((o) => o.value === selectedDeliveryOption)
                  ?.label
              : "الكل"}
          </Text>
          <Ionicons name="chevron-down" size={14} color={COLORS.gray} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.selectChip}
          onPress={() => setOpenDropdown("city")}
        >
          <Text style={styles.selectChipLabel}>المدينة</Text>
          <Text style={styles.selectChipValue} numberOfLines={1}>
            {selectedCity ?? "الكل"}
          </Text>
          <Ionicons name="chevron-down" size={14} color={COLORS.gray} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderDropdownModal = () => {
    if (!openDropdown) return null;
    const close = () => setOpenDropdown(null);

    const optionsCategory = [
      { value: undefined, label: "الكل" },
      ...categoryOptions.map((c) => ({ value: c as KenzCategory, label: c })),
    ];
    const optionsCity = [
      { value: undefined, label: "الكل" },
      ...KENZ_YEMEN_CITIES.map((c) => ({ value: c, label: c })),
    ];
    const optionsCondition = [
      { value: undefined, label: "الكل" },
      ...CONDITION_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
    ];
    const optionsDelivery = [
      { value: undefined, label: "الكل" },
      ...DELIVERY_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
    ];

    let title = "";
    let options: { value: unknown; label: string }[] = [];
    let onSelect: (value: unknown) => void = () => {};

    if (openDropdown === "category") {
      title = "اختر الفئة";
      options = optionsCategory;
      onSelect = (v) => {
        handleCategoryChange(v as KenzCategory | undefined);
        close();
      };
    } else if (openDropdown === "city") {
      title = "اختر المدينة";
      options = optionsCity;
      onSelect = (v) => {
        handleCityChange(v as KenzYemenCity | undefined);
        close();
      };
    } else if (openDropdown === "condition") {
      title = "الحالة";
      options = optionsCondition;
      onSelect = (v) => {
        handleConditionChange(v as KenzCondition | undefined);
        close();
      };
    } else if (openDropdown === "delivery") {
      title = "طريقة التوصيل";
      options = optionsDelivery;
      onSelect = (v) => {
        handleDeliveryOptionChange(v as KenzDeliveryOption | undefined);
        close();
      };
    } else if (openDropdown === "sort") {
      title = "ترتيب النتائج";
      options = SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }));
      onSelect = (v) => {
        applySort(v as KenzSortOption);
        close();
      };
    }

    return (
      <Modal visible transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={close}>
          <Pressable style={styles.modalBox} onPress={() => {}}>
            <Text style={styles.modalTitle}>{title}</Text>
            <ScrollView
              style={styles.modalScroll}
              keyboardShouldPersistTaps="handled"
            >
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt.label}
                  style={styles.modalOption}
                  onPress={() => onSelect(opt.value)}
                >
                  <Text style={styles.modalOptionText}>{opt.label}</Text>
                  {(openDropdown === "category" &&
                    selectedCategory === opt.value) ||
                  (openDropdown === "city" && selectedCity === opt.value) ||
                  (openDropdown === "condition" &&
                    selectedCondition === opt.value) ||
                  (openDropdown === "delivery" &&
                    selectedDeliveryOption === opt.value) ||
                  (openDropdown === "sort" && sortOption === opt.value) ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={COLORS.primary}
                    />
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={close}>
              <Text style={styles.modalCloseText}>إغلاق</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

  const renderItem = ({ item }: { item: KenzItem }) => (
    <KenzCard
      item={item}
      onPress={() => handleItemPress(item)}
      isFavorited={user ? favoritedIds.has(item._id) : undefined}
      onFavoritePress={user ? () => handleFavoriteToggle(item) : undefined}
    />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.footerText}>جاري التحميل...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="storefront" size={64} color={COLORS.gray} />
        <Text style={styles.emptyTitle}>لا توجد إعلانات</Text>
        <Text style={styles.emptySubtitle}>
          لا توجد إعلانات في هذه الفئة حالياً
        </Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreatePress}
        >
          <Text style={styles.createButtonText}>إضافة إعلان جديد</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && (items ?? []).length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جاري تحميل الإعلانات...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>كنز</Text>
          <Text style={styles.headerSubtitle}>السوق المفتوح</Text>
        </View>
        <View style={styles.headerActions}>
          {user && (
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => navigation.navigate("KenzFavorites" as never)}
            >
              <Ionicons name="heart" size={26} color={COLORS.primary} />
            </TouchableOpacity>
          )}
          {isLoggedIn && (
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => navigation.navigate("KenzDeals" as never)}
            >
              <Ionicons name="wallet" size={26} color={COLORS.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.createIconButton}
            onPress={handleCreatePress}
          >
            <Ionicons name="add-circle" size={28} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {renderFilterBar()}
      {renderDropdownModal()}

      <FlatList
        data={items ?? []}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          (items ?? []).length === 0 ? styles.emptyList : styles.list
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Cairo-Bold",
    color: COLORS.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIconButton: {
    padding: 4,
  },
  createIconButton: {
    padding: 4,
  },
  filterBar: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
    height: 42,
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Cairo-Regular",
    paddingVertical: 0,
    color: COLORS.dark,
  },
  selectTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: 100,
    maxWidth: 140,
    height: 42,
    paddingHorizontal: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    gap: 6,
  },
  selectTriggerText: {
    fontSize: 14,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.dark,
  },
  filtersRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  selectChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    gap: 6,
    maxWidth: 130,
  },
  selectChipLabel: {
    fontSize: 11,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
  },
  selectChipValue: {
    fontSize: 13,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.dark,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalBox: {
    width: "100%",
    maxWidth: 360,
    maxHeight: "70%",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Cairo-Bold",
    color: COLORS.dark,
    marginBottom: 12,
    textAlign: "center",
  },
  modalScroll: {
    maxHeight: 320,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalOptionText: {
    fontSize: 15,
    fontFamily: "Cairo-Regular",
    color: COLORS.dark,
  },
  modalCloseBtn: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
  },
  modalCloseText: {
    fontSize: 15,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.dark,
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Cairo-Bold",
    color: COLORS.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    fontFamily: "Cairo-SemiBold",
    color: COLORS.white,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
  },
  footer: {
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
  },
});

export default KenzListScreen;
