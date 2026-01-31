// src/state/verify.ts
import api from "@/utils/api/axiosInstance";
import { useCallback, useEffect, useState } from "react";

export function useVerificationState() {
  const [verified, setVerified] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [authFailed, setAuthFailed] = useState<boolean>(false);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setAuthFailed(false);

      // ✅ اجعل الاستعلام صامتًا عند 401 كي لا يفتح مودال أثناء الإقلاع/الأون بوردنج
      const { data } = await api.get("/users/me", {
        headers: { "x-silent-401": "1" },
      });

      // ✅ اعتبره موثّقًا لو أي من الحقول التالية true
      const v =
        Boolean(data?.verified) ||
        Boolean(data?.emailVerified) ||
        Boolean(data?.isVerified);

      setVerified(v);
    } catch (err: any) {
      setVerified(false);
      const status = err?.response?.status;
      if (status === 401) {
        setAuthFailed(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { verified, loading, refresh, setVerified, authFailed };
}
