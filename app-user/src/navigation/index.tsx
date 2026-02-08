// AppNavigation.tsx
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import {
  DrawerContentComponentProps,
  DrawerItemList,
} from "@react-navigation/drawer";
import {
  DefaultTheme,
  NavigationContainer,
  useNavigation,
  useNavigationState,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

// ===================== الشاشات =====================
import ForgotPasswordScreen from "@/screens/Auth/ForgotPasswordScreen";
import LoginScreen from "@/screens/Auth/LoginScreen";
import OTPVerificationScreen from "@/screens/Auth/OTPVerificationScreen";
import RegisterScreen from "@/screens/Auth/RegisterScreen";
import ResetNewPasswordScreen from "@/screens/Auth/ResetNewPasswordScreen";
import ResetVerifyScreen from "@/screens/Auth/ResetVerifyScreen";
import OnboardingScreen from "@/screens/OnboardingScreen";

import DeliveryAddressesScreen from "@/screens/profile/DeliveryAddressesScreen";
import EditProfileScreen from "@/screens/profile/EditProfileScreen";
import ProfileScreen from "@/screens/profile/UserProfileScreen";
import WalletScreen from "@/screens/delivery/WalletScreen";
import TopupScreen from "@/screens/wallet/TopupScreen";
import WithdrawalScreen from "@/screens/wallet/WithdrawalScreen";
import TransferScreen from "@/screens/wallet/TransferScreen";
import PayBillScreen from "@/screens/wallet/PayBillScreen";
import RefundRequestScreen from "@/screens/wallet/RefundRequestScreen";
import TransactionDetailsScreen from "@/screens/wallet/TransactionDetailsScreen";

import AkhdimniScreen from "@/screens/delivery/AkhdimniScreen";
import AkhdimniOptionsScreen from "@/screens/delivery/AkhdimniOptionsScreen";
import BusinessDetailsScreen from "@/screens/delivery/BusinessDetailsScreen";
import CartScreen from "@/screens/delivery/CartScreen";
import CategoryDetailsScreen from "@/screens/delivery/CategoryDetailsScreen";
import DeliveryHomeScreen from "@/screens/delivery/DeliveryHomeScreen";
import GroceryMainScreen from "@/screens/delivery/GroceryScreen";
import InvoiceScreen from "@/screens/delivery/InvoiceScreen";
import MyOrdersScreen from "@/screens/delivery/MyOrdersScreen";
import OrderDetailsScreen from "@/screens/delivery/OrderDetailsScreen";
import CommonProductDetailsScreen from "@/screens/delivery/ProductDetailsScreen";
import UtilityGasScreen from "@/screens/delivery/UtilityGasScreen";
import UtilityWaterScreen from "@/screens/delivery/UtilityWaterScreen";

// المعروف (Lost & Found)
import MaaroufListScreen from "@/screens/maarouf/MaaroufListScreen";
import MaaroufCreateScreen from "@/screens/maarouf/MaaroufCreateScreen";
import MaaroufDetailsScreen from "@/screens/maarouf/MaaroufDetailsScreen";
import MaaroufEditScreen from "@/screens/maarouf/MaaroufEditScreen";
import {
  MaaroufChatListScreen,
  MaaroufChatScreen,
} from "@/screens/maarouf-chat";

// السند (Services + Emergency + Charity)
import SanadListScreen from "@/screens/sanad/SanadListScreen";
import SanadCreateScreen from "@/screens/sanad/SanadCreateScreen";
import SanadDetailsScreen from "@/screens/sanad/SanadDetailsScreen";
import SanadEditScreen from "@/screens/sanad/SanadEditScreen";

// الأماني (Women's Transportation)
import AmaniListScreen from "@/screens/amani/AmaniListScreen";
import AmaniCreateScreen from "@/screens/amani/AmaniCreateScreen";
import AmaniDetailsScreen from "@/screens/amani/AmaniDetailsScreen";
import AmaniEditScreen from "@/screens/amani/AmaniEditScreen";

// العربون (Deposits)
import ArabonListScreen from "@/screens/arabon/ArabonListScreen";
import ArabonMyListScreen from "@/screens/arabon/ArabonMyListScreen";
import ArabonMyBookingsScreen from "@/screens/arabon/ArabonMyBookingsScreen";
import ArabonSearchScreen from "@/screens/arabon/ArabonSearchScreen";
import ArabonCreateScreen from "@/screens/arabon/ArabonCreateScreen";
import ArabonDetailsScreen from "@/screens/arabon/ArabonDetailsScreen";
import ArabonEditScreen from "@/screens/arabon/ArabonEditScreen";
import ArabonBookScreen from "@/screens/arabon/ArabonBookScreen";

// الكوادر (Professional Services)
import KawaderListScreen from "@/screens/kawader/KawaderListScreen";
import KawaderCreateScreen from "@/screens/kawader/KawaderCreateScreen";
import KawaderDetailsScreen from "@/screens/kawader/KawaderDetailsScreen";
import KawaderEditScreen from "@/screens/kawader/KawaderEditScreen";
import {
  KawaderChatListScreen,
  KawaderChatScreen,
} from "@/screens/kawader-chat";

// كنز (Marketplace)
import KenzListScreen from "@/screens/kenz/KenzListScreen";
import KenzFavoritesScreen from "@/screens/kenz/KenzFavoritesScreen";
import KenzDealsScreen from "@/screens/kenz/KenzDealsScreen";
import KenzCreateScreen from "@/screens/kenz/KenzCreateScreen";
import KenzDetailsScreen from "@/screens/kenz/KenzDetailsScreen";
import KenzEditScreen from "@/screens/kenz/KenzEditScreen";
import { KenzChatListScreen, KenzChatScreen } from "@/screens/kenz-chat";

// اسعفني (Emergency Blood Donation)
import Es3afniListScreen from "@/screens/es3afni/Es3afniListScreen";
import Es3afniCreateScreen from "@/screens/es3afni/Es3afniCreateScreen";
import Es3afniDetailsScreen from "@/screens/es3afni/Es3afniDetailsScreen";
import Es3afniEditScreen from "@/screens/es3afni/Es3afniEditScreen";

import { AuthProvider, useAuth } from "@/auth/AuthContext";
import MyFavoritesScreen from "@/screens/FavoritesScreen";
import HowToUseScreen from "@/screens/help/HowToUseScreen";
import SupportScreen from "@/screens/help/SupportScreen";
import SelectLocationScreen from "@/screens/map/SelectLocationScreen";
import SubscriptionsScreen from "@/screens/subscriptions/SubscriptionsScreen";
import ServicesHomeScreen from "@/screens/ServicesHomeScreen";
import { getUserProfile } from "@/storage/userStorage";
import DeliverySearchStack from "./DeliverySearchStack";
import { navigationRef, onNavReady } from "./RootNavigation"; // عدّل المسار حسب مشروعك

// ===================== إعدادات عامة =====================
const BRAND = { primary: "#ff500d", dark: "#0a2f5c", muted: "#9aa6b2" };
const SCREEN_W = Dimensions.get("window").width;

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#ffffff",
  },
};

