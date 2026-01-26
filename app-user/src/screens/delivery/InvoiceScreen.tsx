import COLORS from "@/constants/colors";
import { useCart } from "@/context/CartContext";
import axiosInstance from "@/utils/api/axiosInstance";
import { getOrCreateCartId } from "@/utils/cartId";
import { track } from "@/utils/lib/track";
import { formatMoney } from "@/utils/money";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type RootStackParamList = {
  CartScreen: undefined;
  MyOrdersScreen: undefined;
};

type NavProp = NativeStackNavigationProp<RootStackParamList, "CartScreen">;

const { width } = Dimensions.get("window");

const InvoiceScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { clearCart, totalPrice } = useCart();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { items, scheduledDate, deliveryMode } = route.params as {
    items: any[];
    scheduledDate: string | null; // عدّل هنا!
    deliveryMode: "unified" | "split";
  };

  const currency = "YER"; // Currency for formatting

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [couponCode, setCouponCode] = useState("");
  const [couponInfo, setCouponInfo] = useState<any | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [captainTip, setCaptainTip] = useState<number>(0);
  const [coupon, setCoupon] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "cash">("cash");
  const [loading, setLoading] = useState<boolean>(false);
  const [couponValid, setCouponValid] = useState<boolean | null>(null);

  const animatePress = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [fetchingFee, setFetchingFee] = useState(false);
  const [serverCartTotal, setServerCartTotal] = useState<number | null>(null);
  const [serverGrandTotal, setServerGrandTotal] = useState<number | null>(null);

  // حساب الأسعار
  const { subtotal, subtotalOriginal, promoSavings } = React.useMemo(() => {
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const subtotalOriginal = items.reduce(
      (s, i) => s + (i.originalPrice ?? i.price) * i.quantity,
      0
    );
    const promoSavings = Math.max(0, subtotalOriginal - subtotal);
    return { subtotal, subtotalOriginal, promoSavings };
  }, [items]);

  const discount = couponValid && couponInfo ? (couponInfo.type === "percentage" ? subtotal * (couponInfo.value / 100) : couponInfo.value) : 0;
  const baseTotal = serverGrandTotal ?? subtotal + deliveryFee;
  const total = baseTotal + captainTip - discount;

  useEffect(() => {
    if (!selectedAddressId) return;
    (async () => {
      setFetchingFee(true);
      try {
        const cartId = await getOrCreateCartId();
        const res = await axiosInstance.get("/delivery/cart/fee", {
          params: { addressId: selectedAddressId, deliveryMode, cartId },
        });
        setDeliveryFee(res.data.deliveryFee ?? 0);
        setServerCartTotal(res.data.cartTotal ?? null);
        setServerGrandTotal(res.data.grandTotal ?? null);
      } catch {
        setDeliveryFee(0);
        setServerCartTotal(null);
        setServerGrandTotal(null);
      } finally {
        setFetchingFee(false);
      }
    })();
  }, [selectedAddressId, deliveryMode, items]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // جلب عناوين المستخدم
  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get("/users/address");
        const { addresses: userAddresses, defaultAddressId } = res.data;
        setAddresses(userAddresses);

        if (defaultAddressId) {
          setSelectedAddressId(defaultAddressId);
        } else if (userAddresses.length) {
          setSelectedAddressId(userAddresses[0]._id);
        }
      } catch (err: any) {
        Alert.alert(
          "خطأ",
          "تعذر جلب العناوين: " + (err.response?.data?.message || err.message)
        );
      }
    })();
  }, []);

  const handlePressIn = () => {
    Animated.spring(animatePress, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatePress, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const validateCoupon = async () => {
    if (!coupon.trim()) return;
    try {
      setValidatingCoupon(true);
      const res = await axiosInstance.post("/coupons/validate", {
        code: coupon.trim(),
      });
      setCouponInfo(res.data.coupon);
      setCouponValid(true);
      Alert.alert("تم", "الكوبون صالح وسيتم تطبيقه عند إنشاء الطلب");
    } catch (e: any) {
      setCouponInfo(null);
      setCouponValid(false);
      Alert.alert("خطأ", e.response?.data?.error || "كوبون غير صالح");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleOrder = async () => {
    if (!selectedAddressId) {
      Alert.alert("تنبيه", "يرجى اختيار عنوان التوصيل");
      return;
    }
    if (items.length === 0) {
      Alert.alert("تنبيه", "لا توجد عناصر في السلة");
      return;
    }
    setLoading(true);

    try {
      // الخطوة 1: تجميع المنتجات حسب المتجر
      const grouped = items.reduce((acc, item) => {
        if (!acc[item.storeId]) acc[item.storeId] = [];
        acc[item.storeId].push({
          productId: item.productId || item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          store: item.storeId,
          productType: item.productType || undefined,
        });
        return acc;
      }, {} as Record<string, any[]>);

      // الخطوة 2: إرسال cart/add لكل متجر
      for (const storeId in grouped) {
        await axiosInstance.post("/delivery/cart/add", {
          items: grouped[storeId],
          storeId,
        });
      }

      // الخطوة 3: إرسال الطلب الرئيسي
      const payload = {
        scheduledFor: scheduledDate || null,
        addressId: selectedAddressId,
        notes: notes + (captainTip > 0 ? ` | بقشيش: ${captainTip} ريال` : ""),
        paymentMethod,
        couponCode: couponInfo ? couponCode.trim() : undefined,

        deliveryMode,
        captainTip, // إذا السيرفر يدعمه مباشرة
      };

      const response = await axiosInstance.post("/delivery/order", payload);

      clearCart();
      await track({
        type: "first_order",
        orderId: response.data._id,
        value: total,
      });

      Alert.alert("تم تنفيذ الطلب", `رقم الطلب: ${response.data._id}`, [
        { text: "استمرار" },
        {
          text: "عرض طلباتي",
          onPress: () => navigation.navigate("MyOrdersScreen"),
        },
      ]);
    } catch (err) {
      const error = err as any;
      Alert.alert(
        "خطأ",
        error.response?.data?.message || error.message || "حدث خطأ"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderPriceBreakdown = () => {
    return (
      <View style={styles.priceBreakdown}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>المجموع الجزئي</Text>
          <Text style={styles.priceValue}>
            {formatMoney(subtotal, currency)}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>ريال التوصيل</Text>
          <Text style={styles.priceValue}>
            {formatMoney(deliveryFee, currency)}
          </Text>
        </View>

        {promoSavings > 0 && (
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, styles.savingLabel]}>
              توفير العروض
            </Text>
            <Text style={[styles.priceValue, styles.savingValue]}>
              -{promoSavings.toFixed(1)} ر.ي
            </Text>
          </View>
        )}

        {discount > 0 && (
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, styles.discountText]}>الخصم</Text>
            <Text style={[styles.priceValue, styles.discountText]}>
              -{formatMoney(discount, currency)}
            </Text>
          </View>
        )}

        {captainTip > 0 && (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>بقشيش المندوب</Text>
            <Text style={styles.priceValue}>{captainTip.toFixed(1)} ر.ي</Text>
          </View>
        )}
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primary}
        translucent={false}
      />
      <LinearGradient
        colors={[COLORS.primary, COLORS.primary]}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>تأكيد الطلب</Text>
            <Text style={styles.headerSubtitle}>
              {items.length} منتج • {total.toFixed(1)} ر.ي
            </Text>
          </View>

          <View style={styles.headerBadge}>
            <Ionicons name="receipt" size={20} color={COLORS.primary} />
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {renderHeader()}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: insets.bottom + 160 }, // بدل 120 ثابتة
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* عنوان التوصيل */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>عنوان التوصيل</Text>
          </View>

          {addresses.length === 0 ? (
            <Text style={styles.emptyText}>لا توجد عناوين مسجلة</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.addressesContainer}
            >
              {addresses.map((addr) => (
                <TouchableOpacity
                  key={addr._id}
                  style={[
                    styles.addressCard,
                    selectedAddressId === addr._id && styles.selectedCard,
                  ]}
                  onPress={() => setSelectedAddressId(addr._id)}
                >
                  <View style={styles.addressHeader}>
                    <Text style={styles.addressLabel}>{addr.label}</Text>
                    {selectedAddressId === addr._id && (
                      <MaterialIcons
                        name="check-circle"
                        size={20}
                        color={COLORS.primary}
                      />
                    )}
                  </View>
                  <Text style={styles.addressText}>
                    {addr.street}, {addr.city}
                  </Text>
                  <Text style={styles.addressDetails}>
                    {addr.additionalDetails}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* كوبون الخصم */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pricetag" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>كوبون الخصم</Text>
          </View>

          <View style={styles.couponRow}>
            <TextInput
              style={[
                styles.couponInput,
                couponValid === true && styles.validCoupon,
                couponValid === false && styles.invalidCoupon,
              ]}
              placeholder="أدخل رمز الكوبون"
              placeholderTextColor={COLORS.gray}
              value={coupon}
              onChangeText={(text) => {
                setCoupon(text);
                setCouponValid(null);
              }}
            />
            <TouchableOpacity
              style={styles.validateButton}
              onPress={validateCoupon}
            >
              <Text style={styles.validateButtonText}>تحقق</Text>
            </TouchableOpacity>
          </View>

          {couponValid === true && (
            <View style={styles.couponSuccess}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={COLORS.success}
              />
              <Text style={styles.couponSuccessText}>
                تم تطبيق {couponInfo.type === "percentage" ? `${couponInfo.value}%` : `${couponInfo.value} ريال`} خصم على الطلب
              </Text>
            </View>
          )}
        </View>

        {/* تفاصيل الطلب */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>تفاصيل الطلب</Text>
          </View>

          <View style={styles.itemsContainer}>
            {items.map((item, idx) => {
              const hasStrike =
                item.originalPrice && item.originalPrice > item.price;
              const lineNew = (item.price * item.quantity).toFixed(1);
              const lineOld = hasStrike
                ? (item.originalPrice * item.quantity).toFixed(1)
                : null;

              const percent = hasStrike
                ? Math.round(
                    ((item.originalPrice - item.price) / item.originalPrice) *
                      100
                  )
                : 0;

              return (
                <View
                  key={item.id ? item.id : `item-${idx}`}
                  style={styles.itemRow}
                >
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQuantity}>× {item.quantity}</Text>
                    {hasStrike && (
                      <View style={styles.itemBadge}>
                        <Text style={styles.itemBadgeText}>-{percent}%</Text>
                      </View>
                    )}
                  </View>

                  {hasStrike ? (
                    <View style={styles.itemPriceStack}>
                      <Text style={styles.itemOld}>{lineOld} ر.ي</Text>
                      <Text style={styles.itemNew}>{lineNew} ر.ي</Text>
                    </View>
                  ) : (
                    <Text style={styles.itemNew}>{lineNew} ر.ي</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* تفاصيل السعر */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>تفاصيل الفاتورة</Text>
          </View>
          {renderPriceBreakdown()}
        </View>

        {/* طريقة الدفع */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>طريقة الدفع</Text>
          </View>

          <View style={styles.paymentMethods}>
            {[
              { label: "الدفع عند الاستلام", value: "cash", icon: "cash" },
              { label: "دفع من المحفظة", value: "wallet", icon: "wallet" },
            ].map((m) => (
              <TouchableOpacity
                key={m.value}
                style={[
                  styles.paymentMethod,
                  paymentMethod === m.value && styles.selectedPayment,
                ]}
                onPress={() => setPaymentMethod(m.value as any)}
              >
                <Ionicons
                  name="cash"
                  size={24}
                  color={
                    paymentMethod === m.value ? COLORS.primary : COLORS.gray
                  }
                />
                <Text
                  style={[
                    styles.paymentText,
                    paymentMethod === m.value && styles.selectedPaymentText,
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ملاحظات إضافية */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="create" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>ملاحظات إضافية</Text>
          </View>

          <TextInput
            style={styles.notesInput}
            placeholder="أكتب ملاحظاتك هنا..."
            placeholderTextColor={COLORS.gray}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>

      {/* زر التأكيد */}
      <Animated.View
        style={[
          styles.confirmContainer,
          {
            transform: [{ scale: animatePress }],
            paddingBottom: Math.max(16, insets.bottom + 8), // هامش سفلي ديناميكي
          },
        ]}
      >
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>الإجمالي النهائي</Text>
          <Text style={styles.totalValue}>{total.toFixed(1)} ر.ي</Text>
        </View>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleOrder}
          disabled={loading}
          activeOpacity={0.8}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.confirmButtonText}>تأكيد الطلب</Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color="#fff"
                style={styles.confirmIcon}
              />
            </>
          )}
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  // Header Styles
  headerContainer: {
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  headerTitleContainer: { flex: 1, alignItems: "center" },
  headerTitle: {
    fontFamily: "Cairo-Bold",
    fontSize: 22,
    color: "#FFF",
    textAlign: "center",
  },
  headerSubtitle: {
    fontFamily: "Cairo-Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: 4,
  },
  headerBadge: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 8,
    position: "relative",
  },
  sectionCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Cairo-Bold",
    marginRight: 8,
    color: COLORS.blue,
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.blue,
    marginVertical: 8,
  },
  addressesContainer: {
    paddingVertical: 4,
  },
  addressCard: {
    width: width * 0.75,
    padding: 16,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.blue,
    marginRight: 12,
  },
  selectedCard: {
    borderColor: COLORS.blue,
    backgroundColor: COLORS.background,
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  addressLabel: {
    fontSize: 16,
    color: COLORS.blue,
    fontFamily: "Cairo-Bold",
  },
  addressText: {
    fontSize: 14,
    color: COLORS.blue,
    fontFamily: "Cairo-Regular",
    marginBottom: 2,
  },
  addressDetails: {
    fontSize: 13,
    color: COLORS.blue,
    fontFamily: "Cairo-Regular",
    fontStyle: "italic",
  },
  couponRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  couponInput: {
    flex: 1,
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.blue,
    fontSize: 16,
    color: COLORS.blue,
    fontFamily: "Cairo-Regular",
  },
  validCoupon: {
    borderColor: COLORS.success,
    backgroundColor: "#E8F5E9",
  },
  invalidCoupon: {
    borderColor: COLORS.danger,
    backgroundColor: "#FFEBEE",
  },
  validateButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontFamily: "Cairo-Bold",
    borderRadius: 8,
    marginLeft: 8,
  },
  validateButtonText: {
    color: COLORS.background,
    fontFamily: "Cairo-Bold",
    fontSize: 14,
  },
  couponSuccess: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    padding: 8,
    backgroundColor: COLORS.success,
    borderRadius: 8,
  },
  couponSuccessText: {
    color: COLORS.success,
    fontFamily: "Cairo-Bold",
    marginRight: 4,
    fontSize: 14,
  },

  itemsContainer: {
    marginTop: 8,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.blue,
  },
  itemInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemName: {
    fontSize: 15,
    color: COLORS.blue,
    fontFamily: "Cairo-Regular",
    marginRight: 8,
  },
  itemQuantity: {
    fontSize: 14,
    color: COLORS.blue,
    fontFamily: "Cairo-Regular",
  },
  itemPriceStack: {
    alignItems: "flex-end",
  },
  itemOld: {
    fontSize: 13,
    color: COLORS.blue,
    fontFamily: "Cairo-Regular",
    textDecorationLine: "line-through",
    textAlign: "right",
  },
  itemNew: {
    fontSize: 15,
    fontFamily: "Cairo-Bold",
    color: COLORS.blue,
    textAlign: "right",
  },
  itemBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 6,
  },
  itemBadgeText: {
    fontSize: 12,
    color: COLORS.blue,
    fontFamily: "Cairo-Bold",
    fontWeight: "700",
  },
  priceBreakdown: {
    marginTop: 8,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.blue,
    fontFamily: "Cairo-Regular",
  },
  priceValue: {
    fontSize: 14,
    fontFamily: "Cairo-Bold",
    color: COLORS.blue,
  },
  discountText: {
    color: COLORS.success,
    fontFamily: "Cairo-Bold",
  },
  savingLabel: { color: COLORS.success },
  savingValue: { color: COLORS.success, fontFamily: "Cairo-Bold" },
  paymentMethods: {
    marginTop: 8,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.blue,
    marginBottom: 8,
  },
  selectedPayment: {
    borderColor: COLORS.blue,
    backgroundColor: COLORS.background,
  },
  paymentText: {
    fontSize: 15,
    color: COLORS.blue,
    fontFamily: "Cairo-Regular",
    marginLeft: 8,
  },
  selectedPaymentText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  notesInput: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    fontFamily: "Cairo-Regular",
    textAlignVertical: "top",
    textAlign: "right",
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.blue,
  },
  confirmContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,

    backgroundColor: COLORS.background,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.blue,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: COLORS.blue,
    fontFamily: "Cairo-Regular",
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 18,
    fontFamily: "Cairo-Bold",
    color: COLORS.blue,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonText: {
    color: COLORS.background,
    fontFamily: "Cairo-Bold",
    fontSize: 16,
  },
  confirmIcon: {
    marginLeft: 8,
  },
});

export default InvoiceScreen;
