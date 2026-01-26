// app/(driver)/orders/[id].tsx
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, View, StyleSheet } from "react-native";

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>تفاصيل الطلب</Text>
      <Text style={styles.text}>📦 معرف الطلب: {id}</Text>
      {/* هنا يمكن لاحقًا جلب بيانات فعلية من API باستخدام id */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  text: { fontSize: 16, color: "#333" },
});
