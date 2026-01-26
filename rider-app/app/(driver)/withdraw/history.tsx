// app/(driver)/withdraw/history.tsx
import { requestWithdrawal, listWithdrawals } from "@/api/driver";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, View } from "react-native";

interface Withdrawal {
  _id: string;
  amount: number;
  status: string;
  requestedAt: string;
}

export default function WithdrawRequestScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [accountInfo, setAccountInfo] = useState("");
  const [method, setMethod] = useState("agent");
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const withdrawalsData = await listWithdrawals();
      setWithdrawals(withdrawalsData);
    } catch (e) {
      console.error("❌ فشل في جلب السحوبات", e);
    }
  };

  const submitRequest = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      Alert.alert("❌", "يرجى إدخال مبلغ صحيح");
      return;
    }

    setLoading(true);
    try {
      await requestWithdrawal({ amount: num, method, accountInfo });
      Alert.alert("✅", "تم إرسال طلب السحب بنجاح");
      setAmount("");
      setAccountInfo("");
      fetchWithdrawals();
    } catch {
      Alert.alert("❌", "فشل في إرسال الطلب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>طلب سحب رصيد</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="المبلغ المطلوب"
        value={amount}
        onChangeText={setAmount}
      />
      <TextInput
        style={styles.input}
        placeholder="بيانات الحساب أو رقم الوكيل"
        value={accountInfo}
        onChangeText={setAccountInfo}
      />
      <Button title={loading ? "...جارٍ الإرسال" : "إرسال الطلب"} onPress={submitRequest} disabled={loading} />

      <Text style={styles.sectionTitle}>طلبات سابقة:</Text>
      <FlatList
        data={withdrawals}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>لا توجد طلبات سابقة</Text>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>المبلغ: {item.amount} ﷼</Text>
            <Text>الحالة: {item.status}</Text>
            <Text>التاريخ: {new Date(item.requestedAt).toLocaleDateString()}</Text>
          </View>
        )}
      />

      <View style={{ marginTop: 30 }}>
        <Button title="⬅️ عودة إلى المحفظة" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, marginBottom: 10 },
  input: { borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 6 },
  sectionTitle: { fontSize: 18, marginVertical: 20 },
  item: { padding: 10, borderWidth: 1, borderRadius: 6, marginBottom: 10 },
});
