import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  getWithdrawMethods,
  requestWithdrawal,
  getMyWithdrawals,
  cancelWithdrawal,
  getWalletBalance,
  type WithdrawMethod,
} from "@/api/walletApi";
import COLORS from "@/constants/colors";

interface WithdrawalRequest {
  _id: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
}

const WithdrawalScreen = () => {
  const [methods, setMethods] = useState<WithdrawMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [accountInfo, setAccountInfo] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
  });
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    loadMethods();
    loadBalance();
  }, []);

  const loadMethods = async () => {
    try {
      const data = await getWithdrawMethods();
      setMethods(data);
      if (data.length > 0) {
        setSelectedMethod(data[0].id);
      }
    } catch (error) {
      Alert.alert("خطأ", "تعذر تحميل طرق السحب");
    }
  };

  const loadBalance = async () => {
    try {
      const data = await getWalletBalance();
      setBalance(data.available || 0);
    } catch (error) {
      console.error("Error loading balance:", error);
    }
  };

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await getMyWithdrawals({ limit: 20 });
      setWithdrawals(data.data || []);
    } catch (error) {
      Alert.alert("خطأ", "تعذر تحميل سجل السحوبات");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("خطأ", "يرجى إدخال مبلغ صحيح");
      return;
    }

    if (parseFloat(amount) > balance) {
      Alert.alert("خطأ", "الرصيد المتاح غير كافٍ");
      return;
    }

    if (selectedMethod === "bank_transfer") {
      if (!accountInfo.bankName || !accountInfo.accountNumber || !accountInfo.accountName) {
        Alert.alert("خطأ", "يرجى إدخال جميع بيانات الحساب البنكي");
        return;
      }
    }

    Alert.alert(
      "تأكيد السحب",
      `هل أنت متأكد من طلب سحب ${parseFloat(amount).toFixed(2)} ريال؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "تأكيد",
          onPress: async () => {
            try {
              setLoading(true);
              const result = await requestWithdrawal({
                amount: parseFloat(amount),
                method: selectedMethod,
                accountInfo: selectedMethod === "bank_transfer" ? accountInfo : {},
              });

              if (result.success) {
                Alert.alert("نجح", "تم إرسال طلب السحب بنجاح", [
                  {
                    text: "حسناً",
                    onPress: () => {
                      setAmount("");
                      setAccountInfo({
                        bankName: "",
                        accountNumber: "",
                        accountName: "",
                      });
                      loadBalance();
                      if (showHistory) {
                        loadHistory();
                      }
                    },
                  },
                ]);
              }
            } catch (error: any) {
              Alert.alert(
                "خطأ",
                error.response?.data?.error?.userMessage || "فشل طلب السحب"
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCancel = async (withdrawalId: string) => {
    Alert.alert("تأكيد الإلغاء", "هل أنت متأكد من إلغاء طلب السحب؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "تأكيد",
        onPress: async () => {
          try {
            const result = await cancelWithdrawal(withdrawalId);
            if (result.success) {
              Alert.alert("نجح", "تم إلغاء طلب السحب");
              loadHistory();
              loadBalance();
            }
          } catch (error: any) {
            Alert.alert("خطأ", "فشل إلغاء طلب السحب");
          }
        },
      },
    ]);
  };

  const formatAmount = (amount: number) => {
    return `${amount.toFixed(2)} ريال`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return COLORS.orangeDark;
      case "approved":
        return COLORS.success;
      case "rejected":
        return COLORS.danger;
      case "cancelled":
        return COLORS.gray;
      default:
        return COLORS.gray;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "معلق";
      case "approved":
        return "موافق عليه";
      case "rejected":
        return "مرفوض";
      case "cancelled":
        return "ملغى";
      default:
        return status;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>سحب من المحفظة</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* الرصيد المتاح */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>الرصيد المتاح</Text>
          <Text style={styles.balanceAmount}>{formatAmount(balance)}</Text>
        </View>

        {/* طرق السحب */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اختر طريقة السحب</Text>
          {methods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.methodCardSelected,
              ]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <View style={styles.methodInfo}>
                <Ionicons
                  name={method.type === "bank_transfer" ? "card" : "person"}
                  size={24}
                  color={
                    selectedMethod === method.id
                      ? COLORS.primary
                      : COLORS.gray
                  }
                />
                <View style={styles.methodDetails}>
                  <Text style={styles.methodName}>{method.name}</Text>
                  <Text style={styles.methodRange}>
                    من {method.minAmount} إلى {method.maxAmount} ريال
                  </Text>
                  {method.processingTime && (
                    <Text style={styles.processingTime}>
                      وقت المعالجة: {method.processingTime}
                    </Text>
                  )}
                </View>
              </View>
              {selectedMethod === method.id && (
                <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* نموذج السحب */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات السحب</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>المبلغ (ريال)</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="أدخل المبلغ"
              placeholderTextColor={COLORS.gray}
            />
            {amount && parseFloat(amount) > balance && (
              <Text style={styles.errorText}>
                الرصيد المتاح: {formatAmount(balance)}
              </Text>
            )}
          </View>

          {selectedMethod === "bank_transfer" && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>اسم البنك</Text>
                <TextInput
                  style={styles.input}
                  value={accountInfo.bankName}
                  onChangeText={(text) =>
                    setAccountInfo({ ...accountInfo, bankName: text })
                  }
                  placeholder="أدخل اسم البنك"
                  placeholderTextColor={COLORS.gray}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>رقم الحساب</Text>
                <TextInput
                  style={styles.input}
                  value={accountInfo.accountNumber}
                  onChangeText={(text) =>
                    setAccountInfo({ ...accountInfo, accountNumber: text })
                  }
                  keyboardType="numeric"
                  placeholder="أدخل رقم الحساب"
                  placeholderTextColor={COLORS.gray}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>اسم صاحب الحساب</Text>
                <TextInput
                  style={styles.input}
                  value={accountInfo.accountName}
                  onChangeText={(text) =>
                    setAccountInfo({ ...accountInfo, accountName: text })
                  }
                  placeholder="أدخل اسم صاحب الحساب"
                  placeholderTextColor={COLORS.gray}
                />
              </View>
            </>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              (loading || parseFloat(amount) > balance) && styles.buttonDisabled,
            ]}
            onPress={handleWithdrawal}
            disabled={loading || parseFloat(amount) > balance}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="arrow-down-circle" size={20} color="#fff" />
                <Text style={styles.buttonText}>طلب سحب</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* سجل السحوبات */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.historyHeader}
            onPress={() => {
              setShowHistory(!showHistory);
              if (!showHistory && withdrawals.length === 0) {
                loadHistory();
              }
            }}
          >
            <Text style={styles.sectionTitle}>سجل طلبات السحب</Text>
            <Ionicons
              name={showHistory ? "chevron-up" : "chevron-down"}
              size={24}
              color={COLORS.primary}
            />
          </TouchableOpacity>

          {showHistory && (
            <View style={styles.historyContent}>
              {loadingHistory ? (
                <ActivityIndicator size="large" color={COLORS.primary} />
              ) : withdrawals.length === 0 ? (
                <Text style={styles.emptyText}>لا توجد طلبات سحب</Text>
              ) : (
                withdrawals.map((withdrawal) => (
                  <View key={withdrawal._id} style={styles.historyItem}>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyAmount}>
                        {formatAmount(withdrawal.amount)}
                      </Text>
                      <Text style={styles.historyDate}>
                        {formatDate(withdrawal.createdAt)}
                      </Text>
                      <View style={styles.statusBadge}>
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: getStatusColor(withdrawal.status) },
                          ]}
                        />
                        <Text
                          style={[
                            styles.statusText,
                            { color: getStatusColor(withdrawal.status) },
                          ]}
                        >
                          {getStatusLabel(withdrawal.status)}
                        </Text>
                      </View>
                    </View>
                    {withdrawal.status === "pending" && (
                      <TouchableOpacity
                        onPress={() => handleCancel(withdrawal._id)}
                      >
                        <Ionicons name="close-circle" size={24} color={COLORS.danger} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              )}
            </View>
          )}
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
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Cairo-Bold",
    color: "#fff",
  },
  content: {
    padding: 16,
  },
  balanceCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  balanceLabel: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontFamily: "Cairo-Bold",
    color: COLORS.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  methodCardSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  methodInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  methodDetails: {
    marginLeft: 12,
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  methodRange: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
    marginBottom: 2,
  },
  processingTime: {
    fontSize: 11,
    fontFamily: "Cairo-Regular",
    color: COLORS.blue,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    fontFamily: "Cairo-Regular",
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.danger,
    marginTop: 4,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    marginLeft: 8,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  historyContent: {
    marginTop: 16,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  historyInfo: {
    flex: 1,
  },
  historyAmount: {
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
    marginBottom: 8,
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
    fontSize: 12,
    fontFamily: "Cairo-Bold",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
    textAlign: "center",
    padding: 20,
  },
});

export default WithdrawalScreen;
