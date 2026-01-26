// field-marketers/src/screens/account/CommissionsScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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

interface Commission {
  _id: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  type: string;
  description: string;
  createdAt: string;
  paidAt?: string;
}

interface CommissionStats {
  total: number;
  pending: number;
  paid: number;
}

export default function CommissionsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [stats, setStats] = useState<CommissionStats>({ total: 0, pending: 0, paid: 0 });
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');

  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_600SemiBold,
    Cairo_700Bold,
  });

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Load commissions
      const commissionsRes = await api.get(ENDPOINTS.COMMISSIONS_MY, {
        params: filter !== 'all' ? { status: filter } : {},
      });
      setCommissions(commissionsRes.data?.data || []);

      // Load statistics
      const statsRes = await api.get(ENDPOINTS.COMMISSIONS_STATISTICS);
      setStats(statsRes.data || { total: 0, pending: 0, paid: 0 });

    } catch (error: any) {
      console.error('Error loading commissions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
  }, [loadData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return COLORS.success;
      case 'pending': return COLORS.orangeDark;
      case 'cancelled': return COLORS.danger;
      default: return COLORS.gray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'مدفوعة';
      case 'pending': return 'معلقة';
      case 'cancelled': return 'ملغاة';
      default: return status;
    }
  };

  const renderCommission = ({ item }: { item: Commission }) => (
    <View style={styles.commissionCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.amount}>{item.amount.toLocaleString()} ﷼</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>{item.description || item.type}</Text>

      <View style={styles.cardFooter}>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleDateString('ar-SA')}
        </Text>
        {item.paidAt && (
          <Text style={styles.paidDate}>
            دُفعت في: {new Date(item.paidAt).toLocaleDateString('ar-SA')}
          </Text>
        )}
      </View>
    </View>
  );

  if (!fontsLoaded) {
    return <ActivityIndicator style={styles.centered} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>عمولاتي</Text>
        <Text style={styles.headerSubtitle}>تتبع أرباحك ومستحقاتك</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>الإجمالي</Text>
          <Text style={styles.statValue}>{stats.total.toLocaleString()} ﷼</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>المعلقة</Text>
          <Text style={[styles.statValue, { color: COLORS.orangeDark }]}>
            {stats.pending.toLocaleString()} ﷼
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>المدفوعة</Text>
          <Text style={[styles.statValue, { color: COLORS.success }]}>
            {stats.paid.toLocaleString()} ﷼
          </Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            الكل
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filter === 'pending' && styles.filterBtnActive]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
            المعلقة
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filter === 'paid' && styles.filterBtnActive]}
          onPress={() => setFilter('paid')}
        >
          <Text style={[styles.filterText, filter === 'paid' && styles.filterTextActive]}>
            المدفوعة
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={commissions}
        renderItem={renderCommission}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={styles.centered} />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>لا توجد عمولات</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Cairo_400Regular',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Cairo_700Bold',
    color: COLORS.primary,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Cairo_600SemiBold',
    color: COLORS.text,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  commissionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  amount: {
    fontSize: 20,
    fontFamily: 'Cairo_700Bold',
    color: COLORS.primary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Cairo_600SemiBold',
  },
  description: {
    fontSize: 14,
    fontFamily: 'Cairo_400Regular',
    color: COLORS.text,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 12,
    fontFamily: 'Cairo_400Regular',
    color: COLORS.textSecondary,
  },
  paidDate: {
    fontSize: 12,
    fontFamily: 'Cairo_400Regular',
    color: COLORS.success,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Cairo_400Regular',
    color: COLORS.textSecondary,
  },
});

