import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { useOnboarding } from "../../hooks/useOnboarding";
import { useNavigation } from "@react-navigation/native";
import COLORS from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";

type Nav = any;

export default function OnboardingListScreen() {
  const nav = useNavigation<Nav>();
  const { listMy, items, loading, hasMore } = useOnboarding();
  const [page, setPage] = useState(1);
  const limit = 20;

  // أول تحميل
  useEffect(() => {
    listMy({ page: 1, limit, reset: true });
  }, []);

  // سحب للتحديث
  const onRefresh = useCallback(() => {
    setPage(1);
    listMy({ page: 1, limit, reset: true });
  }, [limit, listMy]);

  // تحميل المزيد
  const onEndReached = useCallback(() => {
    if (loading || !hasMore) return;
    const next = page + 1;
    setPage(next);
    listMy({ page: next, limit });
  }, [loading, hasMore, page, limit, listMy]);

// داخل OnboardingListScreen

const renderItem = useCallback(({ item }: any) => {
  // لا يوجد status في DeliveryStore — سنعرض حالة التفعيل كشارة
  const isActive = !!item?.activation?.store;
  const hasActiveVendor = !!item?.activation?.vendor;

  const statusText = isActive
    ? "المتجر مفعّل"
    : hasActiveVendor
    ? "تاجر نشِط"
    : "غير مفعّل";

  const statusStyle = isActive
    ? styles.badgeSuccess
    : hasActiveVendor
    ? styles.badgeWarning
    : styles.badgePending;

  const title = item?.store?.name?.trim() || "—";
  const address = item?.store?.address?.trim() || "لا يوجد عنوان";
  const createdAt = item?.store?.createdAt;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => nav.navigate("OnboardingDetail", { id: item?.store?._id })}
      activeOpacity={0.85}
    >
      <View style={styles.rowTop}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={[styles.badge, statusStyle]}>{statusText}</Text>
      </View>

      <Text style={styles.small} numberOfLines={2}>{address}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}># {String(item?.store?._id || "").slice(-6)}</Text>
        <Text style={styles.metaText}>{formatDate(createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}, [nav]);

// FlatList
<FlatList
  style={styles.list}
  contentContainerStyle={styles.listContent}
  data={(items || []).filter(Boolean)}
  keyExtractor={(it: any, idx) =>
    String(it?.store?._id || `${it?.store?.createdAt || "x"}-${idx}`)
  }
  refreshControl={
    <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={[COLORS.primary]} />
  }
  renderItem={renderItem}
  onEndReachedThreshold={0.3}
  onEndReached={onEndReached}
  ListEmptyComponent={
    !loading ? (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>لا توجد طلبات</Text>
        <Text style={styles.emptyHint}>عند وصول طلب جديد سيظهر هنا</Text>
      </View>
    ) : null
  }
/>

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>طلباتي</Text>
            <Text style={styles.headerSubtitle}>
              إدارة طلبات المتاجر الجديدة
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={(items || []).filter(Boolean)}
        keyExtractor={(it: any, idx) =>
          String(it?._id || it?.id || `${it?.createdAt || "x"}-${idx}`)
        }
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        renderItem={renderItem}
        onEndReachedThreshold={0.3}
        onEndReached={onEndReached}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>لا توجد طلبات</Text>
              <Text style={styles.emptyHint}>عند وصول طلب جديد سيظهر هنا</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

// helpers
function mapStatus(s: string) {
  switch (s) {
    case "approved":
      return "معتمد";
    case "needs_fix":
      return "تحتاج تعديل";
    case "rejected":
      return "مرفوض";
    case "submitted":
      return "مُرسَل";
    case "draft":
      return "مسودة";
    default:
      return "غير معروف";
  }
}

const dateFmt = new Intl.DateTimeFormat("ar-EG", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function formatDate(d?: string) {
  if (!d) return "";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? "" : dateFmt.format(dt);
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow.light,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === "ios" ? 16 : 20,
  },
  headerLeft: { flex: 1 },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Cairo_700Bold",
    color: COLORS.blue,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "Cairo_400Regular",
    color: COLORS.blue,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  filterIcon: { fontSize: 18 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  addIcon: {
    fontSize: 20,
    color: COLORS.white,
    fontFamily: "Cairo_700Bold",
  },
  list: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  listContent: { paddingVertical: 10 },
  card: {
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow.light,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: { elevation: 3 },
    }),
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontFamily: "Cairo_600SemiBold",
    color: COLORS.blue,
    flex: 1,
    marginLeft: 12,
  },
  small: {
    color: COLORS.blue,
    marginTop: 8,
    fontFamily: "Cairo_400Regular",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    color: COLORS.white,
    fontSize: 12,
fontFamily: "Cairo_600SemiBold",
    textAlign: "center",
    minWidth: 96,
  },
  badgeSuccess: { backgroundColor: COLORS.success },
  badgeDanger: { backgroundColor: COLORS.danger },
  badgeWarning: { backgroundColor: COLORS.warning },
  badgePending: { backgroundColor: COLORS.info },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.blue,
    fontFamily: "Cairo_400Regular",
  },
  emptyWrap: {
    paddingTop: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.blue,
    fontFamily: "Cairo_700Bold",
    marginBottom: 6,
  },
  emptyHint: {
    fontSize: 13,
    color: COLORS.blue,
    fontFamily: "Cairo_400Regular",
  },
});
