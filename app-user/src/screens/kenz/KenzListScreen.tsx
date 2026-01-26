import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { RootStackParamList } from "@/types/navigation";
import { KenzItem, KenzListResponse, KenzCategory, KENZ_CATEGORIES } from "@/types/types";
import { getKenzList } from "@/api/kenzApi";
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
  const [selectedCategory, setSelectedCategory] = useState<KenzCategory | undefined>();

  const loadItems = useCallback(async (cursor?: string, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else if (!cursor) {
        setLoading(true);
      }

      const response: KenzListResponse = await getKenzList(cursor, selectedCategory);

      if (isLoadMore) {
        setItems(prev => [...prev, ...response.items]);
      } else {
        setItems(response.items);
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
  }, [selectedCategory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadItems();
  }, [loadItems]);

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore && nextCursor) {
      loadItems(nextCursor, true);
    }
  }, [hasMore, loadingMore, nextCursor, loadItems]);

  const handleItemPress = useCallback((item: KenzItem) => {
    navigation.navigate("KenzDetails", { itemId: item._id });
  }, [navigation]);

  const handleCreatePress = useCallback(() => {
    navigation.navigate("KenzCreate");
  }, [navigation]);

  const handleCategoryChange = useCallback((category: KenzCategory | undefined) => {
    setSelectedCategory(category);
    setItems([]);
    setNextCursor(undefined);
    setHasMore(true);
    loadItems(undefined, false);
  }, [loadItems]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const renderCategoryFilter = () => (
    <View style={styles.categoryFilter}>
      <TouchableOpacity
        style={[styles.categoryButton, !selectedCategory && styles.categoryButtonActive]}
        onPress={() => handleCategoryChange(undefined)}
      >
        <Text style={[styles.categoryText, !selectedCategory && styles.categoryTextActive]}>
          الكل
        </Text>
      </TouchableOpacity>
      {KENZ_CATEGORIES.slice(0, 4).map((category) => (
        <TouchableOpacity
          key={category}
          style={[styles.categoryButton, selectedCategory === category && styles.categoryButtonActive]}
          onPress={() => handleCategoryChange(category)}
        >
          <Text style={[styles.categoryText, selectedCategory === category && styles.categoryTextActive]}>
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderItem = ({ item }: { item: KenzItem }) => (
    <KenzCard
      item={item}
      onPress={() => handleItemPress(item)}
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

  if (loading && items.length === 0) {
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
        <TouchableOpacity
          style={styles.createIconButton}
          onPress={handleCreatePress}
        >
          <Ionicons name="add-circle" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {renderCategoryFilter()}

      <FlatList
        data={items}
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
        contentContainerStyle={items.length === 0 ? styles.emptyList : styles.list}
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
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
  },
  createIconButton: {
    padding: 4,
  },
  categoryFilter: {
    flexDirection: 'row',
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
    color: COLORS.gray,
  },
  categoryTextActive: {
    color: COLORS.white,
    fontWeight: '600',
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
    fontWeight: "bold",
    color: COLORS.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
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
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
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
    color: COLORS.gray,
  },
});

export default KenzListScreen;
