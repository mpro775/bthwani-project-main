// App.tsx
// تحميل tslib أولاً قبل أي شيء آخر لتجنب خطأ __extends
try {
  require('tslib');
} catch (e) {
  // tslib غير متاح، لكن لا نوقف التطبيق
}

import { Platform } from "react-native";
import { enableFreeze, enableScreens } from "react-native-screens";
// Remove the require call - notifications will be initialized later in the component
enableScreens(true);
enableFreeze(false);

// Suppress SafeAreaView deprecation warning
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    args[0] &&
    typeof args[0] === "string" &&
    args[0].includes("SafeAreaView has been deprecated")
  ) {
    return;
  }
  originalWarn(...args);
};

// البوليفيلات قبل i18n
import "./src/localization/i18n";
import "./src/polyfills/intl";
import "./src/polyfills/platform"; // ⬅️ جديد

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  DevSettings,
  I18nManager,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";


// لو عندك Expo:
let Updates: any = null;
try {
  Updates = require("expo-updates");
} catch {}

// ===== مكوّن التمهيد: يحسم RTL ثم يحمّل الـ Shell =====
const RTL_FLAG = "didForceRTL";

function AppBootstrap() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const did = await AsyncStorage.getItem(RTL_FLAG);
      if (!I18nManager.isRTL) {
        I18nManager.allowRTL(true);
        I18nManager.forceRTL(true);
      }
      if (!did) {
        await AsyncStorage.setItem(RTL_FLAG, "1");
        // إعادة التشغيل مرّة واحدة
        if (Updates?.reloadAsync) {
          try {
            await Updates.reloadAsync();
            return;
          } catch {}
        }
        if (DevSettings?.reload) {
          DevSettings.reload();
          return;
        }
      }
      setReady(true);
    })();
  }, []);

  if (!ready) return null;
  return <AppShell />;
}

// ===== هنا ضع كل ما كان في App سابقًا (NetInfo, Fonts, Linking, ...الخ) =====
import { useVerificationState } from "@/context/verify";
import { getAuthBanner } from "@/guards/bannerGateway";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { Linking } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { PaperProvider } from "react-native-paper";
import { AuthProvider, useAuth } from "./src/auth/AuthContext";
import { AuthBannerProvider } from "./src/components/AuthBanner";
import { CartProvider } from "./src/context/CartContext";
import { AppThemeProvider, useAppTheme } from "./src/context/ThemeContext";
import AppNavigation from "./src/navigation";
import { navigationRef } from "./src/navigation/ref";
import { attachNotificationListeners, registerPushToken } from "./src/notify";
import OfflineScreen from "./src/screens/OfflineScreen";
import { saveUtmFromUrl } from "./src/utils/lib/utm";
import { retryQueuedRequests } from "./src/utils/offlineQueue";
import { toastConfig } from "./src/utils/toastConfig";
import { Analytics } from "./src/lib/analytics";
import { FeatureFlags } from "./src/lib/featureFlags";
import { SentryConfig } from "./src/lib/sentry";

SplashScreen.preventAutoHideAsync();

// Initialize analytics, feature flags, and error tracking
Analytics.init();
FeatureFlags.init();

// Initialize Sentry with error handling - delayed to avoid tslib __extends issue
// Load Sentry after app is ready to avoid module loading conflicts
// تعطيل Sentry مؤقتاً للتحقق من أن المشكلة منه
// setTimeout(() => {
//   try {
//     SentryConfig.init();
//   } catch (error) {
//     console.warn('Sentry initialization failed:', error);
//   }
// }, 100);