// ===================== الأنواع =====================
type TabName = "ServicesHome" | "MyOrders" | "MyFavorites" | "ProfileTab";
type TabParamList = {
  ServicesHome: undefined;
  MyOrders: undefined;
  MyFavorites: undefined;
  ProfileTab: undefined;
};

const LABELS: Record<TabName, string> = {
  ServicesHome: "الخدمات",
  MyOrders: "طلباتي",
  MyFavorites: "المفضلة",
  ProfileTab: "حسابي",
};

// ===================== أيقونات التبويبات =====================
const iconFor = (name: TabName, focused: boolean, color: string, size = 24) => {
  switch (name) {
    case "ServicesHome":
      return (
        <Ionicons
          name={focused ? "grid" : "grid-outline"}
          size={size}
          color={color}
        />
      );
    case "MyOrders":
      return (
        <MaterialCommunityIcons
          name={focused ? "clipboard-list" : "clipboard-list-outline"}
          size={size}
          color={color}
        />
      );
    case "MyFavorites":
      return (
        <Ionicons
          name={focused ? "heart" : "heart-outline"}
          size={size}
          color={color}
        />
      );
    case "ProfileTab":
      return (
        <Ionicons
          name={focused ? "person" : "person-outline"}
          size={size}
          color={color}
        />
      );
  }
};

