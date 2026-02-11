// src/components/AuthBanner.tsx — حوار تحقق احترافي يظهر من الأسفل
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
  Pressable,
  Dimensions,
  Platform,
} from "react-native";
import COLORS from "@/constants/colors";

// هامش سفلي ثابت (لا نعتمد على SafeAreaProvider لأنه قد يكون أسفل AuthBannerProvider)
const BOTTOM_PADDING = Platform.OS === "ios" ? 34 : 24;

type BannerType = "login" | "verify" | null;

type Ctx = {
  show: (t: BannerType) => void;
  hide: () => void;
};

const C = createContext<Ctx | null>(null);
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export function AuthBannerProvider({ children }: React.PropsWithChildren) {
  const [type, setType] = useState<BannerType>(null);
  const slideY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const { isLoggedIn } = useAuth();
  const { verified } = useVerificationState();

  const hide = useMemo(
    () => () => {
      Animated.parallel([
        Animated.timing(slideY, {
          toValue: SCREEN_HEIGHT,
          duration: 280,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => setType(null));
    },
    [slideY, overlayOpacity]
  );

  useEffect(() => {
    if (type === "login" && isLoggedIn) hide();
    else if (type === "verify" && verified) hide();
  }, [type, isLoggedIn, verified, hide]);

  const show = (t: BannerType) => {
    setType(t);
    slideY.setValue(SCREEN_HEIGHT);
    overlayOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(slideY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 24,
        stiffness: 280,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    setAuthBannerController({ show, hide });
    return () => setAuthBannerController(null);
  }, []);

  const value = useMemo(() => ({ show, hide }), []);

  return (
    <C.Provider value={value}>
      {children}
      {type !== null && (
        <>
          <Animated.View
            pointerEvents="auto"
            style={[styles.overlay, { opacity: overlayOpacity }]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={hide} />
          </Animated.View>
          <Animated.View
            pointerEvents="auto"
            style={[
              styles.panelWrap,
              {
                paddingBottom: BOTTOM_PADDING,
                transform: [{ translateY: slideY }],
              },
            ]}
          >
            <View style={styles.handle} />
            <View style={styles.panel}>
              <View style={styles.iconWrap}>
                <Ionicons
                  name={
                    type === "login"
                      ? "log-in-outline"
                      : "shield-checkmark-outline"
                  }
                  size={28}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.title}>
                {type === "login"
                  ? "تسجيل الدخول"
                  : "توثيق الحساب"}
              </Text>
              <Text style={styles.message}>
                {type === "login"
                  ? "سجّل الدخول للوصول إلى هذه الميزة ومتابعة استخدام التطبيق."
                  : "وثّق حسابك لإكمال العملية والاستفادة من الخدمات."}
              </Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.primaryBtn}
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
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText}>
                    {type === "login" ? "تسجيل الدخول" : "توثيق الآن"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={hide}
                  activeOpacity={0.7}
                >
                  <Text style={styles.secondaryBtnText}>لاحقاً</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </>
      )}
    </C.Provider>
  );
}

export function useAuthBanner() {
  const ctx = useContext(C);
  if (!ctx)
    throw new Error("useAuthBanner must be inside AuthBannerProvider");
  return ctx;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 999,
  },
  panelWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    paddingHorizontal: 20,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.5)",
    marginBottom: 12,
  },
  panel: {
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${COLORS.primary}18`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily: "Cairo-Bold",
    fontSize: 20,
    color: COLORS.text,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontFamily: "Cairo-Regular",
    fontSize: 14,
    color: COLORS.lightText,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  actions: {
    width: "100%",
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryBtnText: {
    fontFamily: "Cairo-Bold",
    fontSize: 16,
    color: COLORS.white,
  },
  secondaryBtn: {
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryBtnText: {
    fontFamily: "Cairo-SemiBold",
    fontSize: 15,
    color: COLORS.gray,
  },
});
