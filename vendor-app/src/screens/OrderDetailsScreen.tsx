import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { useUser } from '../hooks/userContext';
const { width } = Dimensions.get('window');

// Enhanced color palette
const ENHANCED_COLORS = {
  ...COLORS,
  cardBg: '#FFFFFF',
  cardShadow: 'rgba(0, 0, 0, 0.08)',
  sectionBg: '#F8F9FA',
  borderLight: '#E8EAED',
  successLight: '#E8F5E9',
  warningLight: '#FFF3E0',
  errorLight: '#FFEBEE',
  infoLight: '#E3F2FD',
  gradientStart: '#6366F1',
  gradientEnd: '#8B5CF6',
};

// Define the order type
type Order = {
  _id: string;
  status: string;
  createdAt?: string;
  items?: any[];
  total?: number;
  customer?: {
    name?: string;
    phone?: string;
    address?: string;
  };
  [key: string]: any;
};

const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    "pending_confirmation": "بانتظار التأكيد",
    "under_review": "قيد المراجعة",
    "preparing": "قيد التحضير",
    "out_for_delivery": "في الطريق",
    "delivered": "تم التوصيل",
    "returned": "تم الإرجاع",
    "cancelled": "ملغي"
  };
  return statusMap[status] || status;
};

const getStatusConfig = (status: string) => {
  const configs: { [key: string]: { color: string; bgColor: string; icon: string } } = {
    "pending_confirmation": { 
      color: "#F59E0B", 
      bgColor: "#FEF3C7", 
      icon: "time-outline" 
    },
    "under_review": { 
      color: "#3B82F6", 
      bgColor: "#DBEAFE", 
      icon: "document-text-outline" 
    },
    "preparing": { 
      color: "#8B5CF6", 
      bgColor: "#EDE9FE", 
      icon: "restaurant-outline" 
    },
    "out_for_delivery": { 
      color: "#10B981", 
      bgColor: "#D1FAE5", 
      icon: "car-outline" 
    },
    "delivered": { 
      color: "#059669", 
      bgColor: "#D1FAE5", 
      icon: "checkmark-circle-outline" 
    },
    "returned": { 
      color: "#7C3AED", 
      bgColor: "#EDE9FE", 
      icon: "arrow-undo-outline" 
    },
    "cancelled": { 
      color: "#EF4444", 
      bgColor: "#FEE2E2", 
      icon: "close-circle-outline" 
    }
  };
  
  return configs[status] || { 
    color: "#6B7280", 
    bgColor: "#F3F4F6", 
    icon: "help-circle-outline" 
  };
};

