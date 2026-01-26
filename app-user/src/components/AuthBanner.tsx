// src/components/auth/AuthBanner.tsx
import { useAuth } from "@/auth/AuthContext";
import { useVerificationState } from "@/context/verify";
import { setAuthBannerController } from "@/guards/bannerGateway";
import { Ionicons } from "@expo/vector-icons";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type BannerType = "login" | "verify" | null;

type Ctx = {
  show: (t: BannerType) => void;
  hide: () => void;
};

const C = createContext<Ctx | null>(null);

export function AuthBannerProvider({ children }: React.PropsWithChildren) {
  const [type, setType] = useState<BannerType>(null);
  const slide = useRef(new Animated.Value(-80)).current;
  const { isLoggedIn } = useAuth();
  const { verified } = useVerificationState();
  useEffect(() => {
    if (type === "login" && isLoggedIn) {
      hide();
    } else if (type === "verify" && verified) {
      hide();
    }
  }, [type, isLoggedIn, verified]);
  const show = (t: BannerType) => {
    setType(t);
    Animated.timing(slide, {
      toValue: 0,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  const hide = () => {
    Animated.timing(slide, {
      toValue: -80,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setType(null));
  };

  // سجّل الـ controller في الـ gateway
  useEffect(() => {
    setAuthBannerController({
      show: (t) => show(t),
      hide,
    });
    return () => setAuthBannerController(null);
  }, []);

  const value = useMemo(() => ({ show, hide }), []);

  return (
    <C.Provider value={value}>
      {children}
      <Animated.View
        pointerEvents={type ? "auto" : "none"}
        style={[styles.wrap, { transform: [{ translateY: slide }] }]}
      >
        {!!type && (
          <View style={styles.banner}>
            <Ionicons
              name={
                type === "login" ? "log-in-outline" : "shield-checkmark-outline"
              }
              size={18}
              color="#D84315"
            />
            <Text style={styles.text}>
              {type === "login"
                ? "سجّل الدخول للمتابعة"
                : "وثّق حسابك لإكمال العملية"}
            </Text>

            <TouchableOpacity
              style={styles.cta}
              onPress={() => {
                hide();
                import("@/navigation/RootNavigation").then(
                  ({ safeNavigate }) => {
                    safeNavigate(
                      type === "login" ? "Login" : "OTPVerification"
                    );
                  }
                );
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={type === "login" ? "تسجيل الدخول" : "توثيق الحساب"}
              accessibilityHint={type === "login" ? "يفتح صفحة تسجيل الدخول" : "يفتح صفحة توثيق الحساب"}
            >
              <Text style={styles.ctaText}>
                {type === "login" ? "تسجيل الدخول" : "توثيق الآن"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.close}
              onPress={hide}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="إغلاق البانر"
              accessibilityHint="يغلق رسالة البيانات المؤقتة"
            >
              <Ionicons
                name="close"
                size={18}
                color="#555"
                accessible={false}
                importantForAccessibility="no"
              />
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </C.Provider>
  );
}

export function useAuthBanner() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useAuthBanner must be inside AuthBannerProvider");
  return ctx;
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    padding: 10,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    gap: 8,
  },
  text: { flex: 1, color: "#333", fontFamily: "Cairo-Regular" },
  cta: {
    backgroundColor: "#D84315",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  ctaText: { color: "#fff", fontFamily: "Cairo-Bold" },
  close: { padding: 6, marginLeft: 2 },
});
