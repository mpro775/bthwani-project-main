// src/pages/es3afni/Es3afni.tsx - مطابق لـ app-user
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Snackbar, Alert } from "@mui/material";
import {
  Es3afniList,
  Es3afniDetails,
  Es3afniForm,
  useEs3afni,
  type Es3afniItem,
  type CreateEs3afniPayload,
  type UpdateEs3afniPayload,
} from "../../features/es3afni";

const Es3afniPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id, action } = useParams<{ id?: string; action?: string }>();
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

  // Hooks for data management
  const {
    item: currentItem,
    createItem,
    updateItem,
    deleteItem,
    loading: itemLoading,
  } = useEs3afni(id);

  // Handle view item
  const handleViewItem = (item: Es3afniItem) => {
    navigate(`/es3afni/${item._id}`);
  };

  // Handle create item - يتطلب تسجيل الدخول (مطابق لـ app-user)
  const handleCreateItem = () => {
    if (!currentUserId) {
      navigate("/login", { state: { from: "/es3afni/new" } });
      return;
    }
    navigate("/es3afni/new");
  };

  // سجّل كمتبرع - يتطلب تسجيل الدخول
  const handleDonorClick = () => {
    if (!currentUserId) {
      navigate("/login", { state: { from: "/es3afni/donor" } });
      return;
    }
    navigate("/es3afni/donor");
  };

  // Handle edit item
  const handleEditItem = (item: Es3afniItem) => {
    navigate(`/es3afni/${item._id}/edit`);
  };

  // Handle delete item
  const handleDeleteItem = async (item: Es3afniItem) => {
    if (
      window.confirm(
        `هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.`
      )
    ) {
      try {
        await deleteItem();
        setSnackbar({
          open: true,
          message: "تم حذف طلب التبرع بنجاح",
          severity: "success",
        });
        navigate("/es3afni");
      } catch (error) {
        setSnackbar({
          open: true,
          message: "فشل في حذف الطلب",
          severity: "error",
        });
      }
    }
  };

  // Handle form submit
  const handleFormSubmit = async (
    data: CreateEs3afniPayload | UpdateEs3afniPayload
  ) => {
    try {
      const isCreate = id === "new";
      if (isCreate) {
        const newItem = await createItem(data as CreateEs3afniPayload);
        setSnackbar({
          open: true,
          message: "تم إنشاء طلب التبرع بنجاح",
          severity: "success",
        });
        navigate(`/es3afni/${newItem._id}`);
      } else if (id && action === "edit" && currentItem) {
        const updatedItem = await updateItem(data as UpdateEs3afniPayload);
        setSnackbar({
          open: true,
          message: "تم تحديث طلب التبرع بنجاح",
          severity: "success",
        });
        navigate(`/es3afni/${updatedItem._id}`);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "فشل في حفظ الطلب",
        severity: "error",
      });
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate("/es3afni");
  };

  // Determine what to render based on route
  const renderContent = () => {
    // Show details page
    if (id && !action) {
      const ownerIdStr =
        currentItem &&
        (typeof currentItem.ownerId === "object" &&
        (currentItem.ownerId as { _id?: string })?._id
          ? String((currentItem.ownerId as { _id: string })._id)
          : String(currentItem.ownerId || ""));
      const isOwner = !!(
        currentUserId &&
        currentItem &&
        ownerIdStr === currentUserId
      );
      return (
        <Es3afniDetails
          item={currentItem!}
          loading={itemLoading}
          onBack={handleBack}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
          isOwner={isOwner}
        />
      );
    }

    // Show form (create/edit)
    if (id === "new" || (id && action === "edit")) {
      const isEdit = id !== "new" && action === "edit";
      const ownerId = String(currentUserId ?? "");
      return (
        <Es3afniForm
          item={isEdit ? currentItem ?? undefined : undefined}
          loading={itemLoading}
          mode={isEdit ? "edit" : "create"}
          onSubmit={handleFormSubmit}
          onCancel={handleBack}
          ownerId={ownerId}
        />
      );
    }

    // Show list page (default)
    return (
      <Es3afniList
        onViewItem={handleViewItem}
        onCreateItem={handleCreateItem}
        onDonorClick={handleDonorClick}
      />
    );
  };

  return (
    <>
      {renderContent()}

      {/* Snackbar for notifications */}
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

export default Es3afniPage;
