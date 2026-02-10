// app/(driver)/orders/[id].tsx — صفحة تفاصيل الطلب الحقيقية
import {
  getOrderDetails,
  startDelivery,
  completeDelivery,
  type DriverOrder,
} from "@/api/orders";
import { triggerSOS } from "@/componant/triggerSOS";
import { COLORS } from "../../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<DriverOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!id || typeof id !== "string") return;
    try {
      setError(null);
      const data = await getOrderDetails(id);
      setOrder(data);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || e?.response?.data?.userMessage || "فشل في تحميل تفاصيل الطلب";
      setError(msg);
      setOrder(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrder();
  };

  const handleStartDelivery = async () => {
    if (!id) return;
    setActionLoading("start");
    try {
      await startDelivery(id);
      await fetchOrder();
    } catch {
      Alert.alert("خطأ", "فشل في بدء التوصيل");
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async () => {
    if (!id) return;
    setActionLoading("complete");
    try {
      await completeDelivery(id);
      Alert.alert("تم", "تم إتمام التوصيل بنجاح", [
        { text: "حسناً", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("خطأ", "فشل في إتمام التوصيل");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && !order) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جاري تحميل التفاصيل...</Text>
      </View>
    );
  }

  if (error && !order) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.danger} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); fetchOrder(); }}>
          <Text style={styles.retryBtnText}>إعادة المحاولة</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>رجوع</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!order) return null;

  const addr = order.address;
  const addressLabel = addr?.label || [addr?.city, addr?.street].filter(Boolean).join("، ") || "—";
  const canStart = order.status !== "in_delivery" && order.status !== "completed";
  const canComplete = order.status === "in_delivery" || order.status === "assigned";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
      }
    >
      <View style={styles.card}>
        <Text style={styles.orderId}>طلب #{typeof id === "string" ? id.slice(-8) : id}</Text>
        <View style={styles.statusRow}>
          <Text style={styles.label}>الحالة</Text>
          <Text style={[styles.statusBadge, { backgroundColor: COLORS.lightGray }]}>
            {order.status || "—"}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>العميل</Text>
        <Text style={styles.value}>{order.user?.fullName || "—"}</Text>
        <Text style={styles.valueSecondary}>{order.user?.phone || "—"}</Text>
      </View>

      {order.store?.name && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>المتجر</Text>
          <Text style={styles.value}>{order.store.name}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>عنوان التوصيل</Text>
        <Text style={styles.value}>{addressLabel}</Text>
        {addr?.city && <Text style={styles.valueSecondary}>{addr.city}</Text>}
      </View>

      {order.items?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>المنتجات</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemText}>
                {item.product?.name || "منتج"} × {item.quantity}
              </Text>
              <Text style={styles.itemPrice}>{item.price * item.quantity} ر.س</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>المجموع</Text>
          <Text style={styles.price}>{order.totalPrice ?? 0} ر.س</Text>
        </View>
        {(order.deliveryFee ?? 0) > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>رسوم التوصيل</Text>
            <Text style={styles.price}>{order.deliveryFee} ر.س</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {canStart && (
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={handleStartDelivery}
            disabled={!!actionLoading}
          >
            {actionLoading === "start" ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="play" size={20} color="#fff" />
                <Text style={styles.btnText}>بدء التوصيل</Text>
              </>
            )}
          </TouchableOpacity>
        )}
        {canComplete && (
          <TouchableOpacity
            style={[styles.btn, styles.btnSuccess]}
            onPress={handleComplete}
            disabled={!!actionLoading}
          >
            {actionLoading === "complete" ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.btnText}>تم التوصيل</Text>
              </>
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.btn, styles.btnSos]} onPress={triggerSOS}>
          <Ionicons name="warning" size={20} color="#fff" />
          <Text style={styles.btnText}>نداء طوارئ</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.gray },
  errorText: { marginTop: 12, textAlign: "center", color: COLORS.danger },
  retryBtn: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: COLORS.primary, borderRadius: 12 },
  retryBtnText: { color: "#fff", fontWeight: "600" },
  backBtn: { marginTop: 8 },
  backBtnText: { color: COLORS.gray },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  orderId: { fontSize: 18, fontWeight: "700", color: COLORS.primary, marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: COLORS.dark, marginBottom: 8 },
  label: { fontSize: 14, color: COLORS.gray },
  value: { fontSize: 16, color: COLORS.text },
  valueSecondary: { fontSize: 14, color: COLORS.gray, marginTop: 4 },
  statusRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontSize: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  price: { fontSize: 16, fontWeight: "700", color: COLORS.primary },
  itemRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  itemText: { fontSize: 14, color: COLORS.text },
  itemPrice: { fontSize: 14, color: COLORS.gray },
  actions: { gap: 12, marginTop: 8 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  btnPrimary: { backgroundColor: COLORS.primary },
  btnSuccess: { backgroundColor: COLORS.success },
  btnSos: { backgroundColor: COLORS.danger },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
