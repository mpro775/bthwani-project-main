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
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { RootStackParamList } from "@/types/navigation";
import {
  KawaderApplicationItem,
  KawaderApplicationStatus,
  getMyApplications,
} from "@/api/kawaderApi";
import COLORS from "@/constants/colors";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "KawaderMyApplications"
>;

const STATUS_LABELS: Record<KawaderApplicationStatus, string> = {
  pending: "قيد المراجعة",
  accepted: "مقبول",
  rejected: "مرفوض",
};

const STATUS_COLORS: Record<KawaderApplicationStatus, string> = {
  pending: COLORS.orangeDark,
  accepted: COLORS.success,
  rejected: COLORS.danger,
};

const KawaderMyApplicationsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [items, setItems] = useState<KawaderApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);

  const loadItems = useCallback(async (cursor?: string, isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else if (!cursor) setLoading(true);
      const res = await getMyApplications(cursor, 25);
      const list = res.items ?? [];
      if (isLoadMore) {
        setItems((prev) => [...prev, ...list]);
      } else {
        setItems(list);
      }
      setNextCursor(res.nextCursor ?? undefined);
    } catch (e) {
      console.error("خطأ في تحميل التقديمات:", e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadItems();
  };

  const handleLoadMore = () => {
    if (nextCursor && !loadingMore) loadItems(nextCursor, true);
  };

  const getKawaderId = (item: KawaderApplicationItem) => {
    const k = item.kawaderId;
    return typeof k === "object" && k && "_id" in k
      ? (k as any)._id
      : String(k);
  };

  const renderItem = ({ item }: { item: KawaderApplicationItem }) => {
    const kawader = typeof item.kawaderId === "object" ? item.kawaderId : null;
    const title =
      kawader && "title" in kawader ? (kawader as any).title : "عرض وظيفي";
    const status = (item.status || "pending") as KawaderApplicationStatus;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("KawaderDetails", { itemId: getKawaderId(item) })
        }
      >
        <Text style={styles.cardTitle} numberOfLines={2}>
          {title}
        </Text>
        {item.coverNote ? (
          <Text style={styles.coverNote} numberOfLines={2}>
            {item.coverNote}
          </Text>
        ) : null}
        <View style={styles.cardFooter}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: STATUS_COLORS[status] },
            ]}
          >
            <Text style={styles.statusText}>{STATUS_LABELS[status]}</Text>
          </View>
          <Text style={styles.dateText}>
            {item.createdAt
              ? new Date(item.createdAt).toLocaleDateString("ar-SA")
              : ""}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && items.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جاري تحميل التقديمات...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تقدماتي</Text>
      </View>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="document-text-outline"
              size={56}
              color={COLORS.gray}
            />
            <Text style={styles.emptyTitle}>لا توجد تقديمات</Text>
            <Text style={styles.emptySub}>
              التقديمات التي ترسلها على العروض تظهر هنا
            </Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.textLight },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 8 },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
  listContent: { padding: 16 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  coverNote: { fontSize: 14, color: COLORS.textLight, marginBottom: 12 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: "600", color: COLORS.white },
  dateText: { fontSize: 12, color: COLORS.textLight },
  empty: { alignItems: "center", paddingVertical: 48 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 16,
  },
  emptySub: { fontSize: 14, color: COLORS.textLight, marginTop: 8 },
  footerLoader: { paddingVertical: 16, alignItems: "center" },
});

export default KawaderMyApplicationsScreen;
