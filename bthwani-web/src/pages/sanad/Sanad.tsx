// مطابق لـ app-user
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material";
import {
  SanadList,
  SanadDetails,
  SanadForm,
  useSanad,
  type SanadItem,
  type CreateSanadPayload,
  type UpdateSanadPayload,
} from "../../features/sanad";
import type { SanadStatus } from "../../features/sanad";
import { useAuth } from "../../hooks/useAuth";

const SanadPage: React.FC = () => {
  const navigate = useNavigate();
  const { id, action } = useParams<{ id?: string; action?: string }>();
  const { user } = useAuth();

  const currentUserId = user?._id ?? user?.id ?? null;

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const {
    item: currentItem,
    createItem,
    updateItem,
    deleteItem,
    loading: itemLoading,
  } = useSanad(id);

  const handleViewItem = (item: SanadItem) => {
    navigate(`/sanad/${item._id}`);
  };

  const handleCreateItem = () => {
    if (!currentUserId) {
      navigate("/login", { state: { from: "/sanad/new" } });
      return;
    }
    navigate("/sanad/new");
  };

  const handleEditItem = (item: SanadItem) => {
    navigate(`/sanad/${item._id}/edit`);
  };

  const handleDeleteItem = async (item: SanadItem) => {
    if (
      window.confirm(
        "هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء."
      )
    ) {
      try {
        await deleteItem();
        setSnackbar({
          open: true,
          message: "تم حذف الطلب بنجاح",
          severity: "success",
        });
        navigate("/sanad");
      } catch (error) {
        setSnackbar({
          open: true,
          message: "فشل في حذف الطلب",
          severity: "error",
        });
      }
    }
  };

  const handleStatusChange = async (item: SanadItem, newStatus: SanadStatus) => {
    try {
      await updateItem({ status: newStatus });
      setSnackbar({
        open: true,
        message: `تم تحديث الحالة إلى: ${getStatusText(newStatus)}`,
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "لم يتم تحديث الحالة. يرجى المحاولة مرة أخرى.",
        severity: "error",
      });
    }
  };

  const getStatusText = (status: SanadStatus) => {
    const labels: Record<SanadStatus, string> = {
      draft: "مسودة",
      pending: "في الانتظار",
      confirmed: "مؤكد",
      completed: "مكتمل",
      cancelled: "ملغي",
    };
    return labels[status] ?? status;
  };

  const handleFormSubmit = async (
    data: CreateSanadPayload | UpdateSanadPayload
  ) => {
    try {
      const isCreate = id === "new";
      if (isCreate) {
        const payload = data as CreateSanadPayload;
        payload.ownerId = String(currentUserId ?? "");
        const newItem = await createItem(payload);
        setSnackbar({
          open: true,
          message: "تم إنشاء الطلب بنجاح",
          severity: "success",
        });
        navigate(`/sanad/${newItem._id}`);
      } else if (id && action === "edit" && currentItem) {
        await updateItem(data as UpdateSanadPayload);
        setSnackbar({
          open: true,
          message: "تم تحديث الطلب بنجاح",
          severity: "success",
        });
        navigate(`/sanad/${currentItem._id}`);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "فشل في حفظ الطلب",
        severity: "error",
      });
    }
  };

  const handleBack = () => {
    navigate("/sanad");
  };

  const ownerIdStr =
    currentItem &&
    (typeof currentItem.ownerId === "object" &&
    (currentItem.ownerId as { _id?: string })?._id
      ? String((currentItem.ownerId as { _id: string })._id)
      : String(currentItem.ownerId || "");
  const isOwner = !!(currentUserId && currentItem && ownerIdStr === currentUserId);

  const renderContent = () => {
    if (id && !action) {
      return (
        <SanadDetails
          item={currentItem!}
          loading={itemLoading}
          onBack={handleBack}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
          isOwner={isOwner}
          onStatusChange={handleStatusChange}
        />
      );
    }
    if (id === "new" || (id && action === "edit")) {
      const isEdit = id !== "new" && action === "edit";
      return (
        <SanadForm
          item={isEdit ? (currentItem ?? undefined) : undefined}
          loading={itemLoading}
          mode={isEdit ? "edit" : "create"}
          onSubmit={handleFormSubmit}
          onCancel={handleBack}
          ownerId={String(currentUserId ?? "")}
        />
      );
    }
    return (
      <SanadList
        onViewItem={handleViewItem}
        onCreateItem={handleCreateItem}
      />
    );
  };

  return (
    <>
      {renderContent()}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SanadPage;
