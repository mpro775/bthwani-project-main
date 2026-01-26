// src/hooks/useAdminUser.ts
import { useEffect, useState } from "react";
import axios from "../utils/axios"; // نفس الانستانس اللي عندك

export interface AdminProfile {
  _id: string;
  email: string;
  username?: string;
  roles: string[]; // لازم تتضمن "superadmin" لو أنت سوبر
  permissions: Record<string, Record<string, boolean>>;
  isActive?: boolean;
  createdAt?: string;
  lastLogin?: string | null;
}

export function useAdminUser() {
  const [user, setUser] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // حاول نجيب بروفايل الأدمن من السيرفر
    (async () => {
      try {
        const { data } = await axios.get("/admin/me"); // Endpoint يرد roles & permissions
        setUser(data?.admin ?? null);
      } catch (e: unknown) {
        // ✅ فُل باك آمن للتطوير: لو 404، اعتبره سوبر أدمن مؤقتًا
        const error = e as { response?: { status?: number } };
        if (error?.response?.status === 404) {
          const raw = localStorage.getItem("adminUser");
          const bare = raw ? JSON.parse(raw) : {};
          setUser({
            _id: bare.uid || "local",
            email: bare.email || "",
            username: bare.displayName || bare.email || "admin",
            roles: ["superadmin"],                 // <-- هنا المفتاح
            permissions: {},                       // مش مهم للسوبر
            isActive: true,
          });
        } else {
          // لو فشل، جرّب قراءة نسخة خفيفة من التخزين (بدون صلاحيات)
          const raw = localStorage.getItem("adminUser");
          setUser(
            raw ? { ...JSON.parse(raw), roles: [], permissions: {} } : null
          );
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { user, loading };
}