// ===================== HOC (لا حاجة لبادينج الآن) =====================
const withTabPadding = (Comp: React.ComponentType<any>) => (props: any) =>
  (
    <View style={{ flex: 1 }}>
      <Comp {...props} />
    </View>
  );
const ServicesHomeWithPad = withTabPadding(ServicesHomeScreen);
const MyOrdersWithPad = withTabPadding(MyOrdersScreen);
const MyFavsWithPad = withTabPadding(MyFavoritesScreen);
const ProfileWithPad = withTabPadding(ProfileScreen);

// ===================== Drawer =====================
const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { navigation } = props;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const user = await getUserProfile();
        if (user?.fullName) {
          setIsLoggedIn(true);
          setUserName(user.fullName);
        }
      } catch (error) {
        console.warn("لم يتم استرجاع المستخدم:", error);
      }
    };
    checkLogin();
  }, []);

  return (
    <ScrollView contentContainerStyle={{ paddingTop: 40, paddingBottom: 20 }}>
      <View style={{ alignItems: "center", paddingVertical: 24 }}>
        <Image
          source={require("../../assets/avatar.png")}
          style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 8 }}
        />
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Cairo-SemiBold",
            color: "#3E2723",
          }}
        >
          {isLoggedIn ? `مرحبًا ${userName}` : "أنت غير مسجل الدخول"}
        </Text>
        {!isLoggedIn && (
          <TouchableOpacity
            style={{
              marginTop: 8,
              backgroundColor: BRAND.primary,
              paddingVertical: 6,
              paddingHorizontal: 16,
              borderRadius: 20,
            }}
            onPress={() => navigation.navigate("Login" as never)}
          >
            <Text style={{ color: "#fff", fontFamily: "Cairo-Bold" }}>
              تسجيل الدخول
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <DrawerItemList {...props} />

      {/* قسم الديلفري */}
      <View style={{ marginTop: 20, paddingHorizontal: 16 }}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Cairo-Bold",
            color: "#666",
            marginBottom: 12,
            textAlign: "right",
          }}
        >
          التوصيل
        </Text>

        <TouchableOpacity
          style={{
            flexDirection: "row-reverse",
            alignItems: "center",
            paddingVertical: 12,
            paddingHorizontal: 16,
            marginBottom: 8,
            borderRadius: 8,
            backgroundColor: "rgba(255, 80, 13, 0.1)",
          }}
          onPress={() => navigation.navigate("DeliveryHome" as never)}
        >
          <Ionicons name="bicycle" size={20} color={BRAND.primary} />
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Cairo-SemiBold",
              color: BRAND.primary,
              marginRight: 12,
              textAlign: "right",
              flex: 1,
            }}
          >
            الديلفري
          </Text>
          <Ionicons name="chevron-back" size={16} color={BRAND.primary} />
        </TouchableOpacity>
      </View>

      {/* قسم الخدمات المجتمعية */}
      <View style={{ marginTop: 20, paddingHorizontal: 16 }}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Cairo-Bold",
            color: "#666",
            marginBottom: 12,
            textAlign: "right",
          }}
        >
          الخدمات المجتمعية
        </Text>

        {/* زر السند */}
        <TouchableOpacity
          style={{
            flexDirection: "row-reverse",
            alignItems: "center",
            paddingVertical: 12,
            paddingHorizontal: 16,
            marginBottom: 8,
            borderRadius: 8,
            backgroundColor: "rgba(255, 80, 13, 0.1)",
          }}
          onPress={() => navigation.navigate("SanadList" as never)}
        >
          <Ionicons name="briefcase-outline" size={20} color={BRAND.primary} />
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Cairo-SemiBold",
              color: BRAND.primary,
              marginRight: 12,
              textAlign: "right",
              flex: 1,
            }}
          >
            سند
          </Text>
          <Ionicons name="chevron-back" size={16} color={BRAND.primary} />
        </TouchableOpacity>

        {/* زر الأماني */}
        <TouchableOpacity
          style={{
            flexDirection: "row-reverse",
            alignItems: "center",
            paddingVertical: 12,
            paddingHorizontal: 16,
            marginBottom: 8,
            borderRadius: 8,
            backgroundColor: "rgba(255, 80, 13, 0.1)",
          }}
          onPress={() => navigation.navigate("AmaniList" as never)}
        >
          <Ionicons name="car-outline" size={20} color={BRAND.primary} />
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Cairo-SemiBold",
              color: BRAND.primary,
              marginRight: 12,
              textAlign: "right",
              flex: 1,
            }}
          >
            أماني
          </Text>
          <Ionicons name="chevron-back" size={16} color={BRAND.primary} />
        </TouchableOpacity>

        {/* زر المعروف */}
        <TouchableOpacity
          style={{
            flexDirection: "row-reverse",
            alignItems: "center",
            paddingVertical: 12,
            paddingHorizontal: 16,
            marginBottom: 8,
            borderRadius: 8,
            backgroundColor: "rgba(255, 80, 13, 0.1)",
          }}
          onPress={() => navigation.navigate("MaaroufList" as never)}
        >
          <Ionicons name="search-outline" size={20} color={BRAND.primary} />
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Cairo-SemiBold",
              color: BRAND.primary,
              marginRight: 12,
              textAlign: "right",
              flex: 1,
            }}
          >
            المعروف
          </Text>
          <Ionicons name="chevron-back" size={16} color={BRAND.primary} />
        </TouchableOpacity>

        {/* زر العربون */}
        <TouchableOpacity
          style={{
            flexDirection: "row-reverse",
            alignItems: "center",
            paddingVertical: 12,
            paddingHorizontal: 16,
            marginBottom: 8,
            borderRadius: 8,
            backgroundColor: "rgba(255, 80, 13, 0.1)",
          }}
          onPress={() => navigation.navigate("ArabonList" as never)}
        >
          <Ionicons name="wallet-outline" size={20} color={BRAND.primary} />
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Cairo-SemiBold",
              color: BRAND.primary,
              marginRight: 12,
              textAlign: "right",
              flex: 1,
            }}
          >
            العربون
          </Text>
          <Ionicons name="chevron-back" size={16} color={BRAND.primary} />
        </TouchableOpacity>

        {/* زر الكوادر */}
        <TouchableOpacity
          style={{
            flexDirection: "row-reverse",
            alignItems: "center",
            paddingVertical: 12,
            paddingHorizontal: 16,
            marginBottom: 8,
            borderRadius: 8,
            backgroundColor: "rgba(255, 80, 13, 0.1)",
          }}
          onPress={() => navigation.navigate("KawaderList" as never)}
        >
          <Ionicons name="people-outline" size={20} color={BRAND.primary} />
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Cairo-SemiBold",
              color: BRAND.primary,
              marginRight: 12,
              textAlign: "right",
              flex: 1,
            }}
          >
            الكوادر
          </Text>
          <Ionicons name="chevron-back" size={16} color={BRAND.primary} />
        </TouchableOpacity>

        {/* زر كنز */}
        <TouchableOpacity
          style={{
            flexDirection: "row-reverse",
            alignItems: "center",
            paddingVertical: 12,
            paddingHorizontal: 16,
            marginBottom: 8,
            borderRadius: 8,
            backgroundColor: "rgba(255, 80, 13, 0.1)",
          }}
          onPress={() => navigation.navigate("KenzList" as never)}
        >
          <Ionicons name="storefront-outline" size={20} color={BRAND.primary} />
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Cairo-SemiBold",
              color: BRAND.primary,
              marginRight: 12,
              textAlign: "right",
              flex: 1,
            }}
          >
            كنز
          </Text>
          <Ionicons name="chevron-back" size={16} color={BRAND.primary} />
        </TouchableOpacity>

        {/* زر اسعفني */}
        <TouchableOpacity
          style={{
            flexDirection: "row-reverse",
            alignItems: "center",
            paddingVertical: 12,
            paddingHorizontal: 16,
            marginBottom: 8,
            borderRadius: 8,
            backgroundColor: "rgba(255, 80, 13, 0.1)",
          }}
          onPress={() => navigation.navigate("Es3afniList" as never)}
        >
          <Ionicons name="heart-outline" size={20} color={BRAND.primary} />
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Cairo-SemiBold",
              color: BRAND.primary,
              marginRight: 12,
              textAlign: "right",
              flex: 1,
            }}
          >
            اسعفني
          </Text>
          <Ionicons name="chevron-back" size={16} color={BRAND.primary} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// ===================== Bottom Tabs + TabBar زجاجي =====================
