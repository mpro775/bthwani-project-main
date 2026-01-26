// app/(driver)/transactions.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { getTransactions, type Transaction } from "@/api/walletApi";
import { COLORS } from "../../constants/colors";

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>();
  const [filter, setFilter] = useState<{
    type?: string;
    status?: string;
    method?: string;
  }>({});

  const loadTransactions = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setCursor(undefined);
      }

      const data = await getTransactions({
        cursor: reset ? undefined : cursor,
        limit: 20,
        ...filter,
      });

      if (reset) {
        setTransactions(data.data || []);
      } else {
        setTransactions((prev) => [...prev, ...(data.data || [])]);
      }

      setHasMore(data.hasMore || false);
      setCursor(data.nextCursor);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [cursor, filter]);

  useEffect(() => {
    loadTransactions(true);
  }, [filter]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTransactions(true);
  };

  const loadMore = () => {
    if (!loading && hasMore && cursor) {
      loadTransactions(false);
    }
  };

  const formatAmount = (amount: number) => {
    return `${amount.toFixed(2)} ريال`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeIcon = (type: string) => {
    return type === "credit" ? "arrow-down-circle" : "arrow-up-circle";
  };

  const getTypeColor = (type: string) => {
    return type === "credit" ? COLORS.success : COLORS.danger;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return COLORS.success;
      case "pending":
        return COLORS.orangeDark;
      case "failed":
        return COLORS.danger;
      case "reversed":
        return COLORS.gray;
      default:
        return COLORS.gray;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "مكتملة";
      case "pending":
        return "معلقة";
      case "failed":
        return "فاشلة";
      case "reversed":
        return "معكوسة";
      default:
        return status;
    }
  };

  const getMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      kuraimi: "كريمي",
      card: "بطاقة",
      transfer: "تحويل",
      payment: "دفع",
      escrow: "حجز",
      reward: "مكافأة",
      agent: "وكيل",
      withdrawal: "سحب",
    };
    return methods[method] || method;
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity style={styles.transactionCard}>
      <View style={styles.transactionIcon}>
        <Ionicons
          name={getTypeIcon(item.type)}
          size={24}
          color={getTypeColor(item.type)}
        />
      </View>

      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDescription}>
          {item.description || "معاملة مالية"}
        </Text>
        <View style={styles.transactionMeta}>
          <Text style={styles.transactionMethod}>
            {getMethodLabel(item.method)}
          </Text>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>
        <Text style={styles.transactionDate}>
          {formatDate(item.createdAt)}
        </Text>
      </View>

      <Text
        style={[
          styles.transactionAmount,
          { color: getTypeColor(item.type) },
        ]}
      >
        {item.type === "credit" ? "+" : "-"}
        {formatAmount(Math.abs(item.amount))}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>سجل المعاملات</Text>
      </LinearGradient>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              !filter.type && styles.filterChipActive,
            ]}
            onPress={() => setFilter({ ...filter, type: undefined })}
          >
            <Text
              style={[
                styles.filterChipText,
                !filter.type && styles.filterChipTextActive,
              ]}
            >
              الكل
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filter.type === "credit" && styles.filterChipActive,
            ]}
            onPress={() => setFilter({ ...filter, type: "credit" })}
          >
            <Text
              style={[
                styles.filterChipText,
                filter.type === "credit" && styles.filterChipTextActive,
              ]}
            >
              إيداع
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filter.type === "debit" && styles.filterChipActive,
            ]}
            onPress={() => setFilter({ ...filter, type: "debit" })}
          >
            <Text
              style={[
                styles.filterChipText,
                filter.type === "debit" && styles.filterChipTextActive,
              ]}
            >
              سحب
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filter.status === "pending" && styles.filterChipActive,
            ]}
            onPress={() =>
              setFilter({
                ...filter,
                status: filter.status === "pending" ? undefined : "pending",
              })
            }
          >
            <Text
              style={[
                styles.filterChipText,
                filter.status === "pending" && styles.filterChipTextActive,
              ]}
            >
              معلقة
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Transactions List */}
      {loading && transactions.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>جارٍ تحميل المعاملات...</Text>
        </View>
      ) : transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color={COLORS.gray} />
          <Text style={styles.emptyText}>لا توجد معاملات</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            hasMore ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : null
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Cairo-Bold",
    color: "#fff",
  },
  filtersContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
  },
  filterChipTextActive: {
    color: "#fff",
  },
  listContent: {
    padding: 16,
  },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  transactionMethod: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Cairo-Bold",
  },
  transactionDate: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: "Cairo-Bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
  },
  loadingMore: {
    padding: 16,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
    marginTop: 16,
  },
});
