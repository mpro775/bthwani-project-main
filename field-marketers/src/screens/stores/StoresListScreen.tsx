// field-marketers/src/screens/stores/StoresListScreen.tsx
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
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { ENDPOINTS } from '../../api/routes';
import COLORS from '../../constants/colors';
import { useFonts, Cairo_400Regular, Cairo_600SemiBold, Cairo_700Bold } from '@expo-google-fonts/cairo';

interface Store {
  _id: string;
  storeName: string;
  createdEntityId: string;
  status: string;
  createdAt: string;
}

export default function StoresListScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);

  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_600SemiBold,
    Cairo_700Bold,
  });

  const loadStores = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const res = await api.get(ENDPOINTS.STORES_MY);
      setStores(res.data?.data || []);
    } catch (error: any) {
      console.error('Error loading stores:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStores();
  }, [loadStores]);

  const renderStore = ({ item }: { item: Store }) => (
    <TouchableOpacity
      style={styles.storeCard}
      onPress={() => navigation.navigate('StoreDetails', { id: item.createdEntityId || item._id })}
      activeOpacity={0.7}
    >
      <View style={styles.storeHeader}>
        <Text style={styles.storeName}>{item.storeName}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>نشط</Text>
        </View>
      </View>

      <Text style={styles.storeId}>
        #{String(item.createdEntityId || item._id).slice(-8)}
      </Text>

      <Text style={styles.storeDate}>
        أُضيف في: {new Date(item.createdAt).toLocaleDateString('ar-SA')}
      </Text>

      <TouchableOpacity style={styles.viewBtn}>
        <Text style={styles.viewBtnText}>عرض التفاصيل</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (!fontsLoaded) {
    return <ActivityIndicator style={styles.centered} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>متاجري</Text>
        <Text style={styles.headerSubtitle}>
          المتاجر التي قمت بتسجيلها ({stores.length})
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={stores}
        renderItem={renderStore}
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
              <Text style={styles.emptyIcon}>🏪</Text>
              <Text style={styles.emptyText}>لا توجد متاجر مسجلة بعد</Text>
              <Text style={styles.emptySubtext}>
                ابدأ بتسجيل المتاجر لكسب العمولات
              </Text>
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  storeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeName: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Cairo_700Bold',
    color: COLORS.blue,
  },
  statusBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Cairo_600SemiBold',
    color: COLORS.success,
  },
  storeId: {
    fontSize: 12,
    fontFamily: 'Cairo_400Regular',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  storeDate: {
    fontSize: 12,
    fontFamily: 'Cairo_400Regular',
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  viewBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewBtnText: {
    fontSize: 14,
    fontFamily: 'Cairo_600SemiBold',
    color: COLORS.white,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Cairo_600SemiBold',
    color: COLORS.blue,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Cairo_400Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