const AnimatedCard: React.FC<{ children: React.ReactNode; delay?: number }> = ({ 
  children, 
  delay = 0 
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

// Helpers
const toNum = (v: any) => (v === null || v === undefined || v === "" ? 0 : Number(v));

const getUnitPrice = (item: any) => {
  // عندك unitPrice موثوق من الباك (بعد الخصم)
  return toNum(item.unitPrice);
};

const getLineTotal = (item: any) => {
  const qty = Math.max(1, toNum(item.quantity));
  return getUnitPrice(item) * qty;
};

const OrderDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProp<any, any>>();
  const { user } = useUser();
  const order: Order = route.params?.order;

  if (!order) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={80} color={ENHANCED_COLORS.textSecondary} />
        <Text style={styles.emptyText}>لا توجد بيانات لهذا الطلب</Text>
      </View>
    );
  }

  // اختَر subOrder خاص بمتجرك
  const mySub =
    order?.subOrders?.find(
      (s: any) =>
        String(s.store) === String(user?.storeId) ||
        String(s?.store?._id) === String(user?.storeId)
    ) || order?.subOrders?.[0]; // fallback لو لم يوجد

  // عناصر الطلب (أفضلية لعناصر subOrder الخاص بالمتجر)
  const items = mySub?.items || order?.items || [];

  // الحالة (أفضلية لحالة subOrder الخاص بالمتجر)
  const status = mySub?.status || order?.status;

  // احسب المجاميع الصحيحة
  const lineItems = mySub?.items || order?.items || [];
  const itemsSubtotal = lineItems.reduce((sum: number, it: any) => sum + getLineTotal(it), 0);
  const delivery = toNum(order?.deliveryFee); // رسوم التوصيل
  const grandTotal = itemsSubtotal + delivery;

  const statusConfig = getStatusConfig(status);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Enhanced Header */}
      <LinearGradient 
        colors={[COLORS.primary, COLORS.primary]} 
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>تفاصيل الطلب</Text>
            <View style={styles.orderNumberBadge}>
              <Text style={styles.orderNumber}>#{order._id?.slice(-6)}</Text>
            </View>
          </View>
          
          {/* Status Badge in Header */}
          <View style={[styles.headerStatusBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Ionicons name={statusConfig.icon as any} size={18} color="white" />
            <Text style={styles.headerStatusText}>{getStatusText(status)}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Order Status Card */}
        <AnimatedCard delay={100}>
          <View style={styles.statusCard}>
            <View style={[styles.statusIconContainer, { backgroundColor: statusConfig.bgColor }]}>
              <Ionicons name={statusConfig.icon as any} size={32} color={statusConfig.color} />
            </View>
            <Text style={[styles.statusTitle, { color: statusConfig.color }]}>
              {getStatusText(status)}
            </Text>
            {order.createdAt && (
              <Text style={styles.statusDate}>
                {new Date(order.createdAt).toLocaleDateString('ar-SA', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            )}
          </View>
        </AnimatedCard>

        
        {/* Order Items */}
        <AnimatedCard delay={300}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cart-outline" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>المنتجات</Text>
          </View>
          
          {items.length > 0 ? (
            <View style={styles.itemsContainer}>
              {items.map((item: any, idx: number) => (
                <View key={idx} style={[
                  styles.itemCard,
                  idx === items.length - 1 && styles.lastItemCard
                ]}>
                  <View style={styles.itemIconContainer}>
                    <Ionicons name="cube" size={24} color={COLORS.primary} />
                  </View>
                  
                  <View style={styles.itemContent}>
                    <Text style={styles.itemName}>
                      {item.details?.name || item.product?.name || item.name || 'منتج'}
                    </Text>
                    <View style={styles.itemMeta}>
                      <View style={styles.quantityBadge}>
                        <Text style={styles.quantityText}>
                          x{(() => {
                            const qty = Math.max(1, toNum(item.quantity));
                            return qty;
                          })()}
                        </Text>
                      </View>
                      <View style={styles.priceContainer}>
                        <Text style={styles.itemPrice}>
                          {(() => {
                            const lineTotal = getLineTotal(item);
                            return lineTotal.toLocaleString('ar-SA');
                          })()} ريال
                        </Text>
                        {(() => {
                          const unit = getUnitPrice(item);
                          return unit > 0 && (
                            <Text style={styles.unitPrice}>
                              ({unit.toLocaleString('ar-SA')} للوحدة)
                            </Text>
                          );
                        })()}
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyItems}>
              <Ionicons name="cart-outline" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyItemsText}>لا توجد منتجات في هذا الطلب</Text>
            </View>
          )}
        </AnimatedCard>

        {/* Invoice Summary */}
        <AnimatedCard delay={400}>
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cash-outline" size={24} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>ملخص الفاتورة</Text>
            </View>

            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between' }}>
                <Text style={styles.infoLabel}>مجموع السلع</Text>
                <Text style={styles.infoValue}>{itemsSubtotal.toLocaleString('ar-SA')} ريال</Text>
              </View>

              <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between' }}>
                <Text style={styles.infoLabel}>رسوم التوصيل</Text>
                <Text style={styles.infoValue}>{delivery.toLocaleString('ar-SA')} ريال</Text>
              </View>

              <View style={{ height: 1, backgroundColor: ENHANCED_COLORS.borderLight, marginVertical: 6 }} />

              <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between' }}>
                <Text style={[styles.infoValue, { fontSize: 18 }]}>الإجمالي</Text>
                <Text style={[styles.infoValue, { fontSize: 18 }]}>
                  {grandTotal.toLocaleString('ar-SA')} ريال
                </Text>
              </View>
            </View>
          </View>
        </AnimatedCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    fontFamily: 'Cairo-Regular',
    marginTop: 16,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 20 : StatusBar.currentHeight || 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    color: 'white',
    fontFamily: 'Cairo-Bold',
  },
  orderNumberBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  orderNumber: {
    color: 'white',
    fontFamily: 'Cairo-Bold',
    fontSize: 14,
  },
  headerStatusBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  headerStatusText: {
    color: 'white',
    fontFamily: 'Cairo-Bold',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: ENHANCED_COLORS.cardBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: ENHANCED_COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  statusCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  statusIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 20,
    fontFamily: 'Cairo-Bold',
    marginBottom: 4,
  },
  statusDate: {
    fontSize: 14,
    color: ENHANCED_COLORS.textSecondary,
    fontFamily: 'Cairo-Regular',
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    color: ENHANCED_COLORS.text,
    fontFamily: 'Cairo-Bold',
  },
  infoGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
    minWidth: (width - 64) / 2,
    backgroundColor: ENHANCED_COLORS.sectionBg,
    padding: 12,
    borderRadius: 12,
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: ENHANCED_COLORS.textSecondary,
    fontFamily: 'Cairo-Regular',
    marginTop: 4,
  },
  infoValue: {
    fontSize: 15,
    color: ENHANCED_COLORS.text,
    fontFamily: 'Cairo-Bold',
  },
  phoneNumber: {
    writingDirection: 'ltr' as any,
    textAlign: 'left',
  },
  addressContainer: {
    backgroundColor: ENHANCED_COLORS.sectionBg,
    padding: 12,
    borderRadius: 12,
  },
  addressHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 15,
    color: ENHANCED_COLORS.text,
    fontFamily: 'Cairo-Regular',
    lineHeight: 24,
  },
  itemsContainer: {
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row-reverse',
    backgroundColor: ENHANCED_COLORS.sectionBg,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  lastItemCard: {
    marginBottom: 0,
  },
  itemIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
    gap: 6,
  },
  itemName: {
    fontSize: 16,
    color: ENHANCED_COLORS.text,
    fontFamily: 'Cairo-Bold',
    textAlign: 'right',
  },
  itemMeta: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityBadge: {
    backgroundColor: ENHANCED_COLORS.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  quantityText: {
    fontSize: 14,
    color: ENHANCED_COLORS.primary,
    fontFamily: 'Cairo-Bold',
  },
  itemPrice: {
    fontSize: 16,
    color: ENHANCED_COLORS.primary,
    fontFamily: 'Cairo-Bold',
  },
  priceContainer: {
    alignItems: 'flex-end',
    gap: 2,
  },
  unitPrice: {
    fontSize: 12,
    color: ENHANCED_COLORS.textSecondary,
    fontFamily: 'Cairo-Regular',
    opacity: 0.8,
  },
  emptyItems: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyItemsText: {
    fontSize: 16,
    color: ENHANCED_COLORS.textSecondary,
    fontFamily: 'Cairo-Regular',
    marginTop: 12,
  },
  totalCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Cairo-Regular',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 32,
    color: 'white',
    fontFamily: 'Cairo-Bold',
  },
});

export default OrderDetailsScreen;