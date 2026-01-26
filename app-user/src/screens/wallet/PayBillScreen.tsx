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
  payBill,
  getBills,
  getWalletBalance,
  type Bill,
} from "@/api/walletApi";
import COLORS from "@/constants/colors";

const PayBillScreen = () => {
  const [billType, setBillType] = useState<"electricity" | "water" | "internet">("electricity");
  const [billNumber, setBillNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    loadBalance();
  }, []);

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
      const data = await getBills({ limit: 20 });
      setBills(data.data || []);
    } catch (error) {
      Alert.alert("خطأ", "تعذر تحميل سجل الفواتير");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handlePayBill = async () => {
    if (!billNumber || billNumber.trim().length === 0) {
      Alert.alert("خطأ", "يرجى إدخال رقم الفاتورة");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("خطأ", "يرجى إدخال مبلغ صحيح");
      return;
    }

    if (parseFloat(amount) > balance) {
      Alert.alert("خطأ", "الرصيد المتاح غير كافٍ");
      return;
    }

    Alert.alert(
      "تأكيد الدفع",
      `هل أنت متأكد من دفع ${parseFloat(amount).toFixed(2)} ريال للفاتورة ${billNumber}؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "تأكيد",
          onPress: async () => {
            try {
              setLoading(true);
              const result = await payBill({
                billType,
                billNumber: billNumber.trim(),
                amount: parseFloat(amount),
              });

              if (result.success) {
                Alert.alert("نجح", "تم دفع الفاتورة بنجاح", [
                  {
                    text: "حسناً",
                    onPress: () => {
                      setBillNumber("");
                      setAmount("");
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
                error.response?.data?.error?.userMessage ||
                  error.response?.data?.message ||
                  "فشل دفع الفاتورة"
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
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

  const getBillTypeIcon = (type: string) => {
    switch (type) {
      case "electricity":
        return "flash";
      case "water":
        return "water";
      case "internet":
        return "wifi";
      default:
        return "receipt";
    }
  };

  const getBillTypeLabel = (type: string) => {
    switch (type) {
      case "electricity":
        return "كهرباء";
      case "water":
        return "ماء";
      case "internet":
        return "إنترنت";
      default:
        return type;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>دفع الفواتير</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* الرصيد المتاح */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>الرصيد المتاح</Text>
          <Text style={styles.balanceAmount}>{formatAmount(balance)}</Text>
        </View>

        {/* نوع الفاتورة */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نوع الفاتورة</Text>
          <View style={styles.billTypesContainer}>
            {(["electricity", "water", "internet"] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.billTypeCard,
                  billType === type && styles.billTypeCardSelected,
                ]}
                onPress={() => setBillType(type)}
              >
                <Ionicons
                  name={getBillTypeIcon(type)}
                  size={32}
                  color={billType === type ? COLORS.primary : COLORS.gray}
                />
                <Text
                  style={[
                    styles.billTypeLabel,
                    billType === type && styles.billTypeLabelSelected,
                  ]}
                >
                  {getBillTypeLabel(type)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* نموذج الدفع */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات الفاتورة</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>رقم الفاتورة</Text>
            <TextInput
              style={styles.input}
              value={billNumber}
              onChangeText={setBillNumber}
              keyboardType="numeric"
              placeholder="أدخل رقم الفاتورة"
              placeholderTextColor={COLORS.gray}
            />
          </View>

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

          <TouchableOpacity
            style={[
              styles.button,
              (loading || parseFloat(amount) > balance) && styles.buttonDisabled,
            ]}
            onPress={handlePayBill}
            disabled={loading || parseFloat(amount) > balance}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="card" size={20} color="#fff" />
                <Text style={styles.buttonText}>دفع الفاتورة</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* سجل الفواتير */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.historyHeader}
            onPress={() => {
              setShowHistory(!showHistory);
              if (!showHistory && bills.length === 0) {
                loadHistory();
              }
            }}
          >
            <Text style={styles.sectionTitle}>سجل الفواتير المدفوعة</Text>
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
              ) : bills.length === 0 ? (
                <Text style={styles.emptyText}>لا توجد فواتير مدفوعة</Text>
              ) : (
                bills.map((bill) => (
                  <View key={bill._id} style={styles.historyItem}>
                    <View style={styles.historyIcon}>
                      <Ionicons
                        name={getBillTypeIcon(bill.billType)}
                        size={24}
                        color={COLORS.primary}
                      />
                    </View>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyDescription}>
                        {getBillTypeLabel(bill.billType)} - {bill.billNumber}
                      </Text>
                      <Text style={styles.historyDate}>
                        {formatDate(bill.createdAt)}
                      </Text>
                    </View>
                    <View style={styles.historyAmountContainer}>
                      <Text style={styles.historyAmount}>
                        {formatAmount(bill.amount)}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              bill.status === "paid"
                                ? COLORS.success
                                : COLORS.orangeDark,
                          },
                        ]}
                      >
                        <Text style={styles.statusText}>
                          {bill.status === "paid" ? "مدفوعة" : "معلقة"}
                        </Text>
                      </View>
                    </View>
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
  billTypesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  billTypeCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.lightGray,
  },
  billTypeCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightGray,
  },
  billTypeLabel: {
    fontSize: 14,
    fontFamily: "Cairo-Bold",
    color: COLORS.gray,
    marginTop: 8,
  },
  billTypeLabelSelected: {
    color: COLORS.primary,
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
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyDescription: {
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
  },
  historyAmountContainer: {
    alignItems: "flex-end",
  },
  historyAmount: {
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontFamily: "Cairo-Bold",
    color: "#fff",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
    textAlign: "center",
    padding: 20,
  },
});

export default PayBillScreen;
