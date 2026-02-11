import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";
import {
  MaaroufDeliveryItem,
  getMaaroufDeliveryTasks,
} from "@/api/maarouf";
import { useRouter } from "expo-router";

const MaaroufDeliveriesScreen: React.FC = () => {
  const router = useRouter();
  const [items, setItems] = useState<MaaroufDeliveryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await getMaaroufDeliveryTasks();
      setItems(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Error loading Maarouf deliveries:", error);
      const msg =
        error?.response?.data?.userMessage ??
        error?.response?.data?.message ??
        "فشل في تحميل توصيلات معروف";
      Alert.alert("خطأ", msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(false);
  };

  const renderItem = ({ item }: { item: MaaroufDeliveryItem }) => {
    const pickup =
      (item.metadata as any)?.pickupAddress ||
      (item.metadata as any)?.pickup ||
      "—";
    const dropoff =
      (item.metadata as any)?.dropoffAddress ||
      (item.metadata as any)?.dropoff ||
      "—";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/maarouf/${item._id}`)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          {item.reward && item.reward > 0 && (
            <View style={styles.rewardBadge}>
              <Ionicons name="gift" size={14} color="#fff" />
              <Text style={styles.rewardText}>{item.reward} ر.س</Text>
            </View>
          )}
        </View>

        {item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.routeRow}>
          <View style={styles.routeItem}>
            <Ionicons name="location" size={16} color={COLORS.primary} />
            <Text style={styles.routeLabel} numberOfLines={1}>
              {pickup}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color={COLORS.gray} />
          <View style={styles.routeItem}>
            <Ionicons name="navigate" size={16} color={COLORS.success} />
            <Text style={styles.routeLabel} numberOfLines={1}>
              {dropoff}
            </Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.statusText}>
            الحالة: {item.status === "pending" ? "في الانتظار" : item.status}
          </Text>
          {item.deliveryId && (
            <View style={styles.assignedBadge}>
              <Ionicons name="bicycle" size={14} color="#fff" />
              <Text style={styles.assignedText}>معينة</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جاري تحميل توصيلات معروف...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>توصيلات معروف</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={
          items.length === 0 ? styles.emptyList : styles.listContent
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color={COLORS.gray} />
            <Text style={styles.emptyText}>لا توجد توصيلات حالياً</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Cairo-Bold",
    color: "#212529",
    textAlign: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6c757d",
    fontFamily: "Cairo-Regular",
  },
  listContent: {
    padding: 16,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyContainer: {
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#6c757d",
    fontFamily: "Cairo-Regular",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    color: "#111827",
    marginRight: 8,
  },
  description: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: "#4b5563",
    marginBottom: 8,
  },
  rewardBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  rewardText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 4,
    fontFamily: "Cairo-Bold",
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  routeItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  routeLabel: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Cairo-Regular",
    color: "#374151",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: "#6b7280",
  },
  assignedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.blue,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  assignedText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 4,
    fontFamily: "Cairo-Bold",
  },
});

export default MaaroufDeliveriesScreen;
