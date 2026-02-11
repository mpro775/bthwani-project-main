// app/(driver)/kanz/deliveries.tsx
// قائمة مهام توصيل كنز للسائق (light_driver)
import { getKenzDeliveryTasks, type KenzDeliveryTask } from "@/api/kenz";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../../constants/colors";

export default function KanzDeliveriesScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState<KenzDeliveryTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await getKenzDeliveryTasks();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching kenz deliveries:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks(false);
  };

  if (loading && tasks.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>مهام توصيل كنز</Text>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            {item.city && (
              <Text style={styles.cardMeta}>
                <Ionicons name="location" size={14} color={COLORS.gray} /> {item.city}
              </Text>
            )}
            {(item.price != null || item.deliveryFee != null) && (
              <Text style={styles.cardPrice}>
                {(item.price || 0) + (item.deliveryFee || 0)} ريال
              </Text>
            )}
            {item.ownerId && (
              <Text style={styles.cardOwner}>
                البائع: {(item.ownerId as any)?.fullName || "—"}
              </Text>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={48} color={COLORS.gray} />
            <Text style={styles.emptyText}>لا توجد مهام توصيل حالياً</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: { marginTop: 12, fontSize: 16, color: COLORS.gray },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 50,
    backgroundColor: COLORS.primary,
  },
  backBtn: { marginLeft: 12 },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Cairo-Bold",
    color: "#fff",
  },
  list: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  cardTitle: { fontSize: 16, fontFamily: "Cairo-Bold", color: COLORS.text, marginBottom: 8 },
  cardMeta: { fontSize: 14, color: COLORS.gray, marginBottom: 4 },
  cardPrice: { fontSize: 16, fontFamily: "Cairo-Bold", color: COLORS.primary, marginTop: 8 },
  cardOwner: { fontSize: 12, color: COLORS.gray, marginTop: 4 },
  empty: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: { marginTop: 16, fontSize: 16, color: COLORS.gray },
});