function AppShell() {
  // 👇 كل الـ Hooks هنا تُستدعى دائمًا وبنفس الترتيب
  const { isLoggedIn, authReady } = useAuth();
  const { verified } = useVerificationState();
  const [appIsReady, setAppIsReady] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(
    null
  );
  const { theme } = useAppTheme();
  const barStyle =
    theme?.modeResolved === "dark" ? "light-content" : "dark-content";

  // استخدام قيم افتراضية في حالة عدم توفر theme.colors
  const primaryColor = theme?.colors?.primary || "#FF500D";

  // Create react-native-paper theme from our custom theme
  const paperTheme = React.useMemo(() => {
    // Ensure theme is available before creating paper theme
    const safeTheme = theme || {
      colors: {
        primary: "#FF500D",
        background: "#FFFFFF",
        text: "#4E342E",
        card: "#F3F3F3",
        border: "#E0E0E0",
        muted: "#9E9E9E"
      }
    };

    return {
      colors: {
        primary: safeTheme.colors.primary,
        onPrimary: "#FFFFFF",
        primaryContainer: safeTheme.colors.primary,
        onPrimaryContainer: "#FFFFFF",
        secondary: safeTheme.colors.muted,
        onSecondary: "#FFFFFF",
        secondaryContainer: safeTheme.colors.card,
        onSecondaryContainer: safeTheme.colors.text,
        tertiary: safeTheme.colors.muted,
        onTertiary: "#FFFFFF",
        tertiaryContainer: safeTheme.colors.card,
        onTertiaryContainer: safeTheme.colors.text,
        error: "#D32F2F",
        onError: "#FFFFFF",
        errorContainer: "#FFEBEE",
        onErrorContainer: "#D32F2F",
        background: safeTheme.colors.background,
        onBackground: safeTheme.colors.text,
        surface: safeTheme.colors.card,
        onSurface: safeTheme.colors.text,
        surfaceVariant: safeTheme.colors.card,
        onSurfaceVariant: safeTheme.colors.muted,
        outline: safeTheme.colors.border,
        outlineVariant: safeTheme.colors.border,
        shadow: "#000000",
        scrim: "#000000",
        inverseSurface: safeTheme.colors.text,
        inverseOnSurface: safeTheme.colors.background,
        inversePrimary: safeTheme.colors.primary,
        elevation: {
          level0: "transparent",
          level1: "rgb(247, 243, 249)",
          level2: "rgb(243, 237, 246)",
          level3: "rgb(238, 232, 244)",
          level4: "rgb(236, 230, 243)",
          level5: "rgb(233, 227, 241)",
        },
        surfaceDisabled: safeTheme.colors.muted,
        onSurfaceDisabled: safeTheme.colors.muted,
        backdrop: "rgba(0, 0, 0, 0.5)",
      },
      isV3: true,
    };
  }, [theme]);

  const handleRetry = useCallback(() => {
    setChecking(true);
    NetInfo.fetch().then((state: NetInfoState) => {
      setIsConnected(state.isConnected);
      setChecking(false);
    });
  }, []);
  useEffect(() => {
    const b = getAuthBanner();
    if (!b) return;
    if (isLoggedIn) b.hide(); // لا معنى لبانر "login" الآن
    if (verified) b.hide(); // ولا لبانر "verify"
  }, [isLoggedIn, verified]);
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected);
    });
    NetInfo.fetch().then((state: NetInfoState) => {
      setIsConnected(state.isConnected);
      setChecking(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const onDeepLink = (event: { url: string }) => {
      if (event?.url) saveUtmFromUrl(event.url);
    };
    Linking.getInitialURL().then((url) => {
      if (url) {
        saveUtmFromUrl(url);
      }
    });
    const sub = Linking.addEventListener("url", onDeepLink);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await Font.loadAsync({
          "Cairo-Regular": require("./assets/fonts/cairo_regular.ttf"),
          "Cairo-Bold": require("./assets/fonts/cairo_bold.ttf"),
          "Cairo-SemiBold": require("./assets/fonts/cairo_semibold.ttf"),
        });
        const seen = await AsyncStorage.getItem("hasSeenOnboarding");
        setHasSeenOnboarding(seen === "true");
      } catch (e) {
        console.warn("❌ Error initializing app:", e);
      } finally {
        await SplashScreen.hideAsync();
        setAppIsReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    retryQueuedRequests();
  }, []);

  // Register push token فقط بعد جهوزية auth وتوفر جلسة
  useEffect(() => {
    if (authReady && isLoggedIn) {
      (async () => {
        try {
          await registerPushToken("user");
        } catch (e) {
          console.warn("Push register error:", e);
        }
      })();
    }
  }, [authReady, isLoggedIn]);

  useEffect(() => {
    // فعّل مستمعي الإشعارات
    const navigate = (screen: string, params?: any) => {
      if (navigationRef?.current) {
        (navigationRef.current as any).navigate(screen, params);
      }
    };
    const { responseSub, receiveSub } = attachNotificationListeners(navigate);

    return () => {
      responseSub?.remove?.();
      receiveSub?.remove?.();
    };
  }, []);

  return (
    <AuthBannerProvider>
      <CartProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            {/* خلفية عامة للجزء العلوي لضمان ظهور اللون على iOS و Android */}
            <View style={{ flex: 1, backgroundColor: "#FF500D" }}>
              <StatusBar
                translucent={false}
                backgroundColor={primaryColor}
                barStyle={barStyle}
              />
              <SafeAreaView
                style={{ flex: 1, backgroundColor: primaryColor }}
                edges={["top", "bottom"]}
              >
                {/* ✳️ بقية التطبيق */}
                {!appIsReady || hasSeenOnboarding === null ? (
                  <View style={styles.loading}>
                    <ActivityIndicator size="large" />
                  </View>
                ) : checking || isConnected === null ? (
                  <View style={styles.loading}>
                    <ActivityIndicator size="large" />
                  </View>
                ) : !isConnected ? (
                  <OfflineScreen onRetry={handleRetry} />
                ) : (
                  <PaperProvider theme={paperTheme}>
                    <AppNavigation hasSeenOnboarding={hasSeenOnboarding} />
                    <Toast config={toastConfig} />
                  </PaperProvider>
                )}
              </SafeAreaView>
            </View>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </CartProvider>
    </AuthBannerProvider>
  );
}

export default function App() {
  // لفّ كل شيء داخل AuthProvider و AppThemeProvider
  return (
    <AppThemeProvider>
      <AuthProvider>
        <AppBootstrap />
      </AuthProvider>
    </AppThemeProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});
