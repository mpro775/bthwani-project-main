// src/hooks/useBootstrapConfig.ts
import axiosInstance from "@/utils/api/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";

type Lang = "ar" | "en";

type BootstrapResponse = {
  version?: string;
  settings?: any;
  theme?: { colors?: { primary?: string; text?: string; background?: string } };
  homeLayout?: any;
  onboarding?: {
    key: string;
    title?: string;
    subtitle?: string;
    media?: { type: "lottie" | "image"; url: string };
    cta?: { label?: string; action?: string };
  }[];
  strings?: Record<string, string>;
  emptyStates?: Record<string, any>;
  featureFlags?: Record<string, boolean>;
};

const STORAGE_KEY = "bootstrap-cache-v1";

export function useBootstrapConfig(params?: {
  lang?: Lang;
  city?: string;
  channel?: "app" | "web";
}) {
  const { lang = "ar", city, channel = "app" } = params || {};
  const [data, setData] = useState<BootstrapResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const t = useCallback(
    (key: string, fallback?: string) => data?.strings?.[key] ?? fallback ?? key,
    [data?.strings]
  );

  const colors = useMemo(() => {
    const c = data?.theme?.colors || {};
    return {
      primary: c.primary || "#D84315",
      text: c.text || "#1A3052",
      background: c.background || "#FFFFFF",
    };
  }, [data?.theme]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // اقرأ الكاش أولاً
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      let cached: { version?: string; payload?: BootstrapResponse } | null =
        null;
      if (raw) {
        try {
          cached = JSON.parse(raw);
          if (cached?.payload) setData(cached.payload);
        } catch {}
      }

      // اجلب جديد مع If-None-Match + كتم أي برومبت 401 احتياطاً
      const resp = await axiosInstance.get<BootstrapResponse>(
        "/cms/bootstrap",
        {
          params: { lang, channel, ...(city ? { city } : {}) },
          headers: {
            ...(cached?.version ? { "If-None-Match": cached.version } : {}),
            "x-silent-401": "1",
          },
          // لتعتبر 304 نجاحاً وليس خطأ
          validateStatus: (s) => (s >= 200 && s < 300) || s === 304,
        }
      );

      if (resp.status === 304) {
        setLoading(false);
        return;
      }

      const payload = resp.data;
      const version =
        (resp.headers?.etag as string) ?? payload.version ?? undefined;

      setData(payload);
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version, payload })
      );
      setLoading(false);
    } catch (e: any) {
      setError(e?.message || "Unknown error");
      setLoading(false);
    }
  }, [lang, city, channel]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load, t, colors };
}
