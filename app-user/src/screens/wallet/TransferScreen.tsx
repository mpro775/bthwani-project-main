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
  transferFunds,
  getTransfers,
  getWalletBalance,
  type Transaction,
} from "@/api/walletApi";
import COLORS from "@/constants/colors";

const TransferScreen = () => {
  const [recipientPhone, setRecipientPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [transfers, setTransfers] = useState<Transaction[]>([]);
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
      const data = await getTransfers({ limit: 20 });
      setTransfers(data.data || []);
    } catch (error) {
      Alert.alert("خطأ", "تعذر تحميل سجل التحويلات");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleTransfer = async () => {
    if (!recipientPhone || recipientPhone.trim().length < 10) {
      Alert.alert("خطأ", "يرجى إدخال رقم هاتف صحيح");
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
      "تأكيد التحويل",
      `هل أنت متأكد من تحويل ${parseFloat(amount).toFixed(2)} ريال إلى ${recipientPhone}؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "تأكيد",
          onPress: async () => {
            try {
              setLoading(true);
              const result = await transferFunds({
                recipientPhone: recipientPhone.trim(),
                amount: parseFloat(amount),
                notes: notes.trim() || undefined,
              });

              if (result.success) {
                Alert.alert("نجح", "تم التحويل بنجاح", [
                  {
                    text: "حسناً",
                    onPress: () => {
                      setRecipientPhone("");
                      setAmount("");
                      setNotes("");
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
                  "فشل التحويل"
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

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>تحويل رصيد</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* الرصيد المتاح */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>الرصيد المتاح</Text>
          <Text style={styles.balanceAmount}>{formatAmount(balance)}</Text>
        </View>

        {/* نموذج التحويل */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات التحويل</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>رقم هاتف المستلم</Text>
            <TextInput
              style={styles.input}
              value={recipientPhone}
              onChangeText={setRecipientPhone}
              keyboardType="phone-pad"
              placeholder="أدخل رقم الهاتف"
              placeholderTextColor={COLORS.gray}
            />
            <Text style={styles.hintText}>
              سيتم البحث عن المستخدم برقم الهاتف
            </Text>
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ملاحظات (اختياري)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="أضف ملاحظة للتحويل"
              placeholderTextColor={COLORS.gray}
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (loading || parseFloat(amount) > balance) && styles.buttonDisabled,
            ]}
            onPress={handleTransfer}
            disabled={loading || parseFloat(amount) > balance}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" />
                <Text style={styles.buttonText}>تحويل</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* سجل التحويلات */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.historyHeader}
            onPress={() => {
              setShowHistory(!showHistory);
              if (!showHistory && transfers.length === 0) {
                loadHistory();
              }
            }}
          >
            <Text style={styles.sectionTitle}>سجل التحويلات</Text>
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
              ) : transfers.length === 0 ? (
                <Text style={styles.emptyText}>لا توجد تحويلات</Text>
              ) : (
                transfers.map((transfer) => (
                  <View key={transfer._id} style={styles.historyItem}>
                    <View style={styles.historyIcon}>
                      <Ionicons
                        name={
                          transfer.type === "credit" ? "arrow-down" : "arrow-up"
                        }
                        size={24}
                        color={
                          transfer.type === "credit"
                            ? COLORS.success
                            : COLORS.danger
                        }
                      />
                    </View>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyDescription}>
                        {transfer.description || "تحويل رصيد"}
                      </Text>
                      <Text style={styles.historyDate}>
                        {formatDate(transfer.createdAt)}
                      </Text>
                      {transfer.meta?.notes && (
                        <Text style={styles.historyNotes}>
                          {transfer.meta.notes}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.historyAmount,
                        {
                          color:
                            transfer.type === "credit"
                              ? COLORS.success
                              : COLORS.danger,
                        },
                      ]}
                    >
                      {transfer.type === "credit" ? "+" : "-"}
                      {formatAmount(Math.abs(transfer.amount))}
                    </Text>
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
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  hintText: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.blue,
    marginTop: 4,
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
    marginBottom: 4,
  },
  historyNotes: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.blue,
    fontStyle: "italic",
  },
  historyAmount: {
    fontSize: 16,
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

export default TransferScreen;
