import  { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import COLORS from "../../constants/colors";
import { api } from "../../api/client";
import { ENDPOINTS } from "../../api/routes";
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryTheme,
  VictoryArea,
  VictoryVoronoiContainer,
} from "victory-native";
import {
  useFonts,
  Cairo_400Regular,
  Cairo_600SemiBold,
  Cairo_700Bold,
} from "@expo-google-fonts/cairo";
import { SafeAreaView } from "react-native-safe-area-context";
export default function DashboardScreenEnhanced() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [series, setSeries] = useState<{ x: string; y: number }[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(30);
  // (اختياري) فلاتر تاريخ:
  const [from, setFrom] = useState<string | undefined>(undefined);
  const [to, setTo] = useState<string | undefined>(undefined);

  const load = useCallback(async () => {
    if (!user?.id) return;                    // ← لم نعد نستخدم uid
    try {
      setLoading(true);
  
      const res = await api.get(
        ENDPOINTS.OVERVIEW,
        { params: { page, limit, from, to } }
      );
      const resp = res.data;
      setData(resp);
  
      // 1) إن كان الباك يرجّع timeseries جاهزة بشكل: [{ x: "2025-09", y: 3 }, ...]
      if (Array.isArray(resp.timeseries) && resp.timeseries.length) {
        setSeries(resp.timeseries);
        return;
      }
  
      // 2) وإلا ابنِها محليًا من resp.items (كما كنت تفعل)
      const counts: Record<string, number> = {};
      (resp.items || []).forEach((it: any) => {
        const d = new Date(it.createdAt);
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,"0")}`;
        counts[k] = (counts[k] || 0) + 1;
      });
      const arr = Object.keys(counts).sort().map((k) => ({ x: k, y: counts[k] }));
      setSeries(arr.length ? arr : [{ x: "—", y: 0 }]);
  
    } catch (e: any) {
      // تعامل مع 401 بشكل مريح للمستخدم
      if (e?.response?.status === 401) {
        console.log("Session expired, logging out…");
        // (اختياري) استدعِ logout من الـ AuthContext إن وفّرته
        // await logout();
      }
      console.warn("dashboard load error", e?.message || e);
    } finally {
      setLoading(false);
    }
  }, [user?.id, page, limit, from, to]);
  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_600SemiBold,
    Cairo_700Bold,
  });


  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (!fontsLoaded) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>لوحة التحكم</Text>
            <Text style={styles.headerSubtitle}>
              مرحباً بك في عائلة بثواني
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationBtn}>
              <Text style={styles.notificationIcon}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileBtn}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileInitial}>
                  {(user?.fullName || "م")[0]}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              مرحبًا، {user?.fullName || "مسوّق"} 👋
            </Text>
            <Text style={styles.subtitle}>ما الذي تريد القيام به اليوم؟</Text>
          </View>
          <View style={styles.ctaRow}>
            <TouchableOpacity style={styles.ctaBtn}>
              <Text style={styles.ctaTxt}>متجر جديد</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ctaBtn, styles.ctaAlt]}>
              <Text style={[styles.ctaTxt, { color: COLORS.text }]}>
                طلباتي
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>الطلبات المرسلة</Text>
            <Text style={styles.statValue}>
              {loading ? "—" : data?.submitted ?? 0}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>المعتمدة</Text>
            <Text style={styles.statValue}>
              {loading ? "—" : data?.approved ?? 0}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>نسبة الاعتماد</Text>
            <Text style={styles.statValue}>
              {loading
                ? "—"
                : `${Math.round((data?.approvalRate || 0) * 100)}%`}
            </Text>
          </View>
        </View>

        {/* Commission Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>العمولة المستحقة</Text>
            <Text style={styles.statValue}>
              {loading ? "—" : `${data?.commission?.dueYER?.toLocaleString() || 0} ريال`}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>المدفوعة</Text>
            <Text style={styles.statValue}>
              {loading ? "—" : `${data?.commission?.paidYER?.toLocaleString() || 0} ريال`}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>في الانتظار</Text>
            <Text style={styles.statValue}>
              {loading ? "—" : `${data?.commission?.pendingYER?.toLocaleString() || 0} ريال`}
            </Text>
          </View>
        </View>

        <View style={styles.cardFull}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>أدائي الشهري</Text>
            <Text style={styles.cardSub}>عدد الطلبات لكل شهر</Text>
          </View>

          {loading ? (
            <ActivityIndicator style={{ marginTop: 16 }} />
          ) : (
            <VictoryChart
              height={240}
              padding={{ left: 50, right: 20, top: 10, bottom: 60 }}
              containerComponent={<VictoryVoronoiContainer />}
              theme={VictoryTheme.material}
            >
              <VictoryAxis
                style={{
                  tickLabels: {
                    fontFamily: "Cairo_400Regular",
                    fontSize: 10,
                    angle: -45,
                    textAnchor: "end",
                  },
                }}
              />
              <VictoryAxis
                dependentAxis
                style={{
                  tickLabels: { fontFamily: "Cairo_400Regular", fontSize: 10 },
                }}
              />

              <VictoryArea
                interpolation="monotoneX"
                data={series}
                x="x"
                y="y"
                style={{
                  data: {
                    fill: COLORS.primary + "33",
                    stroke: COLORS.primary,
                    strokeWidth: 2,
                  },
                }}
              />
              <VictoryLine
                data={series}
                x="x"
                y="y"
                interpolation="monotoneX"
                style={{ data: { stroke: COLORS.primary, strokeWidth: 2 } }}
              />
            </VictoryChart>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>
              إجمالي: {series.reduce((s, it) => s + (it.y || 0), 0)}
            </Text>
            <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
              <Text style={styles.refreshTxt}>تحديث</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow.light,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
    }),
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === "ios" ? 16 : 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Cairo_700Bold",
    color: COLORS.blue,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "Cairo_400Regular",
    color: COLORS.blue,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationIcon: {
    fontSize: 18,
  },
  profileBtn: {
    padding: 2,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitial: {
    fontSize: 16,
    fontFamily: "Cairo_700Bold",
    color: COLORS.white,
  },
  screen: { flex: 1, backgroundColor: COLORS.backgroundSecondary },
  container: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 14 },
  greeting: { fontSize: 20, fontFamily: "Cairo_700Bold", color: COLORS.blue },
  subtitle: {
    fontSize: 13,
    fontFamily: "Cairo_400Regular",
    color: COLORS.blue,
    marginTop: 4,
  },
  ctaRow: { flexDirection: "row", marginTop: 12 },
  ctaBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginRight: 8,
    minWidth: 110,
    alignItems: "center",
  },
  ctaAlt: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  ctaTxt: { color: COLORS.white, fontFamily: "Cairo_600SemiBold" },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow.light,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 2 },
    }),
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Cairo_400Regular",
    color: COLORS.blue,
  },
  statValue: { fontSize: 18, fontFamily: "Cairo_700Bold", color: COLORS.blue },

  cardFull: {
    marginTop: 14,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow.light,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
      },
      android: { elevation: 3 },
    }),
  },
  cardHeader: { marginBottom: 8 },
  cardTitle: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 16,
    color: COLORS.blue,
  },
  cardSub: {
    fontFamily: "Cairo_400Regular",
    color: COLORS.blue,
    fontSize: 12,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    alignItems: "center",
  },
      summaryText: { fontFamily: "Cairo_600SemiBold", color: COLORS.blue },
  refreshBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.backgroundSecondary,
  },
  refreshTxt: { fontFamily: "Cairo_600SemiBold", color: COLORS.primary },
});
