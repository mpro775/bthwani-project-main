import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  getMyDriverErrands,
  ErrandOrder,
  ERRAND_STATUS_LABELS,
  ERRAND_STATUS_COLORS,
} from "../api/akhdimni";

const ErrandsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [errands, setErrands] = useState<ErrandOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string | undefined>(undefined);

  const fetchErrands = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await getMyDriverErrands(filter);
      setErrands(data);
    } catch (error: any) {
      Alert.alert("خطأ", error?.response?.data?.message || "فشل في جلب المهمات");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchErrands();
  }, [filter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchErrands(false);
  };

  const renderErrandCard = ({ item }: { item: ErrandOrder }) => {
    const statusColor = ERRAND_STATUS_COLORS[item.status] || "#6c757d";
    const statusLabel = ERRAND_STATUS_LABELS[item.status] || item.status;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("ErrandDetails" as never, { errandId: item._id } as never)
        }
      >
        <View style={styles.cardHeader}>
          <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.locationSection}>
          <View style={styles.locationRow}>
            <View style={[styles.locationDot, { backgroundColor: "#0d6efd" }]} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>الاستلام</Text>
              <Text style={styles.locationAddress}>
                {item.errand.pickup.label || item.errand.pickup.city || "—"}
              </Text>
              {item.errand.pickup.street && (
                <Text style={styles.locationStreet}>
                  {item.errand.pickup.street}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.routeLine} />

          <View style={styles.locationRow}>
            <View style={[styles.locationDot, { backgroundColor: "#198754" }]} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>التسليم</Text>
              <Text style={styles.locationAddress}>
                {item.errand.dropoff.label || item.errand.dropoff.city || "—"}
              </Text>
              {item.errand.dropoff.street && (
                <Text style={styles.locationStreet}>
                  {item.errand.dropoff.street}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>المسافة</Text>
            <Text style={styles.infoValue}>
              {item.errand.distanceKm.toFixed(1)} كم
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>النوع</Text>
            <Text style={styles.infoValue}>{item.errand.category}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>الرسوم</Text>
            <Text style={styles.infoValue}>{item.deliveryFee} ريال</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const FilterButton = ({
    label,
    value,
  }: {
    label: string;
    value?: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === value && styles.filterButtonActive,
      ]}
      onPress={() => setFilter(value)}
    >
      <Text
        style={[
          styles.filterButtonText,
          filter === value && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0d6efd" />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>مهمات أخدمني</Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FilterButton label="الكل" value={undefined} />
        <FilterButton label="معينة" value="assigned" />
        <FilterButton label="في التنفيذ" value="picked_up" />
        <FilterButton label="مكتملة" value="delivered" />
      </View>

      {/* List */}
      <FlatList
        data={errands}
        keyExtractor={(item) => item._id}
        renderItem={renderErrandCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>لا توجد مهمات حالياً</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6c757d",
    fontFamily: "Cairo-Regular",
  },
  header: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Cairo-Bold",
    color: "#212529",
    textAlign: "center",
  },
  filtersContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  filterButtonActive: {
    backgroundColor: "#0d6efd",
    borderColor: "#0d6efd",
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: "Cairo-SemiBold",
    color: "#495057",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  listContent: {
    padding: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    color: "#212529",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Cairo-SemiBold",
    color: "#fff",
  },
  divider: {
    height: 1,
    backgroundColor: "#e9ecef",
    marginVertical: 12,
  },
  locationSection: {
    paddingHorizontal: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 12,
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: "#dee2e6",
    marginLeft: 5,
    marginVertical: 4,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: "#6c757d",
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    fontFamily: "Cairo-SemiBold",
    color: "#212529",
  },
  locationStreet: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: "#495057",
    marginTop: 2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  infoItem: {
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: "#6c757d",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "Cairo-Bold",
    color: "#212529",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Cairo-Regular",
    color: "#6c757d",
  },
});

export default ErrandsScreen;