const Tab = createBottomTabNavigator<TabParamList>();
const TABBAR_HEIGHT = 56; // شريط مدمج
const ICON_SIZE = 24; // أكبر شوي
const LABEL_SIZE = 11;

const GlassTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  // ✅ لم نعد بحاجة لـ insets.bottom هنا (الجذر يهتم بالحماية)
  const { width: winW } = Dimensions.get("window");
  const routes = state.routes as Array<{ key: string; name: TabName }>;
  const count = routes.length;

  const maxBarWidth = 420;
  const minBarWidth = 300;

  const [barW, setBarW] = React.useState<number>(() =>
    Math.min(maxBarWidth, Math.max(minBarWidth, winW - 48))
  );
  useEffect(() => {
    setBarW(Math.min(maxBarWidth, Math.max(minBarWidth, winW - 48)));
  }, [winW, maxBarWidth, minBarWidth]);

  const tabW = barW / count;

  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    anim.setValue(state.index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    Animated.spring(anim, {
      toValue: state.index,
      useNativeDriver: true,
      friction: 8,
      tension: 140,
    }).start();
  }, [state.index, anim]);

  const dir = -1; // RTL
  const translateX = Animated.multiply(anim, dir * tabW);
  const INDICATOR_SIDE_KEY = "left";

  return (
    <View pointerEvents="box-none">
      {/* الحاوية الفعلية للشريط: لا حواف سفلية */}
      <View
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (Math.abs(w - barW) > 1) setBarW(w);
        }}
        style={
          {
            alignSelf: "center",
            width: barW,
            height: TABBAR_HEIGHT, // ✅ ارتفاع ثابت
            marginBottom: 5,
            borderRadius: 24,
            overflow: "visible",
            justifyContent: "center",
          } as any
        }
      >
        {/* الخلفية الزجاجية */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            borderRadius: 24,
            backgroundColor: "rgba(255,255,255,0.92)",
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: "#ebeff3",
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
          }}
        />

        {/* المؤشّر */}
        <Animated.View
          style={{
            position: "absolute",
            [INDICATOR_SIDE_KEY]: 6,
            width: tabW - 12,
            top: 4,
            height: TABBAR_HEIGHT - 8,
            borderRadius: 18,
            backgroundColor: BRAND.primary,
            transform: [{ translateX }],
          }}
        />

        {/* الأزرار */}
        <View style={{ flexDirection: "row", zIndex: 2, height: "100%" }}>
          {routes.map((route, index) => {
            const isFocused = state.index === index;
            const label = LABELS[route.name] ?? route.name;
            const color = isFocused ? "#fff" : BRAND.muted;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name as never);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                activeOpacity={0.9}
                style={{
                  width: tabW,
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingTop: 2,
                }}
              >
                <View style={{ marginBottom: 2 }}>
                  {iconFor(route.name, isFocused, color, ICON_SIZE)}
                </View>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: LABEL_SIZE,
                    lineHeight: LABEL_SIZE + 1,
                    color,
                    textAlign: "center",
                    fontFamily: isFocused ? "Cairo-Bold" : "Cairo-SemiBold",
                  }}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ❌ أزلنا الـ Spacer كليًا — الحماية جاءت من SafeAreaView في الجذر */}
    </View>
  );
};

