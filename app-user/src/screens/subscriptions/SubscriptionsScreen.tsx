import COLORS from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Plan = {
  id: string;
  title: string;
  price: string;
  features: string[];
  comingSoon?: boolean;
};

const FALLBACK: Plan[] = [
  {
    id: "monthly",
    title: "شهري",
    price: "2,500 ريال/شهر",
    features: ["توصيل أسرع", "دعم أولوية"],
  },
  {
    id: "yearly",
    title: "سنوي",
    price: "25,000 ريال/سنة",
    features: ["شهران هدية", "خصومات خاصة"],
  },
];

export default function SubscriptionsScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerTitle}>الاشتراكات</Text>
      </LinearGradient>

      <View style={styles.comingSoonContainer}>
        <View style={styles.comingSoonCard}>
          <Ionicons name="time" size={60} color={COLORS.primary} />
          <Text style={styles.comingSoonTitle}>قريباً</Text>
          <Text style={styles.comingSoonSubtitle}>
            نعمل على إضافة باقات الاشتراك المميزة
          </Text>
          <Text style={styles.comingSoonDescription}>
            سنوفر لك خيارات اشتراك متنوعة مع مميزات حصرية
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
  cardWrap: { marginBottom: 12, paddingHorizontal: 16 },
  card: {
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.13,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  planTitle: { color: "#fff", fontFamily: "Cairo-Bold", fontSize: 18 },
  planPrice: {
    color: "#fff",
    opacity: 0.95,
    marginTop: 4,
    marginBottom: 8,
    fontFamily: "Cairo-SemiBold",
  },
  feature: { color: "#fff", opacity: 0.95, fontFamily: "Cairo-Regular" },
  cta: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginStart: 12,
  },
  ctaText: { color: COLORS.primary, fontFamily: "Cairo-Bold" },
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
