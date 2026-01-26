import { useRouter } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function V1HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>مرحباً بك</Text>
      <Button title="💰 محفظتي" onPress={() => router.push("/wallet" as const)} />
      <Button title="📦 طلباتي" onPress={() => router.push("/orders" as const)} />
      <Button title="👤 حسابي" onPress={() => router.push("/profile" as const)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
});