const EDGE_W = 28; // عرض منطقة السحب عند الحافة
const SWIPE_TX = 60; // مسافة سحب دنيا
const SWIPE_VX = 600; // سرعة دنيا px/s لتفعيل الحركة

const SwipeTabEdges: React.FC = () => {
  const nav = useNavigation();
  const state = useNavigationState((s) => s);
  const routes = (state?.routes?.[0]?.state?.routes ?? []) as Array<{
    name: string;
  }>;
  const index = state?.routes?.[0]?.state?.index ?? 0;

  // دوال مساعدة:
  const goTo = (i: number) => {
    const routeName = routes[i]?.name;
    if (routeName) nav?.navigate(routeName as never);
  };
  const next = () => {
    if (index < routes.length - 1) goTo(index + 1);
  };
  const prev = () => {
    if (index > 0) goTo(index - 1);
  };

  // إيماءة من الحافة اليسرى → إلى اليمين (للتاب السابق)
  const leftEdgePan = Gesture.Pan()
    .activeOffsetX([-10, 10]) // تجاهل اللمسات الخفيفة
    .maxPointers(1)
    .hitSlop({
      left: 0,
      right: Dimensions.get("window").width - EDGE_W,
      top: 0,
      bottom: 0,
    })
    .onEnd((e) => {
      const isRight = e.velocityX > SWIPE_VX || e.translationX > SWIPE_TX;
      if (isRight) prev();
    });

  // إيماءة من الحافة اليمنى → إلى اليسار (للتاب التالي)
  const rightEdgePan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .maxPointers(1)
    .hitSlop({
      left: Dimensions.get("window").width - EDGE_W,
      right: 0,
      top: 0,
      bottom: 0,
    })
    .onEnd((e) => {
      const isLeft = e.velocityX < -SWIPE_VX || e.translationX < -SWIPE_TX;
      if (isLeft) next();
    });

  return (
    <GestureDetector gesture={Gesture.Race(leftEdgePan, rightEdgePan)}>
      {/* في Gesture v2 لا تحتاج View تغطي كل الشاشة؛ الـ hitSlop يحدد مناطق الالتقاط */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill} />
    </GestureDetector>
  );
};

