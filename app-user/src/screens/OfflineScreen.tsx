// src/screens/OfflineScreen.tsx
import COLORS from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function OfflineScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>عذراً</Text>
      <Text style={styles.message}>
        يرجى توصيل الإنترنت لإتمام عمل التطبيق.
      </Text>
      {/* زر لإعادة المحاولة بعد توصيل الإنترنت */}
      <TouchableOpacity onPress={onRetry} style={styles.button}>
        <Text style={styles.buttonText}>إعادة المحاولة</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: "Cairo-Bold",
    marginBottom: 12,
    color: COLORS.primary,
  },
  message: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 24,
    fontFamily: "Cairo-Regular",
    color: COLORS.blue,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: COLORS.background,
    fontSize: 16,
    fontFamily: "Cairo-Bold",
  },
});
