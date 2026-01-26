import { useNavigate } from "react-router-dom";
import { AdminUpsertDrawer } from "./AdminUpsertDrawer";

/**
 * AdminCreateRoute - مسار إنشاء مشرف جديد
 * يفتح الـ drawer لإنشاء مشرف جديد
 */
export function AdminCreateRoute({
  currentUserId,
}: {
  currentUserId?: string;
}) {
  const navigate = useNavigate();

  return (
    <AdminUpsertDrawer
      open={true}
      id={null} // null يعني إنشاء مشرف جديد
      onClose={() => navigate("/admin/admins")}
      onCreated={() => {
        // يمكن إضافة منطق إعادة تحميل إذا لزم الأمر
        navigate("/admin/admins");
      }}
      onUpdated={() => {
        // لن يتم استدعاؤها في حالة الإنشاء
        navigate("/admin/admins");
      }}
      currentUserId={currentUserId}
    />
  );
}
