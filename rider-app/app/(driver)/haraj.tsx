// app/(driver)/haraj.tsx
import { useRouter } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function HarajOrdersScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>مرحباً بك في قسم التوصيل الخفيف (Haraj)</Text>

      <Button
        title="🚚 الطلبات"
        onPress={() => router.push({ pathname: "/orders", params: { type: "light_driver" } })}
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
