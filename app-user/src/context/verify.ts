// src/state/verify.ts
import api from "@/utils/api/axiosInstance";
import { useCallback, useEffect, useState } from "react";

export function useVerificationState() {
  const [verified, setVerified] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);

      // ✅ اجعل الاستعلام صامتًا عند 401 كي لا يفتح مودال أثناء الإقلاع/الأون بوردنج
      const { data } = await api.get("/users/me", {
        headers: { "x-silent-401": "1" },
        // أو يمكن استخدام فلاغ داخلي:
        // __silent401: true as any,
      });

      // ✅ اعتبره موثّقًا لو أي من الحقول التالية true
      const v =
        Boolean(data?.verified) ||
        Boolean(data?.emailVerified) ||
        Boolean(data?.isVerified);

      setVerified(v);
    } catch {
      setVerified(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { verified, loading, refresh, setVerified };
}
