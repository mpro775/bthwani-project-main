import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "./constants/colors";
import useCairoFonts from "./hooks/useCairoFonts";
import AddProductScreen from "./screens/AddProductScreen";
import CatalogProductPickerScreen from "./screens/CatalogProductPickerScreen";
import LoginScreen from "./screens/LoginScreen";
import MoreScreen from "./screens/MoreScreen";
import OrderDetailsScreen from "./screens/OrderDetailsScreen";
import OrdersScreen from "./screens/OrdersScreen";
import ProductsScreen from "./screens/ProductsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import StartupScreen from "./screens/StartupScreen";
import StatisticsScreen from "./screens/StatisticsScreen";
import StoreInfoScreen from "./screens/StoreInfoScreen";
import SupportScreen from "./screens/SupportScreen";
import VendorAccountStatementScreen from "./screens/VendorAccountStatementScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export type RootStackParamList = {
  Statistics: undefined; // Added statistics screen
  Settings: undefined;
  VendorAccountStatement: undefined;
  Support: undefined;
  PaymentStack: undefined;

  Login: undefined;
  Vendor: undefined;
  Products: undefined;
  StartupScreen: undefined;
  AddProduct: { productId?: string } | undefined;
  CatalogProductPicker: { returnTo?: string };
  OrderDetails: { order: any } | undefined;
};
export type VendorTabParamList = {
  الطلبات: undefined;
  المنتجات: undefined;
  المتجر: undefined;
  المزيد: undefined;
};

const TabBarIcon = ({ route, focused, color }: any) => {
  if (route.name === "الطلبات") {
    return (
      <View style={styles.iconContainer}>
        {focused && (
          <LinearGradient
            colors={["#1E88E5", "#1976D2"]}
            style={styles.activeIconBackground}
          />
        )}
        <Ionicons
          name={focused ? "receipt" : "receipt-outline"}
          size={24}
          color={focused ? "#FFF" : color}
          style={focused ? styles.activeIcon : undefined}
        />
      </View>
    );
  }
  if (route.name === "المنتجات") {
    return (
      <View style={styles.iconContainer}>
        {focused && (
          <LinearGradient
            colors={["#1E88E5", "#1976D2"]}
            style={styles.activeIconBackground}
          />
        )}
        <MaterialIcons
          name={"inventory"}
          size={24}
          color={focused ? "#FFF" : color}
          style={focused ? styles.activeIcon : undefined}
        />
      </View>
    );
  }

  if (route.name === "المتجر") {
    return (
      <View style={styles.iconContainer}>
        {focused && (
          <LinearGradient
            colors={["#FFFFFF", "#F8F9FA"]}
            style={styles.activeIconBackground}
          />
        )}
        <FontAwesome5
          name={"store"}
          size={24}
          color={focused ? "#FFF" : color}
          style={focused ? styles.activeIcon : undefined}
        />
      </View>
    );
  }
  if (route.name === "المزيد") {
    return (
      <View style={styles.iconContainer}>
        {focused && (
          <LinearGradient
            colors={["#1E88E5", "#1976D2"]}
            style={styles.activeIconBackground}
          />
        )}
        <Ionicons
          name={focused ? "menu" : "menu-outline"}
          size={24}
          color={focused ? "#FFF" : color}
          style={focused ? styles.activeIcon : undefined}
        />
      </View>
    );
  }
  return null;
};

const VendorTabs = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.white,
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: "700",
          fontFamily: "Cairo-Bold",
          marginBottom: Platform.OS === "ios" ? 0 : 5,
        },
        tabBarStyle: {
          height: Platform.OS === "ios" ? 85 : 65 + insets.bottom,
          backgroundColor: COLORS.primary,
          borderTopWidth: 0,
          elevation: 25,
          shadowColor: COLORS.primaryVariant,
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.18,
          shadowRadius: 12,
          paddingBottom:
            insets.bottom > 0 ? insets.bottom : Platform.OS === "ios" ? 20 : 8,
          paddingTop: 10,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              tint="light"
              intensity={100}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: COLORS.primary },
              ]}
            />
          ),
        tabBarIcon: ({
          focused,
          color,
        }: {
          focused: boolean;
          color: string;
        }) => <TabBarIcon route={route} focused={focused} color={color} />,
      })}
    >
      <Tab.Screen
        name="الطلبات"
        component={OrdersScreen}
        options={{
          tabBarBadgeStyle: {
            backgroundColor: COLORS.primaryVariant,
            fontSize: 10,
            minWidth: 18,
            minHeight: 18,
          },
        }}
      />
      <Tab.Screen name="المنتجات" component={ProductsScreen} />

      <Tab.Screen name="المتجر" component={StoreInfoScreen} />
      <Tab.Screen name="المزيد" component={MoreScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const fontsLoaded = useCairoFonts();
  if (!fontsLoaded) return null;

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: COLORS.primary,
      background: COLORS.background,
      card: COLORS.primary,
      text: COLORS.text,
      border: COLORS.primaryVariant,
      notification: COLORS.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Startup"
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontWeight: "bold",
            fontFamily: "Cairo-Bold",
            fontSize: 19,
          },
          headerBackTitle: "رجوع",
          animation: "fade_from_bottom",
          animationTypeForReplace: "push",
          gestureEnabled: true,
          gestureDirection: "horizontal",
        }}
      >
        <Stack.Screen
          name="Startup"
          component={StartupScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: "تسجيل الدخول",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Vendor"
          component={VendorTabs}
          options={{
            headerShown: false,
            animation: "fade",
          }}
        />

        <Stack.Screen
          name="CatalogProductPicker"
          component={CatalogProductPickerScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AddProduct"
          component={AddProductScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="OrderDetails"
          component={OrderDetailsScreen}
          options={{
            title: "تفاصيل الطلب",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Statistics"
          component={StatisticsScreen}
          options={{
            title: "الإحصائيات",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="VendorAccountStatement"
          component={VendorAccountStatementScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Support"
          component={SupportScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 30,
  },
  activeIconBackground: {
    position: "absolute",
    width: 45,
    height: 30,
    borderRadius: 15,
    opacity: 0.2,
  },
  activeIcon: {
    transform: [{ scale: 1.1 }],
  },
});

export default AppNavigator;
