// auth/AuthContext.tsx
import { refreshIdToken } from "@/api/authService";
import { IntentManager } from "@/context/intent";
import { silenceAuthPrompts } from "@/guards/authGate";
import axiosInstance from "@/utils/api/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AuthCtx = {
  isLoggedIn: boolean;
  isGuest: boolean;
  loading: boolean;
  authReady: boolean; // ✅ اكتملت مزامنة حالة الدخول
  lastAuthChangeTs: number; // ✅ طابع زمني لآخر تغيير
  user: AuthenticatedUser | null; // ✅ بيانات المستخدم الكاملة
  login: () => Promise<void>;
  logout: () => Promise<void>;
  enterAsGuest: () => Promise<void>;
};

interface AuthenticatedUser {
  uid: string;
  email?: string;
  role?: string;
  permissions?: Record<string, Record<string, boolean>>;
  profile?: {
    name?: string;
    phone?: string;
    avatar?: string;
  };
}

const AuthContext = createContext<AuthCtx>({
  isLoggedIn: false,
  isGuest: false,
  loading: true,
  authReady: false,
  lastAuthChangeTs: 0,
  user: null,
  login: async () => {},
  logout: async () => {},
  enterAsGuest: async () => {},
});

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [lastAuthChangeTs, setLastAuthChangeTs] = useState(0);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);

  const loadUserProfile = async (idToken: string) => {
    try {
      const meRes = await axiosInstance.get("/users/me");
      const userData = meRes?.data;

      if (userData) {
        const authenticatedUser: AuthenticatedUser = {
          uid: userData.firebaseUID || userData.uid,
          email: userData.email,
          role: userData.role,
          permissions: userData.permissions,
          profile: {
            name: userData.name || userData.displayName,
            phone: userData.phone,
            avatar: userData.avatar,
          }
        };

        setUser(authenticatedUser);

        // تخزين userId إذا لم يكن موجود
        const curUserId = await AsyncStorage.getItem("userId");
        if (!curUserId && userData._id) {
          await AsyncStorage.setItem("userId", String(userData._id));
        }
      }
    } catch (error) {
      console.warn('Failed to load user profile:', error);
    }
  };

  useEffect(() => {
    (async () => {
      const [idToken, seen] = await Promise.all([
        refreshIdToken(), // ✅ يسترجع أو يجدّد توكن Firebase
        AsyncStorage.getItem("hasSeenOnboarding"),
      ]);

      const loggedIn = !!idToken;
      setIsLoggedIn(loggedIn);
      setIsGuest(!loggedIn && seen === "true");
      setAuthReady(true);
      setLastAuthChangeTs(Date.now());

      // ✅ تحديث Authorization header
      if (loggedIn && idToken) {
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${idToken}`;

        // ✅ جلب وحفظ بيانات المستخدم الكاملة
        await loadUserProfile(idToken);
      } else {
        delete axiosInstance.defaults.headers.common.Authorization;
        setUser(null);
      }

      setLoading(false);
    })();
  }, []);

  const login = async () => {
    silenceAuthPrompts(4000);
    setIsLoggedIn(true);
    setIsGuest(false);
    await IntentManager.runIfAny();

    // ✅ تحديث Authorization header
    const idToken = await refreshIdToken();
    if (idToken) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${idToken}`;

      // ✅ جلب وحفظ بيانات المستخدم الكاملة
      await loadUserProfile(idToken);
    }

    setLastAuthChangeTs(Date.now());
  };

  const logout = async () => {
    silenceAuthPrompts(3000);
    await AsyncStorage.multiRemove([
      "authToken",
      "user",
      "refreshToken",
      "firebase-idToken",
      "firebase-refreshToken",
      "firebase-expiryTime",
      "userId", // ✅ امسح معرّف المستخدم
      "firebaseUID", // ✅ إن كنت تخزّنه
      "guestCart", // ✅ نظّف سلة الضيف
      "guestStoreId",
    ]);

    setIsLoggedIn(false);
    setIsGuest(true); // بعد الخروج ابقَ في الرئيسية كضيف
    setUser(null); // ✅ امسح بيانات المستخدم

    // ✅ إزالة Authorization header
    delete axiosInstance.defaults.headers.common.Authorization;

    setLastAuthChangeTs(Date.now());
  };

  const enterAsGuest = async () => {
    silenceAuthPrompts(2000);
    await AsyncStorage.setItem("hasSeenOnboarding", "true");

    // ✅ التبديل لضيف مع تنظيف أي userId قديم وبيانات المستخدم
    await AsyncStorage.multiRemove(["userId"]);
    setIsGuest(true);
    setIsLoggedIn(false);
    setUser(null);

    // ✅ إزالة Authorization header
    delete axiosInstance.defaults.headers.common.Authorization;

    setLastAuthChangeTs(Date.now());
  };

  const value = useMemo(
    () => ({
      isLoggedIn,
      isGuest,
      loading,
      authReady,
      lastAuthChangeTs,
      user,
      login,
      logout,
      enterAsGuest,
    }),
    [isLoggedIn, isGuest, loading, authReady, lastAuthChangeTs, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
