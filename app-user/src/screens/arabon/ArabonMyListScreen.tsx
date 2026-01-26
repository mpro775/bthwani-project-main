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
import { ArabonItem } from "@/types/types";
import { getMyArabon, getArabonStats, type ArabonListResponse, type ArabonStats } from "@/api/arabonApi";
import COLORS from "@/constants/colors";
import ArabonCard from "@/components/arabon/ArabonCard";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "ArabonMyList">;

const ArabonMyListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [items, setItems] = useState<ArabonItem[]>([]);
  const [stats, setStats] = useState<ArabonStats | null>(null);
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

      const [listRes, statsRes]: [ArabonListResponse, ArabonStats] = await Promise.all([
        getMyArabon(cursor),
        getArabonStats("my"),
      ]);

      if (isLoadMore) {
        setItems((prev) => [...prev, ...listRes.data]);
      } else {
        setItems(listRes.data);
      }
      setStats(statsRes);
      setNextCursor(listRes.nextCursor);
      setHasMore(listRes.hasMore);
    } catch (error) {
      console.error("خطأ في تحميل عربوناتي:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadItems();
  }, [loadItems]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && nextCursor && !loadingMore) {
      loadItems(nextCursor, true);
    }
  }, [hasMore, nextCursor, loadingMore, loadItems]);

  const renderItem = ({ item }: { item: ArabonItem }) => (
    <ArabonCard
      item={item}
      onPress={() => navigation.navigate("ArabonDetails", { itemId: item._id })}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="wallet-outline" size={64} color={COLORS.gray} />
      <Text style={styles.emptyTitle}>لا توجد عربونات خاصة بك</Text>
      <Text style={styles.emptySubtitle}>
        أضف عربوناً جديداً من القائمة الرئيسية
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate("ArabonList")}
      >
        <Text style={styles.emptyButtonText}>العودة للقائمة</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.footerText}>جاري التحميل...</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جاري تحميل عربوناتك...</Text>
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
        <Text style={styles.headerTitle}>عربوناتي</Text>
        <View style={styles.headerSpacer} />
      </View>

      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>المجموع</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>في الانتظار</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalDepositAmount.toFixed(0)}</Text>
            <Text style={styles.statLabel}>إجمالي ريال</Text>
          </View>
        </View>
      )}

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textLight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { padding: 8 },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
  headerSpacer: { width: 40 },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.lightGray ?? "#f5f5f5",
    borderRadius: 12,
  },
  statItem: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 18, fontWeight: "bold", color: COLORS.primary },
  statLabel: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: COLORS.border },
  listContainer: { padding: 16 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 32,
  },
  emptyButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  emptyButtonText: { color: COLORS.white, fontSize: 16, fontWeight: "600" },
  footerLoader: { paddingVertical: 16, alignItems: "center" },
  footerText: { fontSize: 14, color: COLORS.textLight, marginTop: 8 },
});

export default ArabonMyListScreen;
