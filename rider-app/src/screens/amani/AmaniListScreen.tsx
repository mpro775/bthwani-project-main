import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  getAvailableAmaniOrders,
  getMyAmaniOrders,
  acceptAmaniOrder,
  AmaniOrder,
} from "../../api/amani";
import { useAmaniDriverSocket } from "../../hooks/useAmaniDriverSocket";

export default function AmaniListScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"available" | "my">("available");
  const [availableOrders, setAvailableOrders] = useState<AmaniOrder[]>([]);
  const [myOrders, setMyOrders] = useState<AmaniOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMyOrders = useCallback(async () => {
    try {
      const orders = await getMyAmaniOrders();
      setMyOrders(Array.isArray(orders) ? orders : []);
    } catch (error: any) {
      console.error("Error loading my orders:", error);
      const msg =
        error?.response?.data?.userMessage ?? error?.response?.data?.message;
      if (
        error?.response?.status === 401 ||
        error?.response?.status === 403 ||
        msg?.includes("تسجيل الدخول")
      ) {
        Alert.alert(
          "يجب تسجيل الدخول",
          "يرجى تسجيل الدخول كسائقة للوصول لطلبات أماني"
        );
      } else {
        Alert.alert("خطأ", msg ?? "فشل في تحميل طلباتي");
      }
    }
  }, []);

  // WebSocket: استماع لتعيينات جديدة وعرض إشعار
  useAmaniDriverSocket({
    onNewAssignment: (data) => {
      loadMyOrders(); // تحديث قائمة طلباتي
      if (Platform.OS !== "web") {
        Alert.alert("طلب جديد", "تم تعيينك لطلب نقل نسائي جديد", [
          { text: "عرض الطلبات", onPress: () => setActiveTab("my") },
          {
            text: "فتح الطلب",
            onPress: () => router.push(`/amani/${data.amaniId}`),
          },
        ]);
      }
    },
  });

  const loadAvailableOrders = useCallback(async () => {
    try {
      const response = await getAvailableAmaniOrders();
      setAvailableOrders(response.items ?? []);
    } catch (error: any) {
      console.error("Error loading available orders:", error);
      const msg =
        error?.response?.data?.userMessage ?? error?.response?.data?.message;
      if (error?.response?.status === 401 || msg?.includes("تسجيل الدخول")) {
        Alert.alert(
          "يجب تسجيل الدخول",
          "يرجى تسجيل الدخول كسائقة للوصول لطلبات أماني"
        );
      } else {
        Alert.alert("خطأ", msg ?? "فشل في تحميل الطلبات المتاحة");
      }
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadAvailableOrders(), loadMyOrders()]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadAvailableOrders, loadMyOrders]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleAcceptOrder = async (orderId: string) => {
    Alert.alert("قبول الطلب", "هل أنت متأكد من قبول هذا الطلب؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "قبول",
        onPress: async () => {
          try {
            await acceptAmaniOrder(orderId);
            Alert.alert("نجح", "تم قبول الطلب بنجاح");
            loadData();
          } catch (error: any) {
            const msg =
              error?.response?.data?.userMessage ??
              error?.response?.data?.message;
            Alert.alert("خطأ", msg ?? "فشل في قبول الطلب");
          }
        },
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#f59e0b";
      case "confirmed":
        return "#3b82f6";
      case "in_progress":
        return "#8b5cf6";
      case "completed":
        return "#10b981";
      case "cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "في الانتظار";
      case "confirmed":
        return "مؤكد";
      case "in_progress":
        return "قيد التنفيذ";
      case "completed":
        return "مكتمل";
      case "cancelled":
        return "ملغي";
      default:
        return status;
    }
  };

  const renderOrderItem = ({ item }: { item: AmaniOrder }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push(`/amani/${item._id}`)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.badgesRow}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
          {item.metadata?.womenOnly && (
            <View style={[styles.statusBadge, styles.womenOnlyBadge]}>
              <Ionicons name="woman" size={12} color="#fff" />
              <Text style={[styles.statusText, { marginLeft: 4 }]}>سائقة</Text>
            </View>
          )}
        </View>
      </View>

      {item.description && (
        <Text style={styles.orderDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      {item.origin && (
        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color="#3b82f6" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.origin.address}
          </Text>
        </View>
      )}

      {item.destination && (
        <View style={styles.locationRow}>
          <Ionicons name="navigate" size={16} color="#10b981" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.destination.address}
          </Text>
        </View>
      )}

      {item.metadata?.passengers && (
        <View style={styles.metadataRow}>
          <Ionicons name="people" size={16} color="#6b7280" />
          <Text style={styles.metadataText}>
            {item.metadata.passengers} أشخاص
          </Text>
        </View>
      )}

      {activeTab === "available" && (
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptOrder(item._id)}
        >
          <Text style={styles.acceptButtonText}>قبول الطلب</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  const currentOrders = activeTab === "available" ? availableOrders : myOrders;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>طلبات أماني</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "available" && styles.tabActive]}
          onPress={() => setActiveTab("available")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "available" && styles.tabTextActive,
            ]}
          >
            متاحة ({availableOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "my" && styles.tabActive]}
          onPress={() => setActiveTab("my")}
        >
          <Text
            style={[styles.tabText, activeTab === "my" && styles.tabTextActive]}
          >
            طلباتي ({myOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={currentOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>
              {activeTab === "available"
                ? "لا توجد طلبات متاحة حالياً"
                : "لا توجد طلبات معينة لك"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#6b7280",
  },
  header: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#3b82f6",
  },
  tabText: {
    fontSize: 16,
    color: "#6b7280",
  },
  tabTextActive: {
    color: "#3b82f6",
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  womenOnlyBadge: {
    backgroundColor: "#8b5cf6",
    marginLeft: 6,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  orderDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 8,
    flex: 1,
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  metadataText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 8,
  },
  acceptButton: {
    backgroundColor: "#10b981",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  acceptButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 16,
  },
});
