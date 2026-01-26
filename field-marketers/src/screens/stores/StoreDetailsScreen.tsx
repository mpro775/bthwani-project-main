// field-marketers/src/screens/stores/StoreDetailsScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { api } from '../../api/client';
import { ENDPOINTS } from '../../api/routes';
import COLORS from '../../constants/colors';
import { useFonts, Cairo_400Regular, Cairo_600SemiBold, Cairo_700Bold } from '@expo-google-fonts/cairo';
import { VictoryChart, VictoryBar, VictoryAxis, VictoryTheme } from 'victory-native';

interface StoreDetails {
  _id: string;
  name: string;
  address: string;
  phone: string;
  status: string;
  createdAt: string;
}

interface StorePerformance {
  orders: number;
  revenue: number;
  rating: number;
}

export default function StoreDetailsScreen() {
  const route = useRoute<any>();
  const storeId = route.params?.id;
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [store, setStore] = useState<StoreDetails | null>(null);
  const [performance, setPerformance] = useState<StorePerformance>({ orders: 0, revenue: 0, rating: 0 });

  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_600SemiBold,
    Cairo_700Bold,
  });

  const loadData = useCallback(async () => {
    if (!storeId) return;

    try {
      setLoading(true);

      // Load store details
      const storeRes = await api.get(ENDPOINTS.STORES_GET_ONE(storeId));
      setStore(storeRes.data?.store || null);

      // Load performance
      const performanceRes = await api.get(ENDPOINTS.STORES_PERFORMANCE(storeId));
      setPerformance(performanceRes.data || { orders: 0, revenue: 0, rating: 0 });

    } catch (error: any) {
      console.error('Error loading store details:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [storeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
  }, [loadData]);

  if (!fontsLoaded) {
    return <ActivityIndicator style={styles.centered} />;
  }

  if (loading && !store) {
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
          <Text style={styles.storeName}>{store?.name || 'المتجر'}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>نشط</Text>
          </View>
        </View>

        {/* Store Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات المتجر</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>العنوان:</Text>
            <Text style={styles.infoValue}>{store?.address || '—'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>الهاتف:</Text>
            <Text style={styles.infoValue}>{store?.phone || '—'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>تاريخ الإضافة:</Text>
            <Text style={styles.infoValue}>
              {store?.createdAt ? new Date(store.createdAt).toLocaleDateString('ar-SA') : '—'}
            </Text>
          </View>
        </View>

        {/* Performance Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الأداء</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>عدد الطلبات</Text>
              <Text style={styles.statValue}>{performance.orders}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>الإيرادات</Text>
              <Text style={styles.statValue}>{performance.revenue.toLocaleString()} ﷼</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>التقييم</Text>
              <Text style={styles.statValue}>
                ⭐ {performance.rating.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Performance Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الإيرادات الشهرية</Text>
          
          <VictoryChart
            height={200}
            padding={{ left: 50, right: 20, top: 20, bottom: 40 }}
            theme={VictoryTheme.material}
          >
            <VictoryAxis
              style={{
                tickLabels: { fontSize: 10, fontFamily: 'Cairo_400Regular' },
              }}
            />
            <VictoryAxis
              dependentAxis
              style={{
                tickLabels: { fontSize: 10, fontFamily: 'Cairo_400Regular' },
              }}
            />
            <VictoryBar
              data={[
                { month: 'يناير', revenue: Math.random() * 10000 },
                { month: 'فبراير', revenue: Math.random() * 10000 },
                { month: 'مارس', revenue: Math.random() * 10000 },
              ]}
              x="month"
              y="revenue"
              style={{
                data: { fill: COLORS.primary },
              }}
            />
          </VictoryChart>
        </View>
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
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeName: {
    flex: 1,
    fontSize: 24,
    fontFamily: 'Cairo_700Bold',
    color: COLORS.blue,
  },
  statusBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Cairo_600SemiBold',
    color: COLORS.success,
  },
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Cairo_600SemiBold',
    color: COLORS.blue,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Cairo_400Regular',
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Cairo_600SemiBold',
    color: COLORS.text,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Cairo_400Regular',
    color: COLORS.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Cairo_700Bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
});

