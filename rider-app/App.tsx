// App.tsx
import React, { useCallback, useEffect, useState } from "react";
import { StatusBar } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import AppNavigator from "./src/navigators/AppNavigator";

// نمنع Splash من الإخفاء التلقائي
SplashScreen.preventAutoHideAsync().catch((err) => {
  console.warn("خطأ عند منع الإخفاء التلقائي للـSplash:", err);
});

export default function App(): React.ReactElement | null {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}

function Root(): React.ReactElement | null {
  const { loading } = useAuth();
  const [appIsReady, setAppIsReady] = useState(false);

  // نُعرّف الدالة التي تخفي الـSplash عند انتهاء loading
  const onReady = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
    } catch (e) {
      console.warn("خطأ عند إخفاء Splash:", e);
    }
    setAppIsReady(true);
  }, []);

  // نراقب حالة loading، وعندما تصير false نستدعي onReady لمرة واحدة
  useEffect(() => {
    if (loading === false && !appIsReady) {
      onReady();
    }
  }, [loading, appIsReady, onReady]);

  // طالما loading أو لم نخفي Splash بعد، نُعيد null→ تظل شاشة الانطلاق ظاهرة
  if (loading || !appIsReady) {
    return null;
  }

  // بعد أن ينتهي loading و onReady أدار الـSplash، نعرض الملاحة الحقيقية
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <AppNavigator />
    </>
  );
}
