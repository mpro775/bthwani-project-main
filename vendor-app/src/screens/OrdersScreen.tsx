import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import axiosInstance from "../api/axiosInstance";
import { exportToExcel } from "../components/export-exel";
import { useUser } from "../hooks/userContext";
const { width } = Dimensions.get("window");
const STATUS_FILTERS = [
  { key: "all", label: "الكل" },
  { key: "pending_confirmation", label: "بانتظار التأكيد" },
  { key: "under_review", label: "قيد المراجعة" },
  { key: "preparing", label: "قيد التحضير" },
  { key: "out_for_delivery", label: "في الطريق" },
  { key: "delivered", label: "تم التوصيل" },
  { key: "cancelled", label: "ملغي" },
];
type Order = {
  _id: string;
  status: string;
  [key: string]: any;
};

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../AppNavigator";
import { COLORS } from "../constants/colors";

const OrdersScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [hasMoreOrders, setHasMoreOrders] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const filteredOrders = orders.filter((order) => {
    const statusOk = filterStatus === "all" || order.status === filterStatus;
    const searchOk =
      search === "" ||
      order._id.toLowerCase().includes(search.toLowerCase()) ||
      (order.customer?.name &&
        order.customer.name.toLowerCase().includes(search.toLowerCase())) ||
      (order.customer?.phone && order.customer.phone.includes(search)) ||
      getStatusText(order.status).includes(search);

    return statusOk && searchOk;
  });

  const paginatedOrders = filteredOrders.slice(0, page * 10);
  const calculatedHasMoreOrders = filteredOrders.length > page * 10;
  const insets = useSafeAreaInsets();

  const fetchOrders = useCallback(async () => {
 
    try {
      const res = await axiosInstance.get("/delivery/order/vendor/orders");
      const data = res.data?.data || res.data || [];
      setOrders(data);
      setLoading(false);
      setRefreshing(false);
      setHasMoreOrders(true);
      setPage(1);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

// بدّل هذه الدالة
const updateStatus = async (id: string, status: "preparing" | "cancelled") => {
  try {
    if (status === "preparing") {
      // القبول = vendor-accept (لا يحتاج body)
      await axiosInstance.post(`/delivery/order/${id}/vendor-accept`);
    } else if (status === "cancelled") {
      // وفّر مسار إلغاء للتاجر (إن لم يكن موجوداً، أضِفه في الباك)
      await axiosInstance.post(`/delivery/order/${id}/vendor-cancel`, {
        reason: "Cancelled by vendor",
      });
    }
    fetchOrders();
  } catch (error) {
    console.error("Error updating order status:", error);
  }
};


  const loadMoreOrders = () => {
    if (!isLoadingMore && calculatedHasMoreOrders) {
      setIsLoadingMore(true);
      setPage((prev) => prev + 1);
      setTimeout(() => setIsLoadingMore(false), 500);
    }
  };
  const { user } = useUser();

  useEffect(() => {
    console.log("USER DATA IN SCREEN:", user);
  }, []);
  useEffect(() => {
    fetchOrders();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, [fetchOrders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_confirmation":
        return "#FF9800"; // برتقالي
      case "under_review":
        return "#2196F3";
      case "preparing":
        return "#007AFF";
      case "out_for_delivery":
        return "#4CAF50";
      case "delivered":
        return "#4CAF50";
      case "cancelled":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending_confirmation":
      case "new":
        return "time-outline";
      case "under_review":
        return "restaurant-outline";
      case "preparing":
        return "checkmark-circle-outline";
      case "cancelled":
        return "close-circle-outline";
      default:
        return "help-circle-outline";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending_confirmation":
        return "بانتظار التأكيد";
      case "under_review":
        return "قيد المراجعة";
      case "preparing":
        return "قيد التحضير";
      case "out_for_delivery":
        return "في الطريق";
      case "delivered":
        return "تم التوصيل";
      case "returned":
        return "تم الإرجاع";
      case "cancelled":
        return "ملغي";
      default:
        return status;
    }
  };

  const sortedOrders = [...filteredOrders].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
  );

  const renderItem = ({ item, index }: any) => {
    const itemAnim = new Animated.Value(0);

    Animated.timing(itemAnim, {
      toValue: 1,
      duration: 500,
      delay: index * 100,
      useNativeDriver: true,
    }).start();

    const currentStatus = item.status || item.subOrders?.[0]?.status;
    const statusColor = getStatusColor(currentStatus);

    return (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity: itemAnim,
            transform: [
              {
                translateY: itemAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            navigation.navigate("OrderDetails", { order: item });
          }}
        >
          <LinearGradient colors={["#FFFFFF", "#F8F9FA"]} style={styles.card}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderId}>#{item._id.slice(-6)}</Text>
                <Text style={styles.orderDate}>
                  {new Date(item.createdAt).toLocaleDateString("ar-SA")}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColor + "20" },
                ]}
              >
                <Ionicons
                  name={getStatusIcon(currentStatus)}
                  size={18}
                  color={statusColor}
                />
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {getStatusText(currentStatus)}
                </Text>
              </View>
            </View>

            {/* Content */}
            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <MaterialIcons name="shopping-bag" size={20} color="#666" />
                <Text style={styles.infoText}>
                  {item.items?.length || item.subOrders?.length || 0} عناصر
                </Text>
              </View>
              {item.totalAmount && (
                <View style={styles.infoRow}>
                  <MaterialIcons name="attach-money" size={20} color="#666" />
                  <Text style={styles.infoText}>{item.totalAmount} ر.س</Text>
                </View>
              )}
            </View>

            {/* Actions */}
            {currentStatus === "pending_confirmation" && (
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.prepareButton,
                    { backgroundColor: "#4CAF50" },
                  ]}
                  onPress={() => updateStatus(item._id, "preparing")}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#FFF"
                  />
                  <Text style={styles.prepareButtonText}>قبول الطلب</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => updateStatus(item._id, "cancelled")}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={20}
                    color="#FFF"
                  />
                  <Text style={styles.cancelButtonText}>إلغاء</Text>
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={styles.loadingText}>جاري تحميل الطلبات...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primary]}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          {/* يسار: أكشنز */}
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={onRefresh}>
              <Ionicons name="refresh" size={24} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => exportToExcel(orders)}
            >
              <MaterialIcons name="file-download" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* وسط: العنوان */}
          <Text style={styles.headerTitle}>إدارة الطلبات</Text>

          {/* يمين: Spacer لموازنة الصف (بنفس عرض الأكشنز تقريبًا) */}
          <View style={{ width: 88 }} />
        </View>
      </LinearGradient>

      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <View style={{ flexDirection: "row", margin: 10, gap: 8 }}>
          {STATUS_FILTERS.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              onPress={() => setFilterStatus(key)}
              style={{
                backgroundColor: filterStatus === key ? "#FF500D" : "#FFF",
                borderWidth: 1,
                borderColor: "#FF500D",
                borderRadius: 18,
                paddingHorizontal: 14,
                paddingVertical: 6,
                marginRight: 4,
              }}
            >
              <Text
                style={{
                  color: filterStatus === key ? "#FFF" : "#E8402F",
                  fontFamily: "Cairo-Bold",
                  fontSize: 14,
                }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ marginHorizontal: 10, marginBottom: 5 }}>
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#FFF",
              borderRadius: 10,
              alignItems: "center",
              paddingHorizontal: 10,
              elevation: 1,
            }}
          >
            <Ionicons name="search" size={18} color="#888" />
            <TextInput
              placeholder="بحث برقم الطلب أو اسم العميل..."
              style={{
                flex: 1,
                padding: 8,
                fontFamily: "Cairo-Regular",
                fontSize: 15,
              }}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        <FlatList
          contentContainerStyle={styles.listContainer}
          data={paginatedOrders}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#1E88E5"]}
              tintColor="#1E88E5"
            />
          }
          onEndReached={loadMoreOrders}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color="#1E88E5" />
                <Text style={styles.loadMoreText}>جاري تحميل المزيد...</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={80} color="#CCC" />
              <Text style={styles.emptyText}>لا توجد طلبات حالياً</Text>
              <TouchableOpacity
                style={styles.refreshEmptyButton}
                onPress={onRefresh}
              >
                <Text style={styles.refreshEmptyText}>تحديث</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  loadMoreText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
    fontFamily: "Cairo-Regular",
  },
  header: {
    paddingBottom: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8, // لو إصدارات RN قديمة: استبدل gap بـ marginRight على الأزرار
  },
  iconBtn: { padding: 8 },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Cairo-Bold",
    color: "#FFF",
    textAlign: "center",
  },

  refreshButton: {
    padding: 8,
  },
  listContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  cardContainer: {
    marginBottom: 15,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  orderInfo: {
    flex: 1,
    fontFamily: "Cairo-Bold",
  },
  orderId: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    fontFamily: "Cairo-Bold",

    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Cairo-Bold",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    fontFamily: "Cairo-Bold",

    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
    fontFamily: "Cairo-Bold",
  },
  cardContent: {
    marginBottom: 16,
    fontFamily: "Cairo-Bold",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    fontFamily: "Cairo-Bold",

    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontFamily: "Cairo-Bold",

    fontSize: 14,
    color: "#666",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontFamily: "Cairo-Bold",

    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    fontFamily: "Cairo-Bold",

    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  prepareButton: {
    backgroundColor: "#1E88E5",
  },
  cancelButton: {
    backgroundColor: "#F44336",
  },
  prepareButtonText: {
    color: "#FFF",
    fontFamily: "Cairo-Bold",

    marginLeft: 6,
    fontSize: 14,
  },
  cancelButtonText: {
    color: "#FFF",
    fontFamily: "Cairo-Bold",
    marginLeft: 6,
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",

    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: "#999",
    fontFamily: "Cairo-Bold",

    marginTop: 16,
    marginBottom: 24,
  },
  refreshEmptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    fontFamily: "Cairo-Bold",

    backgroundColor: "#FF500D",
    borderRadius: 8,
  },
  refreshEmptyText: {
    color: "#FFF",
    fontFamily: "Cairo-Bold",
  },
});

export default OrdersScreen;
