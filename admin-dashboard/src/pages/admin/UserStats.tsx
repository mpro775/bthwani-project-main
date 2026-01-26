// src/pages/admin/UserStatsSimple.tsx
import  { useEffect, useState } from "react";
import axios from "../../utils/axios"; // استخدم الـaxios instance الموحد
import { auth } from "../../config/firebaseConfig";

interface Stats {
  total: number;
  admins: number;
  users: number;
  active: number;
  blocked: number;
}

export default function UserStatsSimple() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    admins: 0,
    users: 0,
    active: 0,
    blocked: 0,
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError("");
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error("المستخدم غير مسجل دخول");
        }
        const token = await user.getIdToken(true);
        const res = await axios.get<Stats>("/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error(err);
        setError("فشل في تحميل الإحصائيات");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500">جاري التحميل...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">إحصائيات المستخدمين</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-4 border rounded bg-gray-50">
          <b>الإجمالي</b>
          <p>{stats.total.toLocaleString()}</p>
        </div>
        <div className="p-4 border rounded bg-gray-50">
          <b>مستخدمين</b>
          <p>{stats.users.toLocaleString()}</p>
        </div>
        <div className="p-4 border rounded bg-gray-50">
          <b>أدمن</b>
          <p>{stats.admins.toLocaleString()}</p>
        </div>
        <div className="p-4 border rounded bg-gray-50">
          <b>نشطين</b>
          <p>{stats.active.toLocaleString()}</p>
        </div>
        <div className="p-4 border rounded bg-gray-50">
          <b>معطلين</b>
          <p>{stats.blocked.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
