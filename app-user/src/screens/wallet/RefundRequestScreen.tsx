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
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  requestRefund,
  getTransactions,
  type Transaction,
} from "@/api/walletApi";
import COLORS from "@/constants/colors";
import { useNavigation } from "@react-navigation/native";

const RefundRequestScreen = () => {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const data = await getTransactions({ limit: 50 });
      // عرض فقط المعاملات debit التي يمكن استرجاعها
      const refundableTransactions = (data.data || []).filter(
        (t) => t.type === "debit" && t.status === "completed"
      );
      setTransactions(refundableTransactions);
    } catch (error) {
      Alert.alert("خطأ", "تعذر تحميل المعاملات");
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleRequestRefund = async () => {
    if (!selectedTransaction) {
      Alert.alert("خطأ", "يرجى اختيار معاملة");
      return;
    }

    if (!reason || reason.trim().length < 10) {
      Alert.alert("خطأ", "يرجى إدخال سبب الاسترجاع (10 أحرف على الأقل)");
      return;
    }

    Alert.alert(
      "تأكيد الاسترجاع",
      `هل أنت متأكد من طلب استرجاع ${selectedTransaction.amount.toFixed(2)} ريال؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "تأكيد",
          onPress: async () => {
            try {
              setLoading(true);
              const result = await requestRefund({
                transactionId: selectedTransaction._id,
                reason: reason.trim(),
              });

              if (result.success) {
                Alert.alert("نجح", "تم تقديم طلب الاسترجاع بنجاح", [
                  {
                    text: "حسناً",
                    onPress: () => {
                      setSelectedTransaction(null);
                      setReason("");
                      loadTransactions();
                    },
                  },
                ]);
              }
            } catch (error: any) {
              Alert.alert(
                "خطأ",
                error.response?.data?.error?.userMessage ||
                  error.response?.data?.message ||
                  "فشل طلب الاسترجاع"
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
        <Text style={styles.headerTitle}>طلب استرجاع</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* اختيار المعاملة */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اختر المعاملة</Text>
          {loadingTransactions ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : transactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={48} color={COLORS.gray} />
              <Text style={styles.emptyText}>لا توجد معاملات قابلة للاسترجاع</Text>
            </View>
          ) : (
            <FlatList
              data={transactions}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.transactionCard,
                    selectedTransaction?._id === item._id &&
                      styles.transactionCardSelected,
                  ]}
                  onPress={() => setSelectedTransaction(item)}
                >
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionDescription}>
                      {item.description || "معاملة مالية"}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(item.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.transactionAmountContainer}>
                    <Text style={styles.transactionAmount}>
                      {formatAmount(item.amount)}
                    </Text>
                    {selectedTransaction?._id === item._id && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={COLORS.primary}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {/* نموذج الاسترجاع */}
        {selectedTransaction && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>سبب الاسترجاع</Text>
            <View style={styles.selectedTransactionCard}>
              <Text style={styles.selectedTransactionText}>
                المعاملة المختارة: {formatAmount(selectedTransaction.amount)}
              </Text>
              <Text style={styles.selectedTransactionDescription}>
                {selectedTransaction.description || "معاملة مالية"}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>السبب *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={reason}
                onChangeText={setReason}
                placeholder="أدخل سبب الاسترجاع (10 أحرف على الأقل)"
                placeholderTextColor={COLORS.gray}
                multiline
                numberOfLines={4}
              />
              <Text style={styles.hintText}>
                {reason.length}/10 أحرف على الأقل
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                (loading || reason.trim().length < 10) && styles.buttonDisabled,
              ]}
              onPress={handleRequestRefund}
              disabled={loading || reason.trim().length < 10}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="refresh" size={20} color="#fff" />
                  <Text style={styles.buttonText}>تقديم طلب الاسترجاع</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* معلومات إضافية */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={COLORS.blue} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>معلومات مهمة</Text>
            <Text style={styles.infoText}>
              • يمكنك طلب استرجاع المعاملات المكتملة فقط
            </Text>
            <Text style={styles.infoText}>
              • سيتم مراجعة طلبك خلال 24-48 ساعة
            </Text>
            <Text style={styles.infoText}>
              • سيتم إرجاع المبلغ إلى محفظتك بعد الموافقة
            </Text>
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
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Cairo-Bold",
    color: "#fff",
  },
  content: {
    padding: 16,
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
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
  },
  transactionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightGray,
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
  transactionDate: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
  },
  transactionAmountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    color: COLORS.danger,
  },
  selectedTransactionCard: {
    backgroundColor: COLORS.lightGray,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  selectedTransactionText: {
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    color: COLORS.primary,
    marginBottom: 4,
  },
  selectedTransactionDescription: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.text,
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
    height: 100,
    textAlignVertical: "top",
  },
  hintText: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.blue,
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
  emptyContainer: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
    marginTop: 12,
    textAlign: "center",
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: COLORS.lightGray,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.text,
    marginBottom: 4,
  },
});

export default RefundRequestScreen;