const MainTabs = () => {
  return (
    <View style={{ flex: 1 }}>
      <SwipeTabEdges />

      <Tab.Navigator
        initialRouteName="ServicesHome"
        detachInactiveScreens={false}
        screenOptions={{
          headerShown: false,

          // مهمّتان لتجنب السباقات مع native-stack
          freezeOnBlur: false,
        }}
        tabBar={(props) => <GlassTabBar {...props} />}
      >
        <Tab.Screen name="ServicesHome" component={ServicesHomeWithPad} />
        <Tab.Screen name="MyOrders" component={MyOrdersWithPad} />
        <Tab.Screen name="MyFavorites" component={MyFavsWithPad} />
        <Tab.Screen name="ProfileTab" component={ProfileWithPad} />
      </Tab.Navigator>
    </View>
  );
};

// ===================== Drawer Wrapper =====================

const AppStack = createNativeStackNavigator();
function AppStackNavigator() {
  return (
    <AppStack.Navigator
      {...({ detachInactiveScreens: false } as any)}
      screenOptions={{ headerShown: false, freezeOnBlur: false }}
    >
      <AppStack.Screen name="MainApp" component={MainTabs} />
      {/* ضع كل الشاشات الخاصة بالمستخدم هنا بدل RootStack السابق */}
      <AppStack.Screen name="Register" component={RegisterScreen} />
      <AppStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AppStack.Screen
        name="OTPVerification"
        component={OTPVerificationScreen}
      />
      <AppStack.Screen name="ResetVerify" component={ResetVerifyScreen} />
      <AppStack.Screen
        name="ResetNewPassword"
        component={ResetNewPasswordScreen}
      />

      <AppStack.Screen name="DeliverySearch" component={DeliverySearchStack} />

      {/* الديلفري - شاشة منفصلة */}
      <AppStack.Screen name="DeliveryHome" component={DeliveryHomeScreen} />

      <AppStack.Screen
        name="BusinessDetails"
        component={BusinessDetailsScreen}
      />
      <AppStack.Screen
        name="CategoryDetails"
        component={CategoryDetailsScreen}
      />
      <AppStack.Screen
        name="UniversalProductDetails"
        component={CommonProductDetailsScreen}
      />
      <AppStack.Screen name="CartScreen" component={CartScreen} />
      <AppStack.Screen name="InvoiceScreen" component={InvoiceScreen} />
      <AppStack.Screen name="MyOrdersScreen" component={MyOrdersScreen} />
      <AppStack.Screen name="WalletScreen" component={WalletScreen} />
      <AppStack.Screen name="TopupScreen" component={TopupScreen} />
      <AppStack.Screen name="WithdrawalScreen" component={WithdrawalScreen} />
      <AppStack.Screen name="TransferScreen" component={TransferScreen} />
      <AppStack.Screen name="PayBillScreen" component={PayBillScreen} />
      <AppStack.Screen
        name="RefundRequestScreen"
        component={RefundRequestScreen}
      />
      <AppStack.Screen
        name="TransactionDetailsScreen"
        component={TransactionDetailsScreen}
      />
      <AppStack.Screen
        name="OrderDetailsScreen"
        component={OrderDetailsScreen}
      />
      <AppStack.Screen name="FavoritesScreen" component={MyFavoritesScreen} />
      <AppStack.Screen
        name="DeliveryAddresses"
        component={DeliveryAddressesScreen}
      />
      <AppStack.Screen name="EditProfile" component={EditProfileScreen} />
      <AppStack.Screen
        name="SelectLocation"
        component={SelectLocationScreen}
        options={{ headerShown: false, title: "تحديد الموقع" }} // يفضّل تفعيل الهيدر هنا
      />
      <AppStack.Screen
        name="GroceryMainScreen"
        component={GroceryMainScreen as any}
      />
      <AppStack.Screen
        name="AkhdimniOptionsScreen"
        component={AkhdimniOptionsScreen}
      />
      <AppStack.Screen
        name="AkhdimniScreen"
        component={AkhdimniScreen as any}
      />
      <AppStack.Screen name="UtilityGasScreen" component={UtilityGasScreen} />
      <AppStack.Screen
        name="UtilityWaterScreen"
        component={UtilityWaterScreen}
      />
      <AppStack.Screen name="Subscriptions" component={SubscriptionsScreen} />
      <AppStack.Screen name="HowToUse" component={HowToUseScreen} />
      <AppStack.Screen name="Support" component={SupportScreen} />

      {/* المعروف (Lost & Found) */}
      <AppStack.Screen name="MaaroufList" component={MaaroufListScreen} />
      <AppStack.Screen name="MaaroufCreate" component={MaaroufCreateScreen} />
      <AppStack.Screen name="MaaroufDetails" component={MaaroufDetailsScreen} />
      <AppStack.Screen name="MaaroufEdit" component={MaaroufEditScreen} />
      <AppStack.Screen
        name="MaaroufChatList"
        component={MaaroufChatListScreen}
      />
      <AppStack.Screen name="MaaroufChat" component={MaaroufChatScreen} />

      {/* السند (Services + Emergency + Charity) */}
      <AppStack.Screen name="SanadList" component={SanadListScreen} />
      <AppStack.Screen name="SanadCreate" component={SanadCreateScreen} />
      <AppStack.Screen name="SanadDetails" component={SanadDetailsScreen} />
      <AppStack.Screen name="SanadEdit" component={SanadEditScreen} />

      {/* الأماني (Women's Transportation) */}
      <AppStack.Screen name="AmaniList" component={AmaniListScreen} />
      <AppStack.Screen name="AmaniCreate" component={AmaniCreateScreen} />
      <AppStack.Screen name="AmaniDetails" component={AmaniDetailsScreen} />
      <AppStack.Screen name="AmaniEdit" component={AmaniEditScreen} />

      {/* العربون (Deposits) */}
      <AppStack.Screen name="ArabonList" component={ArabonListScreen} />
      <AppStack.Screen name="ArabonMyList" component={ArabonMyListScreen} />
      <AppStack.Screen
        name="ArabonMyBookings"
        component={ArabonMyBookingsScreen}
      />
      <AppStack.Screen name="ArabonSearch" component={ArabonSearchScreen} />
      <AppStack.Screen name="ArabonCreate" component={ArabonCreateScreen} />
      <AppStack.Screen name="ArabonDetails" component={ArabonDetailsScreen} />
      <AppStack.Screen name="ArabonEdit" component={ArabonEditScreen} />
      <AppStack.Screen name="ArabonBook" component={ArabonBookScreen} />

      {/* كنز (Marketplace) */}
      <AppStack.Screen name="KenzList" component={KenzListScreen} />
      <AppStack.Screen name="KenzFavorites" component={KenzFavoritesScreen} />
      <AppStack.Screen name="KenzDeals" component={KenzDealsScreen} />
      <AppStack.Screen name="KenzCreate" component={KenzCreateScreen} />
      <AppStack.Screen name="KenzDetails" component={KenzDetailsScreen} />
      <AppStack.Screen name="KenzEdit" component={KenzEditScreen} />
      <AppStack.Screen name="KenzChatList" component={KenzChatListScreen} />
      <AppStack.Screen name="KenzChat" component={KenzChatScreen} />

      {/* الكوادر (Professional Services) */}
      <AppStack.Screen name="KawaderList" component={KawaderListScreen} />
      <AppStack.Screen name="KawaderCreate" component={KawaderCreateScreen} />
      <AppStack.Screen name="KawaderDetails" component={KawaderDetailsScreen} />
      <AppStack.Screen name="KawaderEdit" component={KawaderEditScreen} />
      <AppStack.Screen
        name="KawaderChatList"
        component={KawaderChatListScreen}
      />
      <AppStack.Screen name="KawaderChat" component={KawaderChatScreen} />

      {/* اسعفني (Emergency Blood Donation) */}
      <AppStack.Screen name="Es3afniList" component={Es3afniListScreen} />
      <AppStack.Screen name="Es3afniCreate" component={Es3afniCreateScreen} />
      <AppStack.Screen name="Es3afniDetails" component={Es3afniDetailsScreen} />
      <AppStack.Screen name="Es3afniEdit" component={Es3afniEditScreen} />

      <AppStack.Screen name="Login" component={LoginScreen} />
    </AppStack.Navigator>
  );
}

// ===================== Root Stack =====================
const AuthStack = createNativeStackNavigator();
function AuthStackNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "none",
        freezeOnBlur: false, // ← جديد
      }}
    >
      <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
      />
      <AuthStack.Screen
        name="OTPVerification"
        component={OTPVerificationScreen}
      />
      <AuthStack.Screen name="ResetVerify" component={ResetVerifyScreen} />
      <AuthStack.Screen
        name="ResetNewPassword"
        component={ResetNewPasswordScreen}
      />
    </AuthStack.Navigator>
  );
}

// البوابة: تبديل بمفتاح حسب حالة الدخول (بدون reset إطلاقًا)
function RootNavigator() {
  const { isLoggedIn, isGuest, loading } = useAuth();
  if (loading) return null; // أو شاشة سبلاش خفيفة

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={onNavReady}
      theme={MyTheme}
    >
      {isLoggedIn || isGuest ? (
        <AppStackNavigator key="app" />
      ) : (
        <AuthStackNavigator key="auth" />
      )}
    </NavigationContainer>
  );
}

// اللفافة النهائية
export default function AppNavigationWrapper(props: {
  hasSeenOnboarding: boolean;
}) {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
