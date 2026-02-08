import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { RootStackParamList } from "@/types/navigation";
import { ArabonItem, ArabonListResponse } from "@/types/types";
import { getArabonList, type ArabonStatus } from "@/api/arabonApi";
import COLORS from "@/constants/colors";
import ArabonCard from "@/components/arabon/ArabonCard";

const STATUS_FILTERS: { key: ArabonStatus | ""; label: string }[] = [
  { key: "", label: "الكل" },
  { key: "draft", label: "مسودة" },
  { key: "pending", label: "في الانتظار" },
  { key: "confirmed", label: "مؤكد" },
  { key: "completed", label: "مكتمل" },
  { key: "cancelled", label: "ملغي" },
];

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ArabonList"
>;

const ArabonListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [items, setItems] = useState<ArabonItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<ArabonStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadItems = useCallback(
    async (cursor?: string, isLoadMore = false) => {
      try {
        if (isLoadMore) {
          setLoadingMore(true);
        } else if (!cursor) {
          setLoading(true);
        }

        const response: ArabonListResponse = await getArabonList(
          cursor,
          statusFilter || undefined
        );

        if (isLoadMore) {
          setItems((prev) => [...prev, ...response.data]);
        } else {
          setItems(response.data);
        }

        setNextCursor(response.nextCursor);
        setHasMore(response.hasMore);
      } catch (error) {
        console.error("خطأ في تحميل العربونات:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [statusFilter]
  );

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

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
      <Ionicons name="cash-outline" size={64} color={COLORS.gray} />
      <Text style={styles.emptyTitle}>لا توجد عربونات</Text>
      <Text style={styles.emptySubtitle}>
        لا توجد عروض أو حجوزات بعربون في الوقت الحالي
      </Text>
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

  const getStats = () => {
    const total = items.length;
    const completed = items.filter(
      (item) => item.status === "completed"
    ).length;
    const pending = items.filter((item) => item.status === "pending").length;
    const totalAmount = items.reduce(
      (sum, item) => sum + (item.depositAmount || 0),
      0
    );

    return { total, completed, pending, totalAmount };
  };

  const stats = getStats();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جاري تحميل العربونات...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>العربون</Text>
        <Text style={styles.headerSubtitle}>العروض والحجوزات بعربون</Text>

        {/* أزرار عربوناتي / بحث */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("ArabonMyList")}
          >
            <Ionicons name="person-outline" size={18} color={COLORS.primary} />
            <Text style={styles.secondaryButtonText}>عربوناتي</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("ArabonMyBookings")}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color={COLORS.primary}
            />
            <Text style={styles.secondaryButtonText}>حجوزاتي</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("ArabonSearch")}
          >
            <Ionicons name="search-outline" size={18} color={COLORS.primary} />
            <Text style={styles.secondaryButtonText}>بحث</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("ArabonCreate")}
          >
            <Ionicons name="add" size={20} color={COLORS.white} />
            <Text style={styles.addButtonText}>إضافة عربون</Text>
          </TouchableOpacity>
        </View>

        {/* فلتر الحالة */}
        <View style={styles.filterRow}>
          {STATUS_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key || "all"}
              style={[
                styles.filterChip,
                statusFilter === f.key && styles.filterChipActive,
              ]}
              onPress={() => setStatusFilter(f.key as ArabonStatus | "")}
            >
              <Text
                style={[
                  styles.filterChipText,
                  statusFilter === f.key && styles.filterChipTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* إحصائيات سريعة */}
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
            <Text style={styles.statValue}>
              {(stats.totalAmount ?? 0).toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>إجمالي ريال</Text>
          </View>
        </View>
      </View>

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
    fontFamily: "Cairo-Regular",
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Cairo-Bold",
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.textLight,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
    alignItems: "center",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontFamily: "Cairo-SemiBold",
    marginLeft: 6,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: "Cairo-SemiBold",
    marginLeft: 8,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  filterChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightBlue,
  },
  filterChipText: {
    fontSize: 13,
    fontFamily: "Cairo-Regular",
    color: COLORS.text,
  },
  filterChipTextActive: {
    color: COLORS.primary,
    fontFamily: "Cairo-SemiBold",
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 32,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.textLight,
    marginTop: 8,
  },
});

export default ArabonListScreen;
