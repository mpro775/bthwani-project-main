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

  // تحقق من وجود token محفوظ عند بدء التطبيق (ربط مع GET /auth/me في الباك)
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const savedToken = await SecureStore.getItemAsync("mk_token");
        if (!savedToken) {
          setIsLoading(false);
          return;
        }

        await setAuthToken(savedToken);

        // الباك يرجع: { success: true, data: { user: { id, fullName, email, phone } } }
        const resp = await api.get(ENDPOINTS.AUTH_ME);
        const payload = resp.data?.data ?? resp.data;
        const u = payload?.user;
        if (u) {
          setToken(savedToken);
          setUser({
            id: String(u.id ?? u._id),
            fullName: u.fullName,
            email: u.email,
            uid: u.uid ?? u.firebaseUid,
          });
        }
      } catch (err) {
        console.log(
          "Token validation failed, clearing saved token",
          (err as any)?.response?.status ?? (err as any)?.message
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
    // الباك يرجع: { success, message, data: { user: { id, fullName, email }, token: { accessToken, tokenType, expiresIn } } }
    const payload = data?.data ?? data;
    const userData = payload?.user;
    const tokenObj = payload?.token;
    const tokenStr =
      typeof tokenObj === "string"
        ? tokenObj
        : tokenObj?.accessToken ?? payload?.accessToken;
    if (!tokenStr) {
      throw new Error("لم يُرجَع توكن من الخادم");
    }
    setToken(tokenStr);
    setUser({
      id: String(userData?.id ?? userData?._id ?? ""),
      fullName: userData?.fullName,
      email: userData?.email,
      uid: userData?.uid ?? userData?.firebaseUid,
    });
    await setAuthToken(tokenStr);

    try {
      const expoToken = await registerForPush();
      if (expoToken) {
        await api.post(ENDPOINTS.PUSH_TOKEN, { pushToken: expoToken });
      }
    } catch (err) {
      console.warn("push token registration failed (non-blocking):", err);
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await setAuthToken(null); // يمسح التوكن من SecureStore ويفك ربط الـ api
  };
  const value = useMemo(
    () => ({ user, token, isLoading, login, logout }),
    [user, token, isLoading]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
