import axiosInstance from "@/utils/api/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

type Lang = "ar" | "en";
export type OnboardingMedia = { type: "lottie" | "image"; url: string };
export type OnboardingSlideDTO = {
  key: string;
  title?: string;
  subtitle?: string;
  media?: OnboardingMedia;
  cta?: { label?: string; action?: string };
  order?: number;
};

type ApiResponse = { version?: string; onboarding: OnboardingSlideDTO[] };

const STORAGE_KEY = "onboarding-cache-v1";

export function useOnboarding(params?: { lang?: Lang }) {
  const { lang = "ar" } = params || {};
  const [slides, setSlides] = useState<OnboardingSlideDTO[] | null>(null);
  const [version, setVersion] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1) اقرأ الكاش
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const cached = JSON.parse(raw) as {
            version?: string;
            data?: ApiResponse;
          };
          if (cached?.data?.onboarding?.length) {
            setSlides(cached.data.onboarding);
            setVersion(cached.version);
          }
        } catch {}
      }

      // 2) اجلب من السيرفر مع If-None-Match (و كتم 401)
      const resp = await axiosInstance.get<ApiResponse>("/cms/onboarding", {
        params: { lang },
        headers: {
          ...(version ? { "If-None-Match": version } : {}),
          "x-silent-401": "1",
        },
        validateStatus: (s) => (s >= 200 && s < 300) || s === 304,
      });

      if (resp.status === 304) {
        setLoading(false);
        return;
      }

      // 3) خزّن الجديد
      const nextVersion =
        (resp.headers?.etag as string) ?? resp.data.version ?? undefined;
      setSlides(resp.data.onboarding || []);
      setVersion(nextVersion);

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: nextVersion, data: resp.data })
      );

      setLoading(false);
    } catch (e: any) {
      setError(e?.message || "failed");
      setLoading(false);
    }
  }, [lang, version]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  return { slides, version, loading, error, refresh: load };
}
