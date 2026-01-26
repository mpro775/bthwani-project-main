import { useParams, useNavigate } from "react-router-dom";
import { Alert } from "@mui/material";
import { AdminUpsertDrawer } from "./AdminUpsertDrawer";

/**
 * AdminDetailsRoute - مسار تفاصيل المشرف
 * يفتح الـ drawer لعرض وتعديل تفاصيل المشرف المحدد
 */
export function AdminDetailsRoute({
  currentUserId,
}: {
  currentUserId?: string;
}) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // التحقق من وجود معرف صحيح
  if (!id) {
    return (
      <Alert severity="error">
        خطأ: لا يوجد معرّف للمشرف المطلوب
      </Alert>
    );
  }

  // التحقق من صحة المعرف
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return (
      <Alert severity="error">
        خطأ: معرّف المشرف غير صالح
      </Alert>
    );
  }

  return (
    <AdminUpsertDrawer
      open={true}
      id={id}
      onClose={() => navigate("/admin/admins")}
      onCreated={() => {
        // يمكن إضافة منطق إعادة تحميل إذا لزم الأمر
        navigate("/admin/admins");
      }}
      onUpdated={() => {
        // يمكن إضافة منطق إعادة تحميل إذا لزم الأمر
        navigate("/admin/admins");
      }}
      currentUserId={currentUserId}
    />
  );
}
