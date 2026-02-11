// app/(driver)/kanz/index.tsx
// قسم كنز — التوصيل الخفيف (السوق المفتوح / إعلانات)
import { useRouter } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function KanzOrdersScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>مرحباً بك في قسم كنز</Text>

      <Button
        title="🚚 طلبات التوصيل"
        onPress={() => router.push({ pathname: "/orders", params: { type: "light_driver" } })}
      />

      <Button
        title="📦 مهام توصيل كنز"
        onPress={() => router.push("/kanz/deliveries")}
      />

      <Button
        title="💰 المحفظة"
        onPress={() => router.push("/wallet")}
      />

      <Button
        title="👤 الحساب"
        onPress={() => router.push("/profile")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
});
