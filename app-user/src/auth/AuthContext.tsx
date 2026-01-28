// auth/AuthContext.tsx
import { getStoredJwtToken, clearAllTokens } from "@/api/authService";
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

  const loadUserProfile = async (token: string) => {
    try {
      const meRes = await axiosInstance.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = meRes?.data;

      if (userData) {
        const authenticatedUser: AuthenticatedUser = {
          uid: userData._id || userData.id,
          email: userData.email,
          role: userData.role,
          permissions: userData.permissions,
          profile: {
            name: userData.fullName || userData.name,
            phone: userData.phone,
            avatar: userData.profileImage || userData.avatar,
          }
        };

        setUser(authenticatedUser);

        // تخزين userId إذا لم يكن موجود
        const curUserId = await AsyncStorage.getItem("userId");
        if (!curUserId && (userData._id || userData.id)) {
          await AsyncStorage.setItem("userId", String(userData._id || userData.id));
        }
      }
    } catch (error) {
      console.warn('Failed to load user profile:', error);
    }
  };

  useEffect(() => {
    (async () => {
      const [jwtToken, seen] = await Promise.all([
        getStoredJwtToken(), // ✅ يسترجع JWT token
        AsyncStorage.getItem("hasSeenOnboarding"),
      ]);

      const loggedIn = !!jwtToken;
      setIsLoggedIn(loggedIn);
      setIsGuest(!loggedIn && seen === "true");
      setAuthReady(true);
      setLastAuthChangeTs(Date.now());

      // ✅ تحديث Authorization header
      if (loggedIn && jwtToken) {
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${jwtToken}`;

        // ✅ جلب وحفظ بيانات المستخدم الكاملة
        await loadUserProfile(jwtToken);
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
    const jwtToken = await getStoredJwtToken();
    if (jwtToken) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${jwtToken}`;

      // ✅ جلب وحفظ بيانات المستخدم الكاملة
      await loadUserProfile(jwtToken);
    }

    setLastAuthChangeTs(Date.now());
  };

  const logout = async () => {
    silenceAuthPrompts(3000);
    
    // ✅ مسح جميع التوكنات
    await clearAllTokens();
    
    await AsyncStorage.multiRemove([
      "userId",
      "guestCart",
      "guestStoreId",
      "user-data",
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
