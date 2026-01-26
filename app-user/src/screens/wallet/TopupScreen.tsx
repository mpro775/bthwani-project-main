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
  getTopupMethods,
  topupViaKuraimi,
  verifyTopup,
  getTopupHistory,
  type TopupMethod,
  type Transaction,
} from "@/api/walletApi";
import COLORS from "@/constants/colors";

const TopupScreen = () => {
  const [methods, setMethods] = useState<TopupMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [kuraimiCard, setKuraimiCard] = useState("");
  const [kuraimiPin, setKuraimiPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    try {
      const data = await getTopupMethods();
      setMethods(data);
      if (data.length > 0) {
        setSelectedMethod(data[0].id);
      }
    } catch (error) {
      Alert.alert("خطأ", "تعذر تحميل طرق الشحن");
    }
  };

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await getTopupHistory({ limit: 20 });
      setHistory(data.data || []);
    } catch (error) {
      Alert.alert("خطأ", "تعذر تحميل سجل الشحن");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleTopup = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("خطأ", "يرجى إدخال مبلغ صحيح");
      return;
    }

    if (selectedMethod === "kuraimi") {
      if (!kuraimiCard || !kuraimiPin) {
        Alert.alert("خطأ", "يرجى إدخال رقم البطاقة والرمز السري");
        return;
      }

      try {
        setLoading(true);
        const result = await topupViaKuraimi({
          amount: parseFloat(amount),
          SCustID: kuraimiCard,
          PINPASS: kuraimiPin,
        });

        if (result.success) {
          // التحقق من العملية
          const verifyResult = await verifyTopup(result.transactionId);
          if (verifyResult.success) {
            Alert.alert("نجح", "تم شحن المحفظة بنجاح", [
              {
                text: "حسناً",
                onPress: () => {
                  setAmount("");
                  setKuraimiCard("");
                  setKuraimiPin("");
                },
              },
            ]);
          }
        }
      } catch (error: any) {
        Alert.alert(
          "خطأ",
          error.response?.data?.error?.userMessage || "فشلت عملية الشحن"
        );
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert("معلومة", "هذه الطريقة ستكون متاحة قريباً");
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

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>شحن المحفظة</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* طرق الشحن */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اختر طريقة الشحن</Text>
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
                  name={
                    method.type === "kuraimi"
                      ? "card"
                      : method.type === "card"
                      ? "card-outline"
                      : "person"
                  }
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
                </View>
              </View>
              {selectedMethod === method.id && (
                <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* نموذج الشحن */}
        {selectedMethod === "kuraimi" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>معلومات الشحن</Text>

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
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>رقم بطاقة كريمي</Text>
              <TextInput
                style={styles.input}
                value={kuraimiCard}
                onChangeText={setKuraimiCard}
                keyboardType="numeric"
                placeholder="أدخل رقم البطاقة"
                placeholderTextColor={COLORS.gray}
                maxLength={20}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>الرمز السري</Text>
              <TextInput
                style={styles.input}
                value={kuraimiPin}
                onChangeText={setKuraimiPin}
                keyboardType="numeric"
                placeholder="أدخل الرمز السري"
                placeholderTextColor={COLORS.gray}
                secureTextEntry
                maxLength={10}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleTopup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="add-circle" size={20} color="#fff" />
                  <Text style={styles.buttonText}>شحن المحفظة</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* سجل الشحن */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.historyHeader}
            onPress={() => {
              setShowHistory(!showHistory);
              if (!showHistory && history.length === 0) {
                loadHistory();
              }
            }}
          >
            <Text style={styles.sectionTitle}>سجل عمليات الشحن</Text>
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
              ) : history.length === 0 ? (
                <Text style={styles.emptyText}>لا توجد عمليات شحن</Text>
              ) : (
                history.map((transaction) => (
                  <View key={transaction._id} style={styles.historyItem}>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyAmount}>
                        +{formatAmount(transaction.amount)}
                      </Text>
                      <Text style={styles.historyDate}>
                        {formatDate(transaction.createdAt)}
                      </Text>
                    </View>
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={COLORS.success}
                    />
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
    color: COLORS.success,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
    textAlign: "center",
    padding: 20,
  },
});

export default TopupScreen;
