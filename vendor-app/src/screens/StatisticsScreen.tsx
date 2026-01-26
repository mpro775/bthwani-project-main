import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { Card } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosInstance from "../api/axiosInstance";
import { COLORS } from "../constants/colors";
import { exportToExcel } from "../components/export-exel";

const { width } = Dimensions.get("window");

const StatisticsScreen: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [todayOrders, setTodayOrders] = useState<any[]>([]);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axiosInstance.get("/vendors/dashboard/overview");
      setData(res.data);

      // جلب طلبات اليوم للتصدير
      await fetchTodayOrders();
    } catch (err) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayOrders = async () => {
    try {
      // جلب الطلبات بدون تحديد تاريخ للحصول على جميع الطلبات ثم فلترة اليوم
      const res = await axiosInstance.get("/delivery/order/vendor/orders");
      const allOrders = res.data?.data || res.data || [];

      // فلترة طلبات اليوم
      const today = new Date().toISOString().split('T')[0];
      const filteredOrders = allOrders.filter((order: any) => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        return orderDate === today;
      });

      setTodayOrders(filteredOrders);
    } catch (error) {
      console.error("Error fetching today orders:", error);
    }
  };

  const handleExportTodayOrders = async () => {
    if (todayOrders.length === 0) {
      alert("لا توجد طلبات لليوم الحالي للتصدير");
      return;
    }

    setExportLoading(true);
    try {
      await exportToExcel(todayOrders);
    } catch (error) {
      console.error("Export error:", error);
      alert("حدث خطأ أثناء التصدير");
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جاري تحميل البيانات...</Text>
      </View>
    );
  }

  const timelineLabels = (data.timeline || []).map((t: any) => t._id.slice(5));
  const timelineCounts = (data.timeline || []).map((t: any) => t.count);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ar-OM").format(value || 0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primary]}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>التحليلات</Text>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleExportTodayOrders}
            disabled={exportLoading}
          >
            {exportLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <MaterialIcons name="file-download" size={24} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}> احصائياتك التفصيلية </Text>
        {todayOrders.length > 0 && (
          <Text style={styles.todayOrdersCount}>
            طلبات اليوم: {todayOrders.length} طلب
          </Text>
        )}
      </LinearGradient>

      {/* مبيعات اليوم/الأسبوع/الشهر */}
      <View style={styles.summaryRow}>
        <Card style={styles.summaryCard}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primary + "CC"]}
            style={styles.gradientBg}
          />
          <View style={styles.cardContent}>
            <Text style={styles.summaryTitle}>مبيعات اليوم</Text>
            <Text style={styles.summaryValue}>
              {data.sales.day?.totalSales || 0} ر.ي
            </Text>
          </View>
        </Card>

        <Card style={styles.summaryCard}>
          <LinearGradient
            colors={[COLORS.primary + "E6", COLORS.primary + "B3"]}
            style={styles.gradientBg}
          />
          <View style={styles.cardContent}>
            <Text style={styles.summaryTitle}>مبيعات الأسبوع</Text>
            <Text style={styles.summaryValue}>
              {data.sales.week?.totalSales || 0} ر.ي
            </Text>
          </View>
        </Card>

        <Card style={styles.summaryCard}>
          <LinearGradient
            colors={[COLORS.primary + "CC", COLORS.primary + "99"]}
            style={styles.gradientBg}
          />
          <View style={styles.cardContent}>
            <Text style={styles.summaryTitle}>مبيعات الشهر</Text>
            <Text style={styles.summaryValue}>
              {data.sales.month?.totalSales || 0} ر.ي
            </Text>
          </View>
        </Card>
      </View>

      {/* إحصائيات الطلبات */}
      <Card style={styles.ordersCard}>
        <View style={styles.ordersHeader}>
          <Text style={styles.sectionTitle}>إحصائيات الطلبات</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statsItem}>
            <Text style={styles.statsValue}>{data.status.delivered}</Text>
            <Text style={styles.statsLabel}>المكتملة</Text>
          </View>
          <View style={[styles.statsItem, styles.borderSide]}>
            <Text style={styles.statsValue}>{data.status.preparing}</Text>
            <Text style={styles.statsLabel}>قيد التجهيز</Text>
          </View>
          <View style={[styles.statsItem, styles.borderSide]}>
            <Text style={styles.statsValue}>{data.status.cancelled}</Text>
            <Text style={styles.statsLabel}>الملغاة</Text>
          </View>
          <View style={[styles.statsItem, styles.borderSide]}>
            <Text style={styles.statsValue}>{data.status.all}</Text>
            <Text style={styles.statsLabel}>الإجمالي</Text>
          </View>
        </View>
      </Card>

      {/* تقييم المتجر */}
      <Card style={styles.ratingCard}>
        <View style={styles.ratingRow}>
          <View style={styles.ratingCircle}>
            <Text style={styles.ratingValue}>
              {data.avgRating?.toFixed(1) || "0"}
            </Text>
          </View>
          <View style={styles.ratingInfo}>
            <Text style={styles.ratingTitle}>تقييم المتجر</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name="star"
                  size={14}
                  color={
                    star <= Math.round(data.avgRating || 0)
                      ? "#FFA800"
                      : "#E0E0E0"
                  }
                />
              ))}
            </View>
          </View>
        </View>
      </Card>

      {/* رسم بياني للطلبات */}
      <Card style={styles.chartCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>اتجاه الطلبات</Text>
        </View>
        <LineChart
          data={{
            labels: timelineLabels,
            datasets: [{ data: timelineCounts }],
          }}
          width={width - 64}
          height={200}
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: "#FFFFFF",
            backgroundGradientFrom: "#FFFFFF",
            backgroundGradientTo: "#FFFFFF",
            decimalPlaces: 0,
            color: (opacity = 1) =>
              COLORS.primary +
              Math.round(opacity * 255)
                .toString(16)
                .padStart(2, "0"),
            labelColor: () => "#6B7280",
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: COLORS.primary,
            },
            propsForBackgroundLines: {
              strokeDasharray: "5,5",
              stroke: "#F3F4F6",
            },
          }}
          style={styles.chart}
          bezier
        />
      </Card>

      {/* أفضل المنتجات */}
      <View style={styles.productsSection}>
        <Text style={styles.sectionTitle}>أفضل المنتجات مبيعاً</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={data.topProducts}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item, index }) => (
            <Card style={styles.productCard}>
              <View style={styles.productBadge}>
                <Text style={styles.productBadgeText}>{index + 1}</Text>
              </View>
              <Text numberOfLines={2} style={styles.productName}>
                {item.name || "بدون اسم"}
              </Text>
              <Text style={styles.productQty}>
                الكمية: {item.totalQuantity}
              </Text>
            </Card>
          )}
        />
      </View>

      {/* المنتجات منخفضة المخزون */}
      <View style={styles.productsSection}>
        <Text style={styles.sectionTitle}>منتجات منخفضة المخزون</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={data.lowestProducts}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <Card style={styles.lowStockCard}>
              <View style={styles.lowStockIcon}>
                <Ionicons name="alert-circle" size={16} color="#ef4444" />
              </View>
              <Text numberOfLines={2} style={styles.productName}>
                {item.name || "بدون اسم"}
              </Text>
              <View style={styles.stockInfo}>
                <Text style={styles.soldText}>مباع: {item.sold}</Text>
                <Text style={styles.stockText}>متبقي: {item.stock}</Text>
              </View>
            </Card>
          )}
        />
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 16,
    fontFamily: "Cairo-Regular",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    color: "white",
    fontFamily: "Cairo-Bold",
  },
  exportButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: "Cairo-Regular",
    textAlign: "center",
  },
  todayOrdersCount: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontFamily: "Cairo-Regular",
    textAlign: "center",
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: "hidden",
  },
  gradientBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  cardContent: {
    padding: 16,
    alignItems: "center",
  },
  summaryTitle: {
    fontSize: 13,
    fontFamily: "Cairo-Medium",
    color: "#6B7280",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontFamily: "Cairo-Bold",
    color: COLORS.primary,
  },
  ordersCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: "hidden",
  },
  ordersHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.primary,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  statsItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  borderSide: {
    borderLeftWidth: 1,
    borderLeftColor: "#F3F4F6",
  },
  statsValue: {
    fontSize: 18,
    fontFamily: "Cairo-Bold",
    color: COLORS.primary,
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: "#6B7280",
  },
  ratingCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 2,
    borderColor: COLORS.primary + "20",
  },
  ratingValue: {
    fontSize: 20,
    fontFamily: "Cairo-Bold",
    color: COLORS.primary,
  },
  ratingInfo: {
    flex: 1,
  },
  ratingTitle: {
    fontSize: 16,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.primary,
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: "row",
  },
  chartCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: "hidden",
  },
  cardHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  chart: {
    marginVertical: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  productsSection: {
    marginBottom: 20,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  productCard: {
    width: 140,
    marginHorizontal: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  productBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  productBadgeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Cairo-Bold",
  },
  productName: {
    fontSize: 13,
    fontFamily: "Cairo-Medium",
    color: COLORS.primary,
    marginBottom: 6,
    textAlign: "center",
  },
  productQty: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: "#6B7280",
    textAlign: "center",
  },
  lowStockCard: {
    width: 140,
    marginHorizontal: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  lowStockIcon: {
    marginBottom: 12,
    alignItems: "center",
  },
  stockInfo: {
    marginTop: 8,
  },
  soldText: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: "#6B7280",
    textAlign: "center",
  },
  stockText: {
    fontSize: 12,
    fontFamily: "Cairo-SemiBold",
    color: "#EF4444",
    textAlign: "center",
  },
});

export default StatisticsScreen;
