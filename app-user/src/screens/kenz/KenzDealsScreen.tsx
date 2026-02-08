import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { RootStackParamList } from "@/types/navigation";
import {
  getMyKenzDeals,
  confirmKenzDealReceived,
  cancelKenzDeal,
  type KenzDealItem,
  type KenzDealStatus,
} from "@/api/kenzApi";
import COLORS from "@/constants/colors";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "KenzDeals"
>;

const statusLabels: Record<KenzDealStatus, string> = {
  pending: "قيد الانتظار",
  completed: "مكتملة",
  cancelled: "ملغاة",
};

const KenzDealsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [items, setItems] = useState<KenzDealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const nextCursorRef = useRef<string | null>(null);
  nextCursorRef.current = nextCursor;
  const [loadingMore, setLoadingMore] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<"buyer" | "seller" | "">("");

  const loadItems = useCallback(
    async (loadMore = false) => {
      try {
        if (loadMore) setLoadingMore(true);
        else setLoading(true);
        const params: { cursor?: string; role?: "buyer" | "seller" } = {};
        if (roleFilter) params.role = roleFilter;
        if (loadMore && nextCursorRef.current)
          params.cursor = nextCursorRef.current;
        const res = await getMyKenzDeals(params);
        const list = res?.items ?? [];
        if (loadMore) {
          setItems((prev) => [...prev, ...list]);
        } else {
          setItems(list);
        }
        setNextCursor(res?.nextCursor ?? null);
      } catch (error) {
        console.error("خطأ في تحميل الصفقات:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [roleFilter]
  );

  useEffect(() => {
    setNextCursor(null);
    loadItems();
  }, [roleFilter, loadItems]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadItems();
  }, [loadItems]);

  const getKenzId = (item: KenzDealItem) =>
    typeof item.kenzId === "object" &&
    item.kenzId !== null &&
    "_id" in item.kenzId
      ? (item.kenzId as { _id: string })._id
      : String(item.kenzId);

  const getKenzTitle = (item: KenzDealItem) =>
    typeof item.kenzId === "object" &&
    item.kenzId !== null &&
    "title" in item.kenzId
      ? (item.kenzId as { title?: string }).title || "—"
      : "—";

  const handleConfirm = async (dealId: string) => {
    setActioningId(dealId);
    try {
      await confirmKenzDealReceived(dealId);
      loadItems();
    } catch (e: any) {
      Alert.alert(
        "خطأ",
        e?.response?.data?.userMessage || e?.message || "فشل في التأكيد"
      );
    } finally {
      setActioningId(null);
    }
  };

  const handleCancel = async (dealId: string) => {
    setActioningId(dealId);
    try {
      await cancelKenzDeal(dealId);
      loadItems();
    } catch (e: any) {
      Alert.alert(
        "خطأ",
        e?.response?.data?.userMessage || e?.message || "فشل في الإلغاء"
      );
    } finally {
      setActioningId(null);
    }
  };

  const renderItem = ({ item }: { item: KenzDealItem }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{getKenzTitle(item)}</Text>
        <View
          style={[
            styles.statusBadge,
            item.status === "pending" && styles.statusPending,
            item.status === "completed" && styles.statusCompleted,
          ]}
        >
          <Text style={styles.statusText}>{statusLabels[item.status]}</Text>
        </View>
      </View>
      <Text style={styles.amountText}>
        {item.amount.toLocaleString("ar-SA")} ر.ي
      </Text>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() =>
            navigation.navigate("KenzDetails", { itemId: getKenzId(item) })
          }
        >
          <Text style={styles.viewButtonText}>عرض الإعلان</Text>
        </TouchableOpacity>
        {item.status === "pending" && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => handleConfirm(item._id)}
              disabled={actioningId === item._id}
            >
              {actioningId === item._id ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.actionButtonText}>تم الاستلام</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleCancel(item._id)}
              disabled={actioningId === item._id}
            >
              <Text style={styles.actionButtonText}>إلغاء</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="wallet-outline" size={64} color={COLORS.gray} />
        <Text style={styles.emptyTitle}>لا توجد صفقات إيكرو</Text>
        <TouchableOpacity
          style={styles.emptyActionButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.emptyActionButtonText}>العودة</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            roleFilter === "" && styles.filterChipActive,
          ]}
          onPress={() => setRoleFilter("")}
        >
          <Text
            style={[
              styles.filterChipText,
              roleFilter === "" && styles.filterChipTextActive,
            ]}
          >
            الكل
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            roleFilter === "buyer" && styles.filterChipActive,
          ]}
          onPress={() => setRoleFilter("buyer")}
        >
          <Text
            style={[
              styles.filterChipText,
              roleFilter === "buyer" && styles.filterChipTextActive,
            ]}
          >
            كمشتري
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            roleFilter === "seller" && styles.filterChipActive,
          ]}
          onPress={() => setRoleFilter("seller")}
        >
          <Text
            style={[
              styles.filterChipText,
              roleFilter === "seller" && styles.filterChipTextActive,
            ]}
          >
            كبائع
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={
          items.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={() => {
          if (!loadingMore && nextCursor) loadItems(true);
        }}
        onEndReachedThreshold={0.3}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  filterRow: { flexDirection: "row", padding: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
  },
  filterChipActive: { backgroundColor: COLORS.primary },
  filterChipText: { fontSize: 14, color: COLORS.text },
  filterChipTextActive: { color: COLORS.white },
  list: { padding: 12, paddingBottom: 24 },
  emptyList: { flex: 1 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: { fontSize: 16, fontFamily: "Cairo-SemiBold", flex: 1 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.gray,
  },
  statusPending: { backgroundColor: "#f59e0b" },
  statusCompleted: { backgroundColor: "#22c55e" },
  statusText: { fontSize: 12, color: COLORS.white },
  amountText: {
    fontSize: 18,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.primary,
    marginBottom: 12,
  },
  cardActions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  viewButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  viewButtonText: { fontSize: 14, color: COLORS.primary },
  actionButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  confirmButton: { backgroundColor: "#22c55e" },
  cancelButton: { backgroundColor: COLORS.error ?? "#ef4444" },
  actionButtonText: {
    fontSize: 14,
    color: COLORS.white,
    fontFamily: "Cairo-SemiBold",
  },
  footer: { padding: 16, alignItems: "center" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Cairo-SemiBold",
    marginTop: 16,
    marginBottom: 24,
  },
  emptyActionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyActionButtonText: { color: COLORS.white, fontFamily: "Cairo-SemiBold" },
});

export default KenzDealsScreen;
