import COLORS from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function HowToUseScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerTitle}>دروس سريعة</Text>
      </LinearGradient>

      <View style={styles.comingSoonContainer}>
        <View style={styles.comingSoonCard}>
          <Ionicons name="time" size={60} color={COLORS.primary} />
          <Text style={styles.comingSoonTitle}>قريباً</Text>
          <Text style={styles.comingSoonSubtitle}>
            نعمل على إضافة دروس تعليمية شاملة
          </Text>
          <Text style={styles.comingSoonDescription}>
            سنوفر لك فيديوهات تعليمية مفصلة لاستخدام التطبيق بسهولة
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: "Cairo-Bold",
    fontSize: 22,
    color: "#FFF",
    textAlign: "center",
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  comingSoonCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  comingSoonTitle: {
    fontFamily: "Cairo-Bold",
    fontSize: 28,
    color: COLORS.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonSubtitle: {
    fontFamily: "Cairo-SemiBold",
    fontSize: 18,
    color: COLORS.blue,
    textAlign: "center",
    marginBottom: 12,
  },
  comingSoonDescription: {
    fontFamily: "Cairo-Regular",
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
});
