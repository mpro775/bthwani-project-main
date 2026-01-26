import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axiosInstance from "@/utils/api/axiosInstance";
import { getWalletBalance, getTransactions, getMyCoupons } from "@/api/walletApi";
import COLORS from "@/constants/colors";
import { useNavigation } from "@react-navigation/native";

interface WalletData {
  balance: number;
  onHold: number;
  available: number;
  loyaltyPoints: number;
  transactions: Transaction[];
}

interface Transaction {
  _id: string;
  type: "credit" | "debit" | "hold" | "release";
  amount: number;
  description?: string;
  createdAt: string;
}

interface Coupon {
  _id: string;
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  expiryDate: string;
  usedCount: number;
  usageLimit?: number;
}

const WalletScreen = () => {
  const navigation = useNavigation();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWalletData = useCallback(async () => {
    try {
      // ✅ استخدام API الجديد بدلاً من axios مباشرة
      const [balance, transactions, coupons] = await Promise.all([
        getWalletBalance(),
        getTransactions({ limit: 10 }),
        getMyCoupons(),
      ]);

      setWalletData({
        balance: balance.balance,
        onHold: balance.onHold,
        available: balance.available,
        loyaltyPoints: balance.loyaltyPoints,
        transactions: transactions.data || [],
      });
      setCoupons(coupons);
    } catch (error: any) {
      Alert.alert("خطأ", "تعذر تحميل بيانات المحفظة");
      console.error("Wallet load error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  }, [loadWalletData]);

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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "credit":
        return "arrow-down";
      case "debit":
        return "arrow-up";
      case "hold":
        return "lock-closed";
      case "release":
        return "lock-open";
      default:
        return "swap-horizontal";
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "credit":
        return COLORS.success;
      case "debit":
        return COLORS.danger;
      case "hold":
        return COLORS.orangeDark;
      case "release":
        return COLORS.primary;
      default:
        return COLORS.gray;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جارٍ تحميل بيانات المحفظة...</Text>
      </View>
    );
  }

  if (!walletData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="wallet-outline" size={64} color={COLORS.gray} />
        <Text style={styles.errorText}>تعذر تحميل بيانات المحفظة</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadWalletData}>
          <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* رصيد المحفظة */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primary]}
        style={styles.balanceCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.balanceHeader}>
          <Ionicons name="wallet" size={32} color="#fff" />
          <Text style={styles.balanceTitle}>محفظتي</Text>
        </View>

        <View style={styles.balanceAmounts}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>الرصيد المتاح</Text>
            <Text style={styles.balanceValue}>{formatAmount(walletData.available)}</Text>
          </View>

          <View style={styles.balanceDivider} />

          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>الإجمالي</Text>
            <Text style={styles.balanceValue}>{formatAmount(walletData.balance)}</Text>
          </View>

          <View style={styles.balanceDivider} />

          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>محجوز</Text>
            <Text style={styles.balanceValue}>{formatAmount(walletData.onHold)}</Text>
          </View>
        </View>

        <View style={styles.loyaltyPoints}>
          <Ionicons name="star" size={20} color="#FFD700" />
          <Text style={styles.loyaltyText}>
            نقاط الولاء: {walletData.loyaltyPoints}
          </Text>
        </View>
      </LinearGradient>

      {/* الأزرار السريعة */}
      <View style={styles.quickActionsSection}>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate("TopupScreen" as never)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.success + "20" }]}>
              <Ionicons name="add-circle" size={24} color={COLORS.success} />
            </View>
            <Text style={styles.quickActionText}>شحن</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate("WithdrawalScreen" as never)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.primary + "20" }]}>
              <Ionicons name="arrow-down-circle" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionText}>سحب</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate("TransferScreen" as never)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.blue + "20" }]}>
              <Ionicons name="send" size={24} color={COLORS.blue} />
            </View>
            <Text style={styles.quickActionText}>تحويل</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate("PayBillScreen" as never)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.orangeDark + "20" }]}>
              <Ionicons name="receipt" size={24} color={COLORS.orangeDark} />
            </View>
            <Text style={styles.quickActionText}>فواتير</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* القسائم المتاحة */}
      <View style={styles.couponsSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="pricetag" size={24} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>القسائم المتاحة</Text>
        </View>

        {coupons.length === 0 ? (
          <View style={styles.emptyCoupons}>
            <Ionicons name="ticket-outline" size={48} color={COLORS.gray} />
            <Text style={styles.emptyCouponsText}>لا توجد قسائم متاحة حاليًا</Text>
          </View>
        ) : (
          coupons.map((coupon) => (
            <View key={coupon._id} style={styles.couponCard}>
              <View style={styles.couponHeader}>
                <Text style={styles.couponCode}>{coupon.code}</Text>
                <View style={styles.couponBadge}>
                  <Text style={styles.couponBadgeText}>
                    {coupon.type === "percentage"
                      ? `${coupon.value}%`
                      : `${coupon.value} ريال`}
                  </Text>
                </View>
              </View>

              <Text style={styles.couponDescription}>
                {coupon.type === "percentage"
                  ? `خصم ${coupon.value}% على الطلب`
                  : `خصم ${coupon.value} ريال`}
              </Text>

              <Text style={styles.couponExpiry}>
                صالح حتى: {formatDate(coupon.expiryDate)}
              </Text>

              {coupon.usageLimit && (
                <Text style={styles.couponUsage}>
                  مستخدم {coupon.usedCount} من {coupon.usageLimit}
                </Text>
              )}
            </View>
          ))
        )}
      </View>

      {/* سجل الحركات */}
      <View style={styles.transactionsSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="receipt" size={24} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>سجل الحركات</Text>
        </View>

        {walletData.transactions.length === 0 ? (
          <View style={styles.emptyTransactions}>
            <Ionicons name="document-text-outline" size={48} color={COLORS.gray} />
            <Text style={styles.emptyTransactionsText}>لا توجد حركات حتى الآن</Text>
          </View>
        ) : (
          walletData.transactions.map((transaction) => (
            <TouchableOpacity
              key={transaction._id}
              style={styles.transactionCard}
              onPress={() =>
                navigation.navigate("TransactionDetailsScreen" as never, {
                  transactionId: transaction._id,
                } as never)
              }
            >
              <View style={styles.transactionIcon}>
                <Ionicons
                  name={getTransactionIcon(transaction.type)}
                  size={20}
                  color={getTransactionColor(transaction.type)}
                />
              </View>

              <View style={styles.transactionDetails}>
                <Text style={styles.transactionDescription}>
                  {transaction.description || "معاملة مالية"}
                </Text>
                <Text style={styles.transactionDate}>
                  {formatDate(transaction.createdAt)}
                </Text>
              </View>

              <View style={styles.transactionAmountContainer}>
                <Text
                  style={[
                    styles.transactionAmount,
                    { color: getTransactionColor(transaction.type) },
                  ]}
                >
                  {transaction.type === "credit" ? "+" : transaction.type === "debit" ? "-" : ""}
                  {formatAmount(Math.abs(transaction.amount))}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.gray} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
    fontFamily: "Cairo-Regular",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.danger,
    fontFamily: "Cairo-Bold",
    marginTop: 16,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Cairo-Bold",
  },
  balanceCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  balanceTitle: {
    fontSize: 24,
    fontFamily: "Cairo-Bold",
    color: "#fff",
    marginLeft: 12,
  },
  balanceAmounts: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  balanceItem: {
    flex: 1,
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Cairo-Regular",
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 18,
    fontFamily: "Cairo-Bold",
    color: "#fff",
  },
  balanceDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 16,
  },
  loyaltyPoints: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  loyaltyText: {
    fontSize: 14,
    fontFamily: "Cairo-Bold",
    color: "#FFD700",
    marginLeft: 8,
  },
  quickActionsSection: {
    margin: 16,
    marginTop: 0,
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
  },
  couponsSection: {
    margin: 16,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
    marginLeft: 8,
  },
  emptyCoupons: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyCouponsText: {
    fontSize: 16,
    color: COLORS.gray,
    fontFamily: "Cairo-Regular",
    marginTop: 12,
  },
  couponCard: {
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
  couponHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  couponCode: {
    fontSize: 18,
    fontFamily: "Cairo-Bold",
    color: COLORS.primary,
  },
  couponBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  couponBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Cairo-Bold",
  },
  couponDescription: {
    fontSize: 14,
    color: COLORS.text,
    fontFamily: "Cairo-Regular",
    marginBottom: 4,
  },
  couponExpiry: {
    fontSize: 12,
    color: COLORS.gray,
    fontFamily: "Cairo-Regular",
    marginBottom: 4,
  },
  couponUsage: {
    fontSize: 12,
    color: COLORS.blue,
    fontFamily: "Cairo-Regular",
  },
  transactionsSection: {
    margin: 16,
    marginTop: 0,
  },
  emptyTransactions: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  emptyTransactionsText: {
    fontSize: 16,
    color: COLORS.gray,
    fontFamily: "Cairo-Regular",
    marginTop: 12,
  },
  transactionCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: COLORS.gray,
    fontFamily: "Cairo-Regular",
  },
  transactionAmountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: "Cairo-Bold",
  },
});

export default WalletScreen;
