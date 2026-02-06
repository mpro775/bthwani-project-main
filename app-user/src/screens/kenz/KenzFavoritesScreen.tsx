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
import { KenzItem, KenzListResponse } from "@/types/types";
import {
  getKenzFavorites,
  addKenzFavorite,
  removeKenzFavorite,
} from "@/api/kenzApi";
import COLORS from "@/constants/colors";
import KenzCard from "@/components/kenz/KenzCard";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "KenzFavorites"
>;

const KenzFavoritesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [items, setItems] = useState<KenzItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());

  const loadItems = useCallback(async (cursor?: string, isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);
      const response: KenzListResponse = await getKenzFavorites(cursor);
      const list = response?.items ?? [];
      if (isLoadMore) {
        setItems((prev) => [...prev, ...list]);
      } else {
        setItems(list);
        setFavoritedIds(new Set(list.map((i) => i._id)));
      }
      setNextCursor(response.nextCursor);
      setHasMore(!!response.nextCursor);
    } catch (error) {
      console.error("خطأ في تحميل المفضلة:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadItems();
  }, [loadItems]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && nextCursor) {
      loadItems(nextCursor, true);
    }
  }, [loadingMore, hasMore, nextCursor, loadItems]);

  const handleItemPress = (item: KenzItem) => {
    navigation.navigate("KenzDetails", { itemId: item._id });
  };

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
      setItems((prev) => prev.filter((i) => i._id !== id));
      try {
        if (isFav) await removeKenzFavorite(id);
        else await addKenzFavorite(id);
      } catch {
        setFavoritedIds((prev) => new Set([...prev, id]));
        setItems((prev) => [...prev, item]);
      }
    },
    [favoritedIds]
  );

  const renderItem = ({ item }: { item: KenzItem }) => (
    <KenzCard
      item={item}
      onPress={() => handleItemPress(item)}
      isFavorited={favoritedIds.has(item._id)}
      onFavoritePress={() => handleFavoriteToggle(item)}
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
        <Ionicons name="heart-outline" size={64} color={COLORS.gray} />
        <Text style={styles.emptyTitle}>لا توجد إعلانات في المفضلة</Text>
        <Text style={styles.emptySubtitle}>
          تصفح الإعلانات وأضف ما يعجبك إلى المفضلة
        </Text>
        <TouchableOpacity
          style={styles.emptyActionButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.emptyActionButtonText}>العودة للقائمة</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && items.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جاري تحميل المفضلة...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>إعلاناتي المفضلة</Text>
          <Text style={styles.headerSubtitle}>الإعلانات التي حفظتها</Text>
        </View>
      </View>

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
        contentContainerStyle={
          items.length === 0 ? styles.emptyList : styles.list
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Cairo-Bold",
    color: COLORS.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.lightText,
    marginTop: 2,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyList: {
    flexGrow: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.lightText,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.text,
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.lightText,
    marginTop: 8,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.lightText,
    marginTop: 12,
  },
  emptyActionButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: COLORS.blue,
    borderRadius: 12,
  },
  emptyActionButtonText: {
    fontSize: 16,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.primary,
  },
});

export default KenzFavoritesScreen;
