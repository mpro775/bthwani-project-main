import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { getTransactionDetails, type Transaction } from "@/api/walletApi";
import COLORS from "@/constants/colors";
import { useRoute, useNavigation } from "@react-navigation/native";

const TransactionDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { transactionId } = route.params as { transactionId: string };
  
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactionDetails();
  }, []);

  const loadTransactionDetails = async () => {
    try {
      setLoading(true);
      const data = await getTransactionDetails(transactionId);
      setTransaction(data.transaction);
    } catch (error) {
      console.error("Error loading transaction:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return `${amount.toFixed(2)} ريال`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جارٍ تحميل التفاصيل...</Text>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={COLORS.danger} />
        <Text style={styles.errorText}>المعاملة غير موجودة</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>العودة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primary]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تفاصيل المعاملة</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* المبلغ */}
        <View style={styles.amountCard}>
          <Ionicons
            name={getTypeIcon(transaction.type)}
            size={48}
            color={getTypeColor(transaction.type)}
          />
          <Text style={styles.amountLabel}>
            {transaction.type === "credit" ? "إيداع" : "سحب"}
          </Text>
          <Text
            style={[
              styles.amountValue,
              { color: getTypeColor(transaction.type) },
            ]}
          >
            {transaction.type === "credit" ? "+" : "-"}
            {formatAmount(Math.abs(transaction.amount))}
          </Text>
        </View>

        {/* التفاصيل */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات المعاملة</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>الحالة</Text>
            <View style={styles.statusBadge}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(transaction.status || "completed") },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(transaction.status || "completed") },
                ]}
              >
                {getStatusLabel(transaction.status || "completed")}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>الطريقة</Text>
            <Text style={styles.detailValue}>
              {getMethodLabel(transaction.method || "")}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>الوصف</Text>
            <Text style={styles.detailValue}>
              {transaction.description || "لا يوجد وصف"}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>تاريخ المعاملة</Text>
            <Text style={styles.detailValue}>
              {formatDate(transaction.createdAt)}
            </Text>
          </View>

          {transaction.bankRef && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>رقم المرجع</Text>
              <Text style={styles.detailValue}>{transaction.bankRef}</Text>
            </View>
          )}

          {transaction.meta && Object.keys(transaction.meta).length > 0 && (
            <View style={styles.metaSection}>
              <Text style={styles.metaTitle}>معلومات إضافية</Text>
              {Object.entries(transaction.meta).map(([key, value]) => (
                <View key={key} style={styles.metaRow}>
                  <Text style={styles.metaKey}>{key}:</Text>
                  <Text style={styles.metaValue}>
                    {typeof value === "object" ? JSON.stringify(value) : String(value)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* معلومات إضافية */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={COLORS.blue} />
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>
              رقم المعاملة: {transaction._id}
            </Text>
            {transaction.status === "pending" && (
              <Text style={styles.infoText}>
                المعاملة قيد المعالجة، يرجى الانتظار
              </Text>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    alignItems: "center",
    position: "relative",
  },
  backIcon: {
    position: "absolute",
    top: 60,
    right: 24,
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Cairo-Bold",
    color: "#fff",
  },
  content: {
    padding: 16,
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
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
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
    fontFamily: "Cairo-Bold",
    color: COLORS.danger,
    marginTop: 16,
    textAlign: "center",
  },
  backButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Cairo-Bold",
  },
  amountCard: {
    backgroundColor: "#fff",
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  amountLabel: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
    marginTop: 12,
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 32,
    fontFamily: "Cairo-Bold",
  },
  section: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
    flex: 2,
    textAlign: "right",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontFamily: "Cairo-Bold",
  },
  metaSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  metaTitle: {
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  metaKey: {
    fontSize: 12,
    fontFamily: "Cairo-Bold",
    color: COLORS.gray,
    marginRight: 8,
  },
  metaValue: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.text,
    flex: 1,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: COLORS.lightGray,
    padding: 16,
    borderRadius: 12,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoText: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.text,
    marginBottom: 4,
  },
});

export default TransactionDetailsScreen;
