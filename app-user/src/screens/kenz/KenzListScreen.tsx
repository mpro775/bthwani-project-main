import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TextInput,
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
  const { user } = useAuth();
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
    KENZ_CATEGORIES as unknown as string[]
  );
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    getKenzCategoriesTree()
      .then((tree) => {
        const flatten = (
          list: { nameAr: string; children?: unknown[] }[]
        ): string[] => {
          const out: string[] = [];
          for (const node of list) {
            out.push(node.nameAr);
            if (node.children?.length)
              out.push(
                ...flatten(
                  node.children as { nameAr: string; children?: unknown[] }[]
                )
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
    [favoritedIds]
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
          selectedDeliveryOption
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
    ]
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
    [navigation]
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
    [loadItems]
  );

  const handleCityChange = useCallback(
    (city: KenzYemenCity | undefined) => {
      setSelectedCity(city);
      setItems([]);
      setNextCursor(undefined);
      setHasMore(true);
      loadItems(undefined, false);
    },
    [loadItems]
  );

  const handleConditionChange = useCallback(
    (condition: KenzCondition | undefined) => {
      setSelectedCondition(condition);
      setItems([]);
      setNextCursor(undefined);
      setHasMore(true);
      loadItems(undefined, false);
    },
    [loadItems]
  );

  const handleDeliveryOptionChange = useCallback(
    (deliveryOption: KenzDeliveryOption | undefined) => {
      setSelectedDeliveryOption(deliveryOption);
      setItems([]);
      setNextCursor(undefined);
      setHasMore(true);
      loadItems(undefined, false);
    },
    [loadItems]
  );

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const renderCategoryFilter = () => (
    <View style={styles.categoryFilter}>
      <TouchableOpacity
        style={[
          styles.categoryButton,
          !selectedCategory && styles.categoryButtonActive,
        ]}
        onPress={() => handleCategoryChange(undefined)}
      >
        <Text
          style={[
            styles.categoryText,
            !selectedCategory && styles.categoryTextActive,
          ]}
        >
          الكل
        </Text>
      </TouchableOpacity>
      {categoryOptions.slice(0, 6).map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryButton,
            selectedCategory === category && styles.categoryButtonActive,
          ]}
          onPress={() => handleCategoryChange(category as KenzCategory)}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === category && styles.categoryTextActive,
            ]}
          >
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const CONDITION_OPTIONS: { value: KenzCondition; label: string }[] = [
    { value: "new", label: "جديد" },
    { value: "used", label: "مستعمل" },
    { value: "refurbished", label: "مجدد" },
  ];

  const renderConditionFilter = () => (
    <View style={styles.cityFilter}>
      <TouchableOpacity
        style={[
          styles.cityButton,
          !selectedCondition && styles.cityButtonActive,
        ]}
        onPress={() => handleConditionChange(undefined)}
      >
        <Text
          style={[
            styles.cityButtonText,
            !selectedCondition && styles.cityButtonTextActive,
          ]}
        >
          كل الحالات
        </Text>
      </TouchableOpacity>
      {CONDITION_OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[
            styles.cityButton,
            selectedCondition === opt.value && styles.cityButtonActive,
          ]}
          onPress={() => handleConditionChange(opt.value)}
        >
          <Text
            style={[
              styles.cityButtonText,
              selectedCondition === opt.value && styles.cityButtonTextActive,
            ]}
          >
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const DELIVERY_OPTIONS: { value: KenzDeliveryOption; label: string }[] = [
    { value: "meetup", label: "لقاء" },
    { value: "delivery", label: "توصيل" },
    { value: "both", label: "لقاء وتوصيل" },
  ];

  const renderDeliveryOptionFilter = () => (
    <View style={styles.cityFilter}>
      <TouchableOpacity
        style={[
          styles.cityButton,
          !selectedDeliveryOption && styles.cityButtonActive,
        ]}
        onPress={() => handleDeliveryOptionChange(undefined)}
      >
        <Text
          style={[
            styles.cityButtonText,
            !selectedDeliveryOption && styles.cityButtonTextActive,
          ]}
        >
          الكل
        </Text>
      </TouchableOpacity>
      {DELIVERY_OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[
            styles.cityButton,
            selectedDeliveryOption === opt.value && styles.cityButtonActive,
          ]}
          onPress={() => handleDeliveryOptionChange(opt.value)}
        >
          <Text
            style={[
              styles.cityButtonText,
              selectedDeliveryOption === opt.value &&
                styles.cityButtonTextActive,
            ]}
          >
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCityFilter = () => (
    <View style={styles.cityFilter}>
      <TouchableOpacity
        style={[styles.cityButton, !selectedCity && styles.cityButtonActive]}
        onPress={() => handleCityChange(undefined)}
      >
        <Text
          style={[
            styles.cityButtonText,
            !selectedCity && styles.cityButtonTextActive,
          ]}
        >
          كل المدن
        </Text>
      </TouchableOpacity>
      {KENZ_YEMEN_CITIES.slice(0, 5).map((city) => (
        <TouchableOpacity
          key={city}
          style={[
            styles.cityButton,
            selectedCity === city && styles.cityButtonActive,
          ]}
          onPress={() => handleCityChange(city)}
        >
          <Text
            style={[
              styles.cityButtonText,
              selectedCity === city && styles.cityButtonTextActive,
            ]}
          >
            {city}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const SORT_OPTIONS: { value: KenzSortOption; label: string }[] = [
    { value: "newest", label: "الأحدث" },
    { value: "price_asc", label: "السعر ↑" },
    { value: "price_desc", label: "السعر ↓" },
    { value: "views_desc", label: "المشاهدات" },
  ];

  const renderSearchAndSort = () => (
    <View style={styles.searchSortRow}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={COLORS.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="بحث..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => {
            setItems([]);
            setNextCursor(undefined);
            setHasMore(true);
            loadItems(undefined, false);
          }}
          returnKeyType="search"
        />
      </View>
      <View style={styles.sortRow}>
        {SORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.sortChip,
              sortOption === opt.value && styles.sortChipActive,
            ]}
            onPress={() => {
              setSortOption(opt.value);
              setItems([]);
              setNextCursor(undefined);
              setHasMore(true);
              loadItems(undefined, false);
            }}
          >
            <Text
              style={[
                styles.sortChipText,
                sortOption === opt.value && styles.sortChipTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

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
          <TouchableOpacity
            style={styles.createIconButton}
            onPress={handleCreatePress}
          >
            <Ionicons name="add-circle" size={28} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {renderCategoryFilter()}
      {renderConditionFilter()}
      {renderDeliveryOptionFilter()}
      {renderCityFilter()}
      {renderSearchAndSort()}

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
  categoryFilter: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
  },
  categoryTextActive: {
    fontFamily: "Cairo-SemiBold",
    color: COLORS.white,
  },
  cityFilter: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  cityButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  cityButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  cityButtonText: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
  },
  cityButtonTextActive: {
    fontFamily: "Cairo-SemiBold",
    color: COLORS.white,
  },
  searchSortRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    gap: 8,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 120,
    height: 40,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    paddingVertical: 0,
  },
  sortRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  sortChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sortChipText: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
  },
  sortChipTextActive: {
    fontFamily: "Cairo-SemiBold",
    color: COLORS.white,
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
