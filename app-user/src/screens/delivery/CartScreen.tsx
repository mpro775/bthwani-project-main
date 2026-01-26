import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CartItem, useCart } from "../../context/CartContext";

// ✅ المكتبة الجديدة للـ Safe Area
import { useSafeAreaInsets } from "react-native-safe-area-context";

import RadioGroup from "@/components/RadioGroup";
import ScheduledDeliveryPicker from "@/components/ScheduledDeliveryPicker";

import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";
import { getAuthBanner } from "@/guards/bannerGateway";
type RootStackParamList = {
  CartScreen: undefined;
  InvoiceScreen: {
    items: any[];
    scheduledDate: string | null;
    deliveryMode: "unified" | "split";
    notes: string;
  };
  MyOrdersScreen: undefined;
};

type NavProp = NativeStackNavigationProp<RootStackParamList, "CartScreen">;

const CartScreen = () => {
  const insets = useSafeAreaInsets(); // ✅ حواف الجهاز
  const { width: screenWidth } = Dimensions.get("window");
  const { items, updateQuantity, removeFromCart, totalPrice, totalQuantity } =
    useCart();
  const [note, setNote] = useState("");
  const { isLoggedIn, authReady } = useAuth();

  // Layout configuration
  const containerPadding = 16;
  const contentMaxWidth = screenWidth - 32;
  const cardRadius = 12;

  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const cartItems = items || [];
  const [deliveryMode, setDeliveryMode] = useState<"unified" | "split">(
    "split"
  );
  const storeIds = [
    ...new Set(cartItems.map((item: any) => item.storeId?.toString())),
  ];

  const navigation = useNavigation<NavProp>();

  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const animatePress = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 3,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    });
  };

  const confirmRemove = (item: CartItem) => {
    Alert.alert("حذف المنتج", "هل أنت متأكد من حذف هذا المنتج؟", [
      { text: "إلغاء", style: "cancel", onPress: () => animatePress() },
      {
        text: "نعم",
        onPress: () => {
          removeFromCart(item.id, item.storeId, item.productType);
          animatePress();
        },
      },
    ]);
  };

  const renderItem = ({ item }: any) => (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>

        <View style={styles.priceContainer}>
          {item.originalPrice && item.originalPrice > item.price && (
            <Text style={styles.originalPrice}>
              {item.originalPrice.toFixed(1)} ر.ي
            </Text>
          )}
          <Text style={styles.price}>{item.price.toFixed(1)} ر.ي</Text>

          {item.originalPrice && item.originalPrice > item.price && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                -
                {Math.round(
                  ((item.originalPrice - item.price) / item.originalPrice) * 100
                )}
                %
              </Text>
            </View>
          )}
        </View>

        {/* إجمالي السطر */}
        <View style={styles.lineTotalRow}>
          {item.originalPrice && item.originalPrice > item.price ? (
            <>
              <Text style={styles.lineTotalOld}>
                {(item.originalPrice * item.quantity).toFixed(1)} ر.ي
              </Text>
              <Text style={styles.lineTotalNew}>
                {(item.price * item.quantity).toFixed(1)} ر.ي{" "}
              </Text>
            </>
          ) : (
            <Text style={styles.lineTotalNew}>
              {(item.price * item.quantity).toFixed(1)} ر.ي
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => confirmRemove(item)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash" size={20} color={COLORS.primary} />
          </TouchableOpacity>

          <View style={styles.quantityControl}>
            <TouchableOpacity
              onPress={() =>
                updateQuantity(
                  item.id,
                  item.storeId,
                  item.productType,
                  Math.max(1, item.quantity - 1)
                )
              }
              style={styles.quantityButton}
            >
              <Ionicons name="remove" size={18} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.quantity}>{item.quantity}</Text>

            <TouchableOpacity
              onPress={() =>
                updateQuantity(
                  item.id,
                  item.storeId,
                  item.productType,
                  item.quantity + 1
                )
              }
              style={styles.quantityButton}
            >
              <Ionicons name="add" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );

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
            <Text style={styles.headerTitle}>سلة التسوق</Text>
            {items.length > 0 && (
              <Text style={styles.headerSubtitle}>
                {totalQuantity} منتج • {totalPrice.toFixed(1)} ر.ي
              </Text>
            )}
          </View>

          <View style={styles.headerBadge}>
            <Ionicons name="cart" size={20} color={COLORS.primary} />
            {items.length > 0 && (
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>{totalQuantity}</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderNoteSection = () => (
    <View style={styles.noteSection}>
      <Text style={styles.noteLabel}>ملاحظة على الطلب (خدمة على طريقي):</Text>
      <TextInput
        style={styles.noteInput}
        placeholder="مثلاً: أريد ماء بارد، أحتاج كيس ثلج..."
        value={note}
        onChangeText={setNote}
        multiline
        numberOfLines={3}
      />
    </View>
  );

  const renderDeliveryOptions = () =>
    storeIds.length > 1 && (
      <View style={styles.deliverySection}>
        <Text style={styles.sectionTitle}>اختر نوع التوصيل:</Text>
        <RadioGroup
          options={[
            { label: "توصيل موحد (مندوب واحد)", value: "unified" },
            { label: "توصيل منفصل لكل متجر", value: "split" },
          ]}
          selectedValue={deliveryMode}
          onChange={setDeliveryMode}
        />
      </View>
    );

  return (
    <View style={styles.container}>
      {renderHeader()}

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons
              name="cart-outline"
              size={80}
              color={COLORS.primary}
              opacity={0.3}
            />
          </View>
          <Text style={styles.emptyTitle}>سلتك فارغة</Text>
          <Text style={styles.emptySubtitle}>
            ابدأ بإضافة المنتجات إلى سلتك
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.shopButtonText}>تسوق الآن</Text>
            <Ionicons name="storefront" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item, index) =>
              item.id ? item.id.toString() : `cart_item_${index}`
            }
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <View>
                {renderNoteSection()}
                {renderDeliveryOptions()}
                <ScheduledDeliveryPicker
                  onChange={(date) => setScheduledDate(date)}
                />
              </View>
            }
          />

          {/* ✅ Footer مع مراعاة الحافة السفلية */}
          <LinearGradient
            colors={["rgba(255,245,242,0.9)", "rgba(255,245,242,1)"]}
            style={[styles.footer, { paddingBottom: 24 + insets.bottom }]}
          >
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => {
                // لو الأوث جاهز والمستخدم غير مسجّل → اعرض بانر وسكّر
                if (authReady && !isLoggedIn) {
                  getAuthBanner()?.show("login");
                  return;
                }

                // خلاف ذلك، كمّل بشكل طبيعي
                navigation.navigate("InvoiceScreen", {
                  items: items.map((i) => ({
                    id: i.id || i.productId,
                    productId: i.productId,
                    name: i.name,
                    price: i.price,
                    quantity: i.quantity,
                    productType: i.productType,
                    storeId: i.storeId || i.store,
                    storeType: i.storeType,
                    image:
                      typeof i.image === "string"
                        ? i.image
                        : i.image?.uri || undefined,
                    originalPrice: i.originalPrice,
                  })),
                  scheduledDate: scheduledDate
                    ? scheduledDate.toISOString()
                    : null,
                  deliveryMode,
                  // ✅ مرّر ملاحظة الطلب
                  notes: note?.trim() || "",
                });
              }}
              activeOpacity={0.9}
            >
              <View style={styles.checkoutContent}>
                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>المتابعة للدفع</Text>
                  <Text style={styles.totalPrice}>
                    {totalPrice.toFixed(1)} ر.ي
                  </Text>
                </View>
                <View style={styles.checkoutBadge}>
                  <Ionicons name="arrow-forward" size={24} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
          </LinearGradient>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  discountBadge: {
    backgroundColor: "rgba(216,67,21,0.12)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "center",
  },
  discountText: {
    fontFamily: "Cairo-Bold",
    fontSize: 12,
    color: COLORS.primary,
  },
  lineTotalRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  lineTotalOld: {
    fontFamily: "Cairo-Regular",
    fontSize: 13,
    color: "#999",
    textDecorationLine: "line-through",
  },
  lineTotalNew: { fontFamily: "Cairo-Bold", fontSize: 15, color: COLORS.text },

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
  badgeCount: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeCountText: { color: "#fff", fontSize: 12, fontWeight: "bold" },

  // Note Section Styles
  noteSection: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  noteLabel: {
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    color: COLORS.blue,
    marginBottom: 8,
  },
  noteInput: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    fontFamily: "Cairo-Regular",
    borderWidth: 1,
    borderColor: "#e9ecef",
    fontSize: 14,
    textAlignVertical: "top",
    minHeight: 80,
  },

  // Delivery Section Styles
  deliverySection: {
    backgroundColor: "#fff",
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
    marginBottom: 12,
  },

  // Empty State Styles
  emptyIconContainer: { alignItems: "center", marginBottom: 20 },
  emptyTitle: {
    fontSize: 24,
    fontFamily: "Cairo-Bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: "Cairo-Regular",
    color: COLORS.blue,
    textAlign: "center",
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  shopButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Cairo-Bold",
    marginRight: 8,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: "hidden",
  },
  image: { width: 100, height: 100, resizeMode: "cover" },
  details: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  name: {
    fontFamily: "Cairo-Bold",
    fontSize: 16,
    color: COLORS.blue,
    marginBottom: 8,
  },

  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 12,
  },
  price: { fontFamily: "Cairo-Bold", fontSize: 18, color: COLORS.primary },
  originalPrice: {
    fontFamily: "Cairo-Regular",
    fontSize: 14,
    color: "#999",
    textDecorationLine: "line-through",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deleteButton: { padding: 8 },

  quantityControl: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 6,
  },
  quantityButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    padding: 6,
  },
  quantity: {
    fontFamily: "Cairo-SemiBold",
    fontSize: 16,
    color: "#fff",
    minWidth: 30,
    textAlign: "center",
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    // ✅ paddingBottom يُضبط ديناميكيًا بالـ insets في JSX
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  checkoutContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  totalContainer: { flexDirection: "column", alignItems: "flex-end" },
  totalLabel: {
    fontFamily: "Cairo-Regular",
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
  totalPrice: { fontFamily: "Cairo-Bold", fontSize: 24, color: "#fff" },
  checkoutBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  badgeText: { fontFamily: "Cairo-Bold", fontSize: 18, color: "#fff" },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  emptyText: { fontFamily: "Cairo-SemiBold", fontSize: 18, color: "#ccc" },
  listContent: { paddingHorizontal: 16, paddingBottom: 150 },
});

export default CartScreen;
