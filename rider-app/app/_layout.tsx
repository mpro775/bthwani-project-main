import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SplashGate />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function SplashGate() {
  const { loading } = useAuth();
  const [ready, setReady] = useState(false);

  const onReady = useCallback(async () => {
    await SplashScreen.hideAsync();
    setReady(true);
  }, []);

  useEffect(() => {
    if (!loading) onReady();
  }, [loading]);

  if (loading || !ready) return null;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Slot />
    </SafeAreaView>
  );
}
