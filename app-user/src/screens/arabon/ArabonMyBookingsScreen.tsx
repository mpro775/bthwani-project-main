import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { RootStackParamList } from "@/types/navigation";
import { getMyBookings, type BookingItem } from "@/api/arabonApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ArabonMyBookings"
>;

const BookingStatusLabels: Record<string, string> = {
  pending_payment: "بانتظار الدفع",
  confirmed: "مؤكد",
  completed: "مكتمل",
  cancelled: "ملغي",
  no_show: "لم يحضر",
};

const BookingStatusColors: Record<string, string> = {
  pending_payment: COLORS.orangeDark,
  confirmed: COLORS.primary,
  completed: COLORS.success,
  cancelled: COLORS.danger,
  no_show: COLORS.gray,
};

const ArabonMyBookingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);

  const loadBookings = useCallback(
    async (cursor?: string, append = false) => {
      if (!user) return;
      try {
        if (append) setLoadingMore(true);
        else setLoading(true);
        const res = await getMyBookings({ cursor, limit: 20 });
        setBookings((prev) =>
          append && cursor ? [...prev, ...(res.data ?? [])] : res.data ?? []
        );
        setNextCursor(res.nextCursor);
      } catch (error) {
        console.error("خطأ في تحميل الحجوزات:", error);
        if (!append) setBookings([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [user]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBookings(undefined, false);
  }, [loadBookings]);

  useFocusEffect(
    useCallback(() => {
      if (user) loadBookings();
    }, [user, loadBookings])
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("ar-SA", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "—";
    return `${amount.toFixed(2)} ريال`;
  };

  const getArabonTitle = (item: BookingItem) => {
    const a = item.arabonId;
    if (typeof a === "object" && a?.title) return a.title;
    return "عربون";
  };

  const getSlotTime = (item: BookingItem) => {
    const s = item.slotId;
    if (typeof s === "object" && s?.datetime) return formatDate(s.datetime);
    return "—";
  };

  const renderItem = ({ item }: { item: BookingItem }) => {
    const statusColor = BookingStatusColors[item.status] ?? COLORS.gray;
    const statusLabel = BookingStatusLabels[item.status] ?? item.status;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          // يمكن فتح تفاصيل الحجز لاحقاً
        }}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {getArabonTitle(item)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>
        <View style={styles.cardRow}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={COLORS.textLight}
          />
          <Text style={styles.cardText}>{getSlotTime(item)}</Text>
        </View>
        <View style={styles.cardRow}>
          <Ionicons name="wallet-outline" size={16} color={COLORS.textLight} />
          <Text style={styles.cardText}>
            {formatCurrency(item.depositAmount)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const loadMore = () => {
    if (nextCursor && !loadingMore) loadBookings(nextCursor, true);
  };

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>يجب تسجيل الدخول لعرض حجوزاتك</Text>
      </View>
    );
  }

  if (loading && bookings.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جاري تحميل الحجوزات...</Text>
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
        <Text style={styles.headerTitle}>حجوزاتي</Text>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>لا توجد حجوزات</Text>
            <Text style={styles.emptyHint}>احجز من قائمة العربونات</Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: { marginTop: 12, fontSize: 16, color: COLORS.textLight },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { padding: 8, marginRight: 8 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: COLORS.text },
  listContent: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: COLORS.cardBg,
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
  cardTitle: { fontSize: 16, fontWeight: "600", color: COLORS.text, flex: 1 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 12, color: "#fff", fontWeight: "500" },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  cardText: { fontSize: 14, color: COLORS.textLight },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: { fontSize: 16, color: COLORS.textLight, marginTop: 16 },
  emptyHint: { fontSize: 13, color: COLORS.gray, marginTop: 4 },
  footerLoader: { padding: 16, alignItems: "center" },
});

export default ArabonMyBookingsScreen;
