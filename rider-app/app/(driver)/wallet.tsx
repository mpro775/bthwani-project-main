// app/(driver)/wallet.tsx
import { getWalletSummary } from "@/api/driver";
import { getWalletBalance, getTransactions } from "@/api/walletApi";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
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
import { useRouter } from "expo-router";
import { COLORS } from "../../constants/colors";

interface WalletData {
  balance: number;
  totalEarnings: number;
  todayEarnings: number;
  weeklyEarnings: number;
  pendingPayments: number;
}

export default function WalletScreen() {
  const router = useRouter();
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 0,
    totalEarnings: 0,
    todayEarnings: 0,
    weeklyEarnings: 0,
    pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const [summaryData, , transactionsData] = await Promise.all([
        getWalletSummary(),
        getWalletBalance().catch(() => null),
        getTransactions({ limit: 5 }).catch(() => null),
      ]);

      setWalletData({
        balance: summaryData.balance || 0,
        totalEarnings: summaryData.totalEarnings || 0,
        todayEarnings: summaryData.todayEarnings || 0,
        weeklyEarnings: summaryData.weeklyEarnings || 0,
        pendingPayments: summaryData.pendingPayments || 0,
      });

      // حساب الأرباح الشهرية من المعاملات
      if (transactionsData?.data) {
        setRecentTransactions(transactionsData.data);
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyCredits = transactionsData.data
          .filter(
            (t: any) =>
              t.type === "credit" &&
              new Date(t.createdAt) >= startOfMonth &&
              t.status === "completed"
          )
          .reduce((sum: number, t: any) => sum + t.amount, 0);
        setMonthlyEarnings(monthlyCredits);
      }
    } catch (error) {
      console.error("❌ خطأ في تحميل بيانات المحفظة:", error);
      Alert.alert("خطأ", "فشل في تحميل بيانات المحفظة");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadWalletData();
  };

  const handleWithdraw = () => {
    router.push("/withdraw");
  };

  const handleTransactionHistory = () => {
    router.push("/transactions");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جارٍ تحميل بيانات المحفظة...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Ionicons name="wallet" size={28} color="#fff" />
          <Text style={styles.balanceTitle}>رصيدك الحالي</Text>
        </View>
        <Text style={styles.balanceAmount}>
          {walletData.balance.toLocaleString()} ﷼
        </Text>
        <Text style={styles.balanceSubtitle}>متاح للسحب</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="today" size={24} color={COLORS.primary} />
          <Text style={styles.statLabel}>اليوم</Text>
          <Text style={styles.statValue}>
            {walletData.todayEarnings.toFixed(2)} ﷼
          </Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="calendar" size={24} color={COLORS.success} />
          <Text style={styles.statLabel}>هذا الأسبوع</Text>
          <Text style={styles.statValue}>
            {walletData.weeklyEarnings.toFixed(2)} ﷼
          </Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="time" size={24} color={COLORS.orangeDark} />
          <Text style={styles.statLabel}>معلق</Text>
          <Text style={styles.statValue}>
            {walletData.pendingPayments.toFixed(2)} ﷼
          </Text>
        </View>
      </View>

      {/* Monthly Earnings */}
      {monthlyEarnings > 0 && (
        <View style={styles.monthlyCard}>
          <Ionicons name="calendar-outline" size={24} color={COLORS.blue} />
          <View style={styles.monthlyContent}>
            <Text style={styles.monthlyLabel}>أرباح هذا الشهر</Text>
            <Text style={styles.monthlyValue}>
              {monthlyEarnings.toFixed(2)} ﷼
            </Text>
          </View>
        </View>
      )}

      {/* Recent Transactions Preview */}
      {recentTransactions.length > 0 && (
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>آخر المعاملات</Text>
            <TouchableOpacity onPress={handleTransactionHistory}>
              <Text style={styles.viewAllText}>عرض الكل</Text>
            </TouchableOpacity>
          </View>
          {recentTransactions.slice(0, 3).map((transaction) => (
            <View key={transaction._id} style={styles.recentTransaction}>
              <Ionicons
                name={transaction.type === "credit" ? "arrow-down-circle" : "arrow-up-circle"}
                size={20}
                color={transaction.type === "credit" ? COLORS.success : COLORS.danger}
              />
              <View style={styles.recentTransactionInfo}>
                <Text style={styles.recentTransactionDesc}>
                  {transaction.description || "معاملة مالية"}
                </Text>
                <Text style={styles.recentTransactionDate}>
                  {new Date(transaction.createdAt).toLocaleDateString("ar-SA")}
                </Text>
              </View>
              <Text
                style={[
                  styles.recentTransactionAmount,
                  {
                    color:
                      transaction.type === "credit"
                        ? COLORS.success
                        : COLORS.danger,
                  },
                ]}
              >
                {transaction.type === "credit" ? "+" : "-"}
                {transaction.amount.toFixed(2)} ﷼
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Total Earnings */}
      <View style={styles.totalCard}>
        <Ionicons name="trophy" size={24} color={COLORS.primary} />
        <View style={styles.totalContent}>
          <Text style={styles.totalLabel}>إجمالي الأرباح</Text>
          <Text style={styles.totalValue}>
            {walletData.totalEarnings.toLocaleString()} ﷼
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleWithdraw}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-down-circle" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>سحب الأموال</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButtonSecondary}
          onPress={handleTransactionHistory}
          activeOpacity={0.8}
        >
          <Ionicons name="document-text" size={20} color={COLORS.primary} />
          <Text style={styles.actionButtonTextSecondary}>سجل المعاملات</Text>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>معلومات مهمة</Text>
        <View style={styles.infoItem}>
          <Ionicons name="information-circle" size={20} color={COLORS.blue} />
          <Text style={styles.infoText}>
            يتم تحديث الرصيد يومياً في الساعة 12:00 صباحاً
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="shield-checkmark" size={20} color={COLORS.success} />
          <Text style={styles.infoText}>
            جميع المعاملات محمية وآمنة
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

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
  balanceCard: {
    backgroundColor: COLORS.primary,
    margin: 20,
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  balanceTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Cairo-Bold",
    marginLeft: 12,
  },
  balanceAmount: {
    color: "#fff",
    fontSize: 42,
    fontFamily: "Cairo-Bold",
    fontWeight: "700",
    marginBottom: 8,
  },
  balanceSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontFamily: "Cairo-Regular",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontFamily: "Cairo-Regular",
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
  },
  totalCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
  },
  totalContent: {
    flex: 1,
    marginLeft: 16,
  },
  totalLabel: {
    fontSize: 14,
    color: COLORS.gray,
    fontFamily: "Cairo-Regular",
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 20,
    fontFamily: "Cairo-Bold",
    color: COLORS.primary,
  },
  monthlyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.blue,
  },
  monthlyContent: {
    flex: 1,
    marginLeft: 12,
  },
  monthlyLabel: {
    fontSize: 14,
    color: COLORS.gray,
    fontFamily: "Cairo-Regular",
    marginBottom: 4,
  },
  monthlyValue: {
    fontSize: 18,
    fontFamily: "Cairo-Bold",
    color: COLORS.blue,
  },
  recentSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: 18,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: "Cairo-Bold",
    color: COLORS.primary,
  },
  recentTransaction: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  recentTransactionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  recentTransactionDesc: {
    fontSize: 14,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  recentTransactionDate: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
  },
  recentTransactionAmount: {
    fontSize: 14,
    fontFamily: "Cairo-Bold",
  },
  actionsContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.success,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    marginLeft: 8,
  },
  actionButtonTextSecondary: {
    color: COLORS.primary,
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    marginLeft: 8,
  },
  infoContainer: {
    marginHorizontal: 20,
    marginBottom: 40,
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    padding: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    fontFamily: "Cairo-Regular",
    marginLeft: 12,
    lineHeight: 20,
  },
});
