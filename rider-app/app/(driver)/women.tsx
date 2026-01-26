// app/(driver)/women.tsx
import { useRouter } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function WomenTaxiScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>أهلاً بك، سائقة التوصيل</Text>

      <Button
        title="🚗 رحلاتي"
        onPress={() => router.push({ pathname: "/orders", params: { type: "women_driver" } })}
      />

      <Button
        title="🚺 طلبات أماني"
        onPress={() => router.push("/amani")}
      />

      <Button
        title="💳 الرصيد"
        onPress={() => router.push("/wallet")}
      />

      <Button
        title="⚙️ الإعدادات"
        onPress={() => router.push("/profile")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
});
