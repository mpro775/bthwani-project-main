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
import { Es3afniItem, Es3afniListResponse } from "@/types/types";
import { getEs3afniList } from "@/api/es3afniApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";
import Es3afniCard from "@/components/es3afni/Es3afniCard";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Es3afniList">;

const Es3afniListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [items, setItems] = useState<Es3afniItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadItems = useCallback(async (cursor?: string, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else if (!cursor) {
        setLoading(true);
      }

      const response: Es3afniListResponse = await getEs3afniList(cursor);
      const list = response?.items ?? [];

      if (isLoadMore) {
        setItems(prev => [...prev, ...list]);
      } else {
        setItems(list);
      }

      setNextCursor(response.nextCursor);
      setHasMore(!!response.nextCursor);

    } catch (error) {
      console.error("خطأ في تحميل طلبات التبرع:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadItems();
  }, [loadItems]);

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore && nextCursor) {
      loadItems(nextCursor, true);
    }
  }, [hasMore, loadingMore, nextCursor, loadItems]);

  const handleItemPress = useCallback((item: Es3afniItem) => {
    navigation.navigate("Es3afniDetails", { itemId: item._id });
  }, [navigation]);

  const handleCreatePress = useCallback(() => {
    navigation.navigate("Es3afniCreate");
  }, [navigation]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const renderItem = ({ item }: { item: Es3afniItem }) => (
    <Es3afniCard
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
        <Ionicons name="water" size={64} color={COLORS.gray} />
        <Text style={styles.emptyTitle}>لا توجد طلبات تبرع</Text>
        <Text style={styles.emptySubtitle}>
          لا توجد طلبات تبرع بالدم في الوقت الحالي
        </Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreatePress}
        >
          <Text style={styles.createButtonText}>إنشاء طلب تبرع</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && (items?.length ?? 0) === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جاري تحميل طلبات التبرع...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>اسعفني</Text>
          <Text style={styles.headerSubtitle}>شبكة تبرع بالدم عاجلة</Text>
        </View>
        <TouchableOpacity
          style={styles.createIconButton}
          onPress={handleCreatePress}
        >
          <Ionicons name="add-circle" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

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
        contentContainerStyle={(items?.length ?? 0) === 0 ? styles.emptyList : styles.list}
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
  createIconButton: {
    padding: 4,
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

export default Es3afniListScreen;
