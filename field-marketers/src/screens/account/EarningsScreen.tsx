// field-marketers/src/screens/account/EarningsScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { ENDPOINTS } from '../../api/routes';
import COLORS from '../../constants/colors';
import { useFonts, Cairo_400Regular, Cairo_600SemiBold, Cairo_700Bold } from '@expo-google-fonts/cairo';
import { VictoryPie, VictoryChart, VictoryBar, VictoryAxis, VictoryTheme } from 'victory-native';

interface EarningsData {
  totalEarnings: number;
  ordersCount: number;
  averagePerOrder: number;
}

interface BreakdownData {
  byType: Array<{ type: string; amount: number }>;
  byMonth: Array<{ month: string; amount: number }>;
}

export default function EarningsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [earnings, setEarnings] = useState<EarningsData>({ totalEarnings: 0, ordersCount: 0, averagePerOrder: 0 });
  const [breakdown, setBreakdown] = useState<BreakdownData>({ byType: [], byMonth: [] });
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_600SemiBold,
    Cairo_700Bold,
  });

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Calculate date range based on period
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      // Load earnings
      const earningsRes = await api.get(ENDPOINTS.EARNINGS, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      setEarnings(earningsRes.data || { totalEarnings: 0, ordersCount: 0, averagePerOrder: 0 });

      // Load breakdown
      const breakdownRes = await api.get(ENDPOINTS.EARNINGS_BREAKDOWN);
      setBreakdown(breakdownRes.data || { byType: [], byMonth: [] });

    } catch (error: any) {
      console.error('Error loading earnings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
  }, [loadData]);

  const pieData = breakdown.byType.map((item, index) => ({
    x: item.type,
    y: item.amount,
    label: `${item.type}\n${item.amount.toLocaleString()} ﷼`,
  }));

  const barData = breakdown.byMonth.slice(-6).map(item => ({
    month: item.month,
    earnings: item.amount,
  }));

  if (!fontsLoaded) {
    return <ActivityIndicator style={styles.centered} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>أرباحي</Text>
          <Text style={styles.headerSubtitle}>تفصيل شامل لأرباحك</Text>
        </View>

        {/* Period Selector */}
        <View style={styles.periodContainer}>
          <TouchableOpacity
            style={[styles.periodBtn, period === 'week' && styles.periodBtnActive]}
            onPress={() => setPeriod('week')}
          >
            <Text style={[styles.periodText, period === 'week' && styles.periodTextActive]}>
              أسبوع
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.periodBtn, period === 'month' && styles.periodBtnActive]}
            onPress={() => setPeriod('month')}
          >
            <Text style={[styles.periodText, period === 'month' && styles.periodTextActive]}>
              شهر
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.periodBtn, period === 'year' && styles.periodBtnActive]}
            onPress={() => setPeriod('year')}
          >
            <Text style={[styles.periodText, period === 'year' && styles.periodTextActive]}>
              سنة
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator style={styles.centered} />
        ) : (
          <>
            {/* Main Stats */}
            <View style={styles.mainStatsContainer}>
              <View style={styles.mainStatCard}>
                <Text style={styles.mainStatLabel}>إجمالي الأرباح</Text>
                <Text style={styles.mainStatValue}>
                  {earnings.totalEarnings.toLocaleString()} ﷼
                </Text>
              </View>

              <View style={styles.subStatsRow}>
                <View style={styles.subStatCard}>
                  <Text style={styles.subStatLabel}>عدد الطلبات</Text>
                  <Text style={styles.subStatValue}>{earnings.ordersCount}</Text>
                </View>

                <View style={styles.subStatCard}>
                  <Text style={styles.subStatLabel}>متوسط العمولة</Text>
                  <Text style={styles.subStatValue}>
                    {earnings.averagePerOrder.toLocaleString()} ﷼
                  </Text>
                </View>
              </View>
            </View>

            {/* Pie Chart - By Type */}
            {pieData.length > 0 && (
              <View style={styles.chartSection}>
                <Text style={styles.chartTitle}>التوزيع حسب النوع</Text>
                <VictoryPie
                  data={pieData}
                  colorScale={[COLORS.primary, COLORS.secondary, COLORS.success, COLORS.orangeDark]}
                  height={250}
                  padding={50}
                  labelRadius={80}
                  style={{
                    labels: { fontSize: 10, fontFamily: 'Cairo_400Regular' },
                  }}
                />
              </View>
            )}

            {/* Bar Chart - By Month */}
            {barData.length > 0 && (
              <View style={styles.chartSection}>
                <Text style={styles.chartTitle}>الأرباح الشهرية</Text>
                <VictoryChart
                  height={250}
                  padding={{ left: 50, right: 20, top: 20, bottom: 50 }}
                  theme={VictoryTheme.material}
                >
                  <VictoryAxis
                    style={{
                      tickLabels: { fontSize: 10, fontFamily: 'Cairo_400Regular', angle: -45 },
                    }}
                  />
                  <VictoryAxis
                    dependentAxis
                    style={{
                      tickLabels: { fontSize: 10, fontFamily: 'Cairo_400Regular' },
                    }}
                  />
                  <VictoryBar
                    data={barData}
                    x="month"
                    y="earnings"
                    style={{
                      data: { fill: COLORS.primary },
                    }}
                  />
                </VictoryChart>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Cairo_700Bold',
    color: COLORS.blue,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Cairo_400Regular',
    color: COLORS.textSecondary,
  },
  periodContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
  },
  periodBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  periodText: {
    fontSize: 14,
    fontFamily: 'Cairo_600SemiBold',
    color: COLORS.text,
  },
  periodTextActive: {
    color: COLORS.white,
  },
  mainStatsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  mainStatCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  mainStatLabel: {
    fontSize: 14,
    fontFamily: 'Cairo_400Regular',
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  mainStatValue: {
    fontSize: 32,
    fontFamily: 'Cairo_700Bold',
    color: COLORS.white,
  },
  subStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  subStatCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  subStatLabel: {
    fontSize: 12,
    fontFamily: 'Cairo_400Regular',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  subStatValue: {
    fontSize: 18,
    fontFamily: 'Cairo_700Bold',
    color: COLORS.blue,
  },
  chartSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: 'Cairo_600SemiBold',
    color: COLORS.blue,
    marginBottom: 12,
    textAlign: 'center',
  },
});

