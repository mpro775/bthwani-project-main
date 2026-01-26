import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, setAuthToken } from "../api/client";
import { ENDPOINTS } from "../api/routes";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { registerForPush } from "../services/push";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type User = { id: string; fullName?: string; email?: string; uid?: string };
type AuthCtx = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({} as any);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // تحقق من وجود token محفوظ عند بدء التطبيق
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const savedToken = await SecureStore.getItemAsync("mk_token");
        if (!savedToken) {
          setIsLoading(false);
          return;
        }

        // ضع التوكن فوراً في api (بما يغطي كلا الحالتين)
        await setAuthToken(savedToken);

        // الآن اطلب endpoint مخصص لإرجاع بيانات المستخدم الحالية
        // يجب أن يكون هذا endpoint محمي بتوكنك (verifyMarketerJWT)
        const resp = await api.get("/auth/me"); // ← تأكد أن الباك يوفر هذا المسار

        // إذا رجع المستخدم بنجاح — اعتبر الجلسة صالحة
        const u = resp.data;
        setToken(savedToken);
        setUser({
          id: u._id || u.id,
          fullName: u.fullName,
          email: u.email,
          uid: u.uid || u.firebaseUid,
        });
      } catch (err) {
        console.log(
          "Token validation failed, clearing saved token",
          (err as any)?.response?.status || (err as any)?.message
        );
        await setAuthToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthState();
  }, []);

  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener((n) => {
      // لو وصل إشعار approval/reject من الخادم
      const data: any = n.request.content.data || {};
      if (data?.type === "onb_status") {
        // يمكن لاحقًا توجيه المستخدم مباشرةً إلى تفاصيل الطلب
      }
    });
    return () => sub.remove();
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post(ENDPOINTS.AUTH_MARKETER_LOGIN, {
      email,
      password,
    });
    console.log("login response data:", data);
    setToken(data.token);
    setUser({
      id: data.user?._id || data.user?.id,
      fullName: data.user?.fullName,
      email: data.user?.email,
      uid: data.user?.uid || data.user?.firebaseUid,
    });
    await setAuthToken(data.token);

    try {
      const expoToken = await registerForPush();
      if (expoToken) {
        await api.post(ENDPOINTS.PUSH_TOKEN, { expoPushToken: expoToken });
      }
    } catch (err) {
      console.warn("push token registration failed (non-blocking):", err);
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await setAuthToken(null);
  };
  const value = useMemo(
    () => ({ user, token, isLoading, login, logout }),
    [user, token, isLoading]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
