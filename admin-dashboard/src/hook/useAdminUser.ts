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

/** الباك يرجع البروفايل داخل data (TransformInterceptor) وبشكل role مفرد، نطبّعها لشكل الفرونت */
function normalizeProfile(raw: unknown): AdminProfile | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = String(r.id ?? r._id ?? "");
  const role = r.role ?? r.roles;
  const roles: string[] = Array.isArray(role)
    ? role.map(String)
    : role != null
      ? [String(role)]
      : [];
  const perms = r.permissions;
  const permissions: Record<string, Record<string, boolean>> =
    perms && typeof perms === "object" && !Array.isArray(perms)
      ? (perms as Record<string, Record<string, boolean>>)
      : {};
  return {
    _id: id,
    email: String(r.email ?? ""),
    username: r.fullName != null ? String(r.fullName) : r.username != null ? String(r.username) : undefined,
    roles,
    permissions,
    isActive: r.isActive as boolean | undefined,
    createdAt: r.createdAt as string | undefined,
    lastLogin: (r.lastLogin as string | null) ?? undefined,
  };
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

    // الباك يرجع { success, data: { id, email, fullName, role, permissions, ... }, meta }
    (async () => {
      try {
        const { data } = await axios.get("/admin/me");
        const profile = (data as { data?: unknown })?.data ?? (data as { admin?: unknown })?.admin;
        setUser(normalizeProfile(profile) ?? null);
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
