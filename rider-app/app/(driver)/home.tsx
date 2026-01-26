// src/components/DriverDashboardScreen.tsx
import { completeOrder, getDriverOrders, updateAvailability } from '@/api/driver';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import ProfileScreen from './profile';
import { triggerSOS } from './triggerSOS';
import WalletScreen from './wallet';

interface OrderType {
  _id: string;
  status: string;
  price: number;
  address?: { label: string };
}

type Tab = 'Orders' | 'Wallet' | 'Profile';

export default function DriverDashboardScreen() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [available, setAvailable] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('Orders');
  const { driver } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getDriverOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
      Alert.alert('خطأ', 'فشل في جلب الطلبات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const toggleAvailable = async () => {
    const next = !available;
    setAvailable(next);
    try {
      await updateAvailability(next);
    } catch (e) {
      setAvailable(!next); // rollback
      Alert.alert("خطأ", "فشل تحديث التوفر");
    }
  };

  const renderOrder = ({ item }: { item: OrderType }) => (
    <View style={styles.orderCard}>
      <Text style={styles.orderId}>#{item._id.slice(-6)}</Text>
      <Text style={styles.orderText}>الحالة: {item.status}</Text>
      <Text style={styles.orderText}>العنوان: {item.address?.label || 'غير محدد'}</Text>
      <Text style={styles.orderPrice}>السعر: {item.price} ريال</Text>

      <TouchableOpacity
        style={styles.completeBtn}
        onPress={() => completeOrder(item._id)}
        activeOpacity={0.8}
      >
        <Ionicons name="checkmark-circle" size={18} color="#fff" style={{ position: 'absolute', right: 16 }} />
        <Text style={styles.completeText}>إنهاء الطلب</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.sosBtn}
        onPress={triggerSOS}
        activeOpacity={0.8}
      >
        <Ionicons name="warning" size={16} color="#fff" style={{ position: 'absolute', right: 16 }} />
        <Text style={styles.sosText}>🚨 نداء طوارئ</Text>
      </TouchableOpacity>
    </View>
  );

  // Tabs array typed as Tab[] to avoid string assignment errors
  const tabs: Tab[] = ['Orders', 'Wallet', 'Profile'];

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onRefresh} style={styles.iconBtn}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.availableToggle}>
          <Text style={styles.availableText}>
            {available ? 'متاح' : 'غير متاح'}
          </Text>
          <Switch
            value={available}
            onValueChange={toggleAvailable}
            thumbColor="#fff"
            trackColor={{ true: COLORS.success, false: COLORS.danger }}
          />
        </View>
      </View>

      {/* Content */}
      {activeTab === 'Orders' && (
        loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.emptyText, { marginTop: 16 }]}>جارٍ تحميل الطلبات...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="document-text-outline" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>لا توجد طلبات متاحة حالياً</Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={o => o._id}
            renderItem={renderOrder}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )
      )}
      {activeTab === 'Wallet' && <WalletScreen />}
      {activeTab === 'Profile' && <ProfileScreen />}

      {/* Bottom Navbar */}
      <View style={styles.navbar}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.navItem,
              activeTab === tab && styles.navItemActive,
            ]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={
                tab === 'Orders'
                  ? 'list'
                  : tab === 'Wallet'
                  ? 'wallet'
                  : 'person'
              }
              size={24}
              color={activeTab === tab ? COLORS.primary : COLORS.gray}
            />
            <Text
              style={[
                styles.navLabel,
                activeTab === tab && styles.navLabelActive,
              ]}
            >
              {tab === 'Orders'
                ? 'طلباتي'
                : tab === 'Wallet'
                ? 'محفظتي'
                : 'حسابي'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconBtn: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  availableToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
  },
  availableText: {
    color: '#fff',
    marginRight: 12,
    fontSize: 16,
    fontFamily: 'Cairo-Bold',
    fontWeight: '600',
  },
  list: {
    padding: 20,
    paddingBottom: 100
  },
  orderCard: {
    backgroundColor: COLORS.background,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  orderId: {
    fontFamily: 'Cairo-Bold',
    fontSize: 18,
    color: COLORS.blue,
    marginBottom: 8
  },
  orderText: {
    fontFamily: 'Cairo-Regular',
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  orderPrice: {
    fontFamily: 'Cairo-Bold',
    fontSize: 16,
    color: COLORS.primary,
    marginTop: 8,
  },
  completeBtn: {
    marginTop: 16,
    backgroundColor: COLORS.success,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  completeText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Cairo-Bold',
    fontSize: 16,
    fontWeight: '600',
  },
  sosBtn: {
    marginTop: 12,
    backgroundColor: COLORS.danger,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sosText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Cairo-Bold',
    fontSize: 14,
    fontWeight: '600',
  },
  navbar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.background,
    paddingBottom: 20,
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  navItemActive: {
    backgroundColor: COLORS.lightGray,
  },
  navLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
    fontFamily: 'Cairo-Regular',
  },
  navLabelActive: {
    color: COLORS.primary,
    fontFamily: 'Cairo-Bold',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: COLORS.gray,
    fontFamily: 'Cairo-Regular',
    marginTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
